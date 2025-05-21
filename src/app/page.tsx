
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/AppHeader';
import { HierarchyVisualizer } from '@/components/org-chart/HierarchyVisualizer';
import { AttributeSelector } from '@/components/org-chart/AttributeSelector';
import { AddEmployeeForm } from '@/components/org-chart/AddEmployeeForm';
import { ImportDataModal } from '@/components/modals/ImportDataModal';
import { ExportDataModal } from '@/components/modals/ExportDataModal';
import { AiRecommendationsModal } from '@/components/modals/AiRecommendationsModal';
import { ReorganizationSummaryModal } from '@/components/modals/ReorganizationSummaryModal';
import { EditEmployeeModal } from '@/components/modals/EditEmployeeModal';
import { LogoIcon } from '@/components/icons/LogoIcon';

import type { Employee, EmployeeNode, DisplayAttributeKey, PageSize, AiRecommendationsData, ReorganizationSummaryData } from '@/types/org-chart';
import { DEFAULT_DISPLAY_ATTRIBUTES, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, PREDEFINED_GRADES, PREDEFINED_LOCATIONS, EMPLOYEE_CATEGORIES } from '@/types/org-chart';
import { buildHierarchyTree, calculateTotalProformaCost, generateUniqueID } from '@/lib/orgChartUtils';
import { summarizeReorganizationImpact } from '@/ai/flows/summarize-reorganization-impact';
import { recommendHierarchyOptimizations } from '@/ai/flows/recommend-hierarchy-optimizations';
import { useToast } from '@/hooks/use-toast';
import { Import, FileOutput, Users, Brain, ArrowRightLeft, UserPlus, Edit3, Save, Trash2, Printer, ArrowUpFromLine, SearchIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Step 1: Define the raw employee data without the derived supervisorPositionNumber, id, grade, location
const rawInitialEmployees: Omit<Employee, 'supervisorPositionNumber' | 'id' | 'grade' | 'location'>[] = [
  { employeeName: 'Alice Wonderland', supervisorId: null, positionTitle: 'CEO', jobName: 'Chief Executive Officer', department: 'Executive', proformaCost: 300000, employeeCategory: 'Staff', positionNumber: 'POS001' },
  { employeeName: 'Bob The Builder', supervisorId: '1', positionTitle: 'CTO', jobName: 'Chief Technology Officer', department: 'Technology', proformaCost: 250000, employeeCategory: 'Staff', positionNumber: 'POS002' },
  { employeeName: 'Charlie Brown', supervisorId: '1', positionTitle: 'COO', jobName: 'Chief Operating Officer', department: 'Operations', proformaCost: 240000, employeeCategory: 'Staff', positionNumber: 'POS003' },
  { employeeName: 'Diana Prince', supervisorId: '2', positionTitle: 'VP Engineering', jobName: 'VP Engineering', department: 'Technology', proformaCost: 200000, employeeCategory: 'Staff', positionNumber: 'POS004' },
  { employeeName: 'Edward Scissorhands', supervisorId: '4', positionTitle: 'Software Engineer Lead', jobName: 'Team Lead', department: 'Technology', proformaCost: 150000, employeeCategory: 'Staff', positionNumber: 'POS005' },
  { employeeName: 'Fiona Apple', supervisorId: '4', positionTitle: 'Senior Software Engineer', jobName: 'Senior SDE', department: 'Technology', proformaCost: 140000, employeeCategory: 'Staff', positionNumber: 'POS006' },
  { employeeName: 'Gary Goodsupport', supervisorId: '3', positionTitle: 'Support Manager', jobName: 'Support Manager', department: 'Operations', proformaCost: 90000, employeeCategory: 'PSA', positionNumber: 'POS007' },
  { employeeName: 'Helen Helpful', supervisorId: '7', positionTitle: 'Support Specialist', jobName: 'Support Spec.', department: 'Operations', proformaCost: 60000, employeeCategory: 'LSC', positionNumber: 'POS008' },
  { employeeName: 'Ian Intern', supervisorId: '6', positionTitle: 'Software Intern', jobName: 'Intern SDE', department: 'Technology', proformaCost: 40000, employeeCategory: 'Intern', positionNumber: 'POS009' },
  { employeeName: 'Jack Consultant', supervisorId: '2', positionTitle: 'Cloud Architect', jobName: 'Consultant Arch.', department: 'Technology', proformaCost: 180000, employeeCategory: 'IndividualConsultant', positionNumber: 'POS010' },
  { employeeName: 'Olivia Operator', supervisorId: '3', positionTitle: 'Operations Analyst', jobName: 'Ops Analyst', department: 'Operations', proformaCost: 80000, employeeCategory: 'Staff', positionNumber: 'POS011' },
  { employeeName: 'Henry Human', supervisorId: '1', positionTitle: 'VP Human Resources', jobName: 'VP HR', department: 'Human Resources', proformaCost: 190000, employeeCategory: 'Staff', positionNumber: 'POS012' },
  { employeeName: 'Rachel Recruiter', supervisorId: '12', positionTitle: 'HR Specialist', jobName: 'HR Spec.', department: 'Human Resources', proformaCost: 75000, employeeCategory: 'PSA', positionNumber: 'POS013' },
  { employeeName: 'Kevin Kandidate', supervisorId: '13', positionTitle: 'HR Intern', jobName: 'Intern HR', department: 'Human Resources', proformaCost: 35000, employeeCategory: 'Intern', positionNumber: 'POS014' },
  // Vacant Positions
  { employeeName: null, supervisorId: '4', positionTitle: 'Senior Product Manager', jobName: 'Senior PM', department: 'Technology', proformaCost: 160000, employeeCategory: 'N/A', positionNumber: 'POS015' },
  { employeeName: null, supervisorId: '12', positionTitle: 'Compensation Analyst', jobName: 'Comp Analyst', department: 'Human Resources', proformaCost: 85000, employeeCategory: 'N/A', positionNumber: 'POS016' },
  // New Vacant Positions
  { employeeName: null, supervisorId: '2', positionTitle: 'Vacant Technical Lead', jobName: 'Vacant Tech Lead', department: 'Technology', proformaCost: 170000, employeeCategory: 'N/A', positionNumber: 'POS017' },
  { employeeName: null, supervisorId: '3', positionTitle: 'Vacant Project Manager', jobName: 'Vacant PM', department: 'Operations', proformaCost: 100000, employeeCategory: 'N/A', positionNumber: 'POS018' },
  { employeeName: null, supervisorId: '4', positionTitle: 'Vacant QA Engineer', jobName: 'Vacant QA', department: 'Technology', proformaCost: 95000, employeeCategory: 'N/A', positionNumber: 'POS019' },
  { employeeName: null, supervisorId: '12', positionTitle: 'Vacant HR Business Partner', jobName: 'Vacant HRBP', department: 'Human Resources', proformaCost: 110000, employeeCategory: 'N/A', positionNumber: 'POS020' },
  { employeeName: null, supervisorId: '5', positionTitle: 'Vacant Junior Developer', jobName: 'Vacant Jr. Dev', department: 'Technology', proformaCost: 70000, employeeCategory: 'N/A', positionNumber: 'POS021' },
  { employeeName: null, supervisorId: '7', positionTitle: 'Vacant Support Agent', jobName: 'Vacant Agent', department: 'Operations', proformaCost: 50000, employeeCategory: 'N/A', positionNumber: 'POS022' },
];

// Assign unique IDs, grades, and locations to raw employees and build a map for supervisor lookup
const rawEmployeesWithIdsAndRequiredFields: Omit<Employee, 'supervisorPositionNumber'>[] = rawInitialEmployees.map((emp, index) => {
  const defaultGrade = PREDEFINED_GRADES[0]?.value || 'P1';
  const defaultLocation = PREDEFINED_LOCATIONS[0]?.value || 'Remote';

  let grade = defaultGrade;
  let location = defaultLocation;

  // Explicit Grade and Location assignments
  if (emp.positionNumber === 'POS001') { grade = 'SG'; location = 'NewYork'; } // Alice
  else if (emp.positionNumber === 'POS002') { grade = 'ASG'; location = 'SanFrancisco'; } // Bob
  else if (emp.positionNumber === 'POS003') { grade = 'ASG'; location = 'NewYork'; } // Charlie
  else if (emp.positionNumber === 'POS004') { grade = 'D2'; location = 'Remote'; } // Diana
  else if (emp.positionNumber === 'POS005') { grade = 'P7'; location = 'Remote'; } // Edward
  else if (emp.positionNumber === 'POS006') { grade = 'P6'; location = 'Remote'; } // Fiona
  else if (emp.positionNumber === 'POS007') { grade = 'P4'; location = 'London'; } // Gary
  else if (emp.positionNumber === 'POS008') { grade = 'G6'; location = 'London'; } // Helen
  else if (emp.positionNumber === 'POS009') { grade = 'I2'; location = 'Remote'; } // Ian
  else if (emp.positionNumber === 'POS010') { grade = 'P5'; location = 'Remote'; } // Jack
  else if (emp.positionNumber === 'POS011') { grade = 'P3'; location = 'NewYork'; } // Olivia
  else if (emp.positionNumber === 'POS012') { grade = 'D1'; location = 'NewYork'; } // Henry
  else if (emp.positionNumber === 'POS013') { grade = 'G7'; location = 'NewYork'; } // Rachel
  else if (emp.positionNumber === 'POS014') { grade = 'I1'; location = 'NewYork'; } // Kevin
  else if (emp.positionNumber === 'POS015') { grade = 'P6'; location = 'SanFrancisco'; } // Vacant Sr PM
  else if (emp.positionNumber === 'POS016') { grade = 'P3'; location = 'NewYork'; } // Vacant Comp Analyst
  // Grades and Locations for new vacant positions
  else if (emp.positionNumber === 'POS017') { grade = 'P6'; location = 'Remote'; } // Vacant Tech Lead
  else if (emp.positionNumber === 'POS018') { grade = 'P4'; location = 'NewYork'; } // Vacant PM
  else if (emp.positionNumber === 'POS019') { grade = 'P3'; location = 'Remote'; } // Vacant QA
  else if (emp.positionNumber === 'POS020') { grade = 'P4'; location = 'NewYork'; } // Vacant HRBP
  else if (emp.positionNumber === 'POS021') { grade = 'P1'; location = 'Remote'; } // Vacant Jr. Dev
  else if (emp.positionNumber === 'POS022') { grade = 'G4'; location = 'London'; } // Vacant Agent
  
  return {
    ...emp,
    id: (index + 1).toString(), // Assign sequential ID based on position in the array
    grade: grade,
    location: location,
  };
});


const employeeIdMapForSetup = new Map(rawEmployeesWithIdsAndRequiredFields.map(emp => [emp.id, emp]));

// Step 2: Map over the raw data to create the final initialSampleEmployees, deriving supervisorPositionNumber
const initialSampleEmployees: Employee[] = rawEmployeesWithIdsAndRequiredFields.map(emp => {
  const supervisor = emp.supervisorId ? employeeIdMapForSetup.get(emp.supervisorId) : null;
  return {
    ...emp,
    supervisorPositionNumber: supervisor ? supervisor.positionNumber : null,
  };
});


const buildFilteredTreeForSearch = (
  allEmployees: Employee[],
  matchingEmployeeIds: Set<string>,
  currentSupervisorId: string | null,
  currentLevel: number,
  fullEmployeeMap: Map<string, Employee>
): EmployeeNode[] => {
  const nodes: EmployeeNode[] = [];
  const childrenOfSupervisor = allEmployees.filter(e => e.supervisorId === currentSupervisorId);

  childrenOfSupervisor.forEach(employee => {
    const childrenNodes = buildFilteredTreeForSearch(
      allEmployees,
      matchingEmployeeIds,
      employee.id,
      currentLevel + 1,
      fullEmployeeMap
    );

    if (matchingEmployeeIds.has(employee.id) || childrenNodes.length > 0) {
      const supervisor = employee.supervisorId ? fullEmployeeMap.get(employee.supervisorId) : null;
      let totalReportCountInFilteredBranch = childrenNodes.length;
      childrenNodes.forEach(child => {
        totalReportCountInFilteredBranch += child.totalReportCount || 0;
      });

      nodes.push({
        ...employee,
        supervisorName: supervisor?.employeeName,
        supervisorPositionNumber: supervisor?.positionNumber,
        children: childrenNodes,
        level: currentLevel,
        directReportCount: childrenNodes.length,
        totalReportCount: totalReportCountInFilteredBranch,
      });
    }
  });
  nodes.sort((a, b) => (a.employeeName || a.positionTitle || '').localeCompare(b.employeeName || b.positionTitle || ''));
  return nodes;
};


export default function OrgWeaverPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialSampleEmployees);
  const [originalEmployeesForSummary, setOriginalEmployeesForSummary] = useState<Employee[] | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<DisplayAttributeKey[]>(DEFAULT_DISPLAY_ATTRIBUTES);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [aiRecommendations, setAiRecommendations] = useState<AiRecommendationsData | null>(null);
  const [reorgSummary, setReorgSummary] = useState<ReorganizationSummaryData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<'controls' | 'addEmployee' | 'editEmployee'>('controls');
  const [viewStack, setViewStack] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCurrentlySearching, setIsCurrentlySearching] = useState(false);
  const [pendingDrillDownNodeId, setPendingDrillDownNodeId] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);


  const { toast } = useToast();

  const fullEmployeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

  const filteredEmployeeIdsForSearch = useMemo(() => {
    if (!searchTerm.trim()) {
      return null;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return new Set(
      employees
        .filter(emp =>
          (emp.employeeName && emp.employeeName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.positionTitle && emp.positionTitle.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.jobName && emp.jobName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.department && emp.department.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.id && emp.id.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.positionNumber && emp.positionNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.employeeCategory && emp.employeeCategory.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.grade && emp.grade.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.location && emp.location.toLowerCase().includes(lowerCaseSearchTerm))
        )
        .map(emp => emp.id)
    );
  }, [employees, searchTerm]);

 useEffect(() => {
    const newIsSearching = searchTerm.trim() !== '';
    if (newIsSearching !== isCurrentlySearching) {
        setViewStack([]); // Reset drill-down when search status flips
        setIsCurrentlySearching(newIsSearching);
    }

    if (!newIsSearching && pendingDrillDownNodeId) { // If search was just cleared and we have a pending drill-down
        const employeeExists = fullEmployeeMap.has(pendingDrillDownNodeId);
        if (employeeExists) {
            setViewStack([pendingDrillDownNodeId]);
        } else {
            setViewStack([]); // Fallback if pending node doesn't exist
        }
        setPendingDrillDownNodeId(null);
    }
  }, [searchTerm, isCurrentlySearching, pendingDrillDownNodeId, fullEmployeeMap]);


  const currentViewNodes = useMemo(() => {
    const currentRootIdFromStack = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
    const sourceEmployees = employees; // Use the full list of employees as the source

    if (isCurrentlySearching) {
      if (!filteredEmployeeIdsForSearch || filteredEmployeeIdsForSearch.size === 0) return [];
      
      let searchResultTreeRoots = buildFilteredTreeForSearch(sourceEmployees, filteredEmployeeIdsForSearch, null, 0, fullEmployeeMap);

      if (!currentRootIdFromStack) { // No drill-down within search results
        return searchResultTreeRoots;
      } else { // Drilled down within search results
          let rootNodeFromSearch: EmployeeNode | null = null;
          const findNodeInTreeRecursive = (nodesToSearch: EmployeeNode[], id: string): EmployeeNode | null => {
            for (const node of nodesToSearch) {
              if (node.id === id) return node;
              if (node.children) {
                const found = findNodeInTreeRecursive(node.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          rootNodeFromSearch = findNodeInTreeRecursive(searchResultTreeRoots, currentRootIdFromStack);
          return rootNodeFromSearch ? [rootNodeFromSearch] : searchResultTreeRoots; 
      }
    }
    
    // Not searching: Normal view or Print view
    if (!currentRootIdFromStack) { // Top level (e.g., Alice)
      const topLevelNodes = buildHierarchyTree(sourceEmployees, null, 0, fullEmployeeMap);
      if (isPrinting) {
        return topLevelNodes; // Print full hierarchy from all top-level nodes
      }
      // Normal view: Prune grandchildren of top-level nodes
      return topLevelNodes.map(node => ({
        ...node,
        children: node.children.map(directChild => ({ ...directChild, children: [] }))
      }));
    } else { // Drilled-down view (e.g., viewing Bob's team)
      const rootEmployee = fullEmployeeMap.get(currentRootIdFromStack);
      if (!rootEmployee) return []; 

      let originalLevel = 0;
      let tempSupervisorId = rootEmployee.supervisorId;
      while(tempSupervisorId) {
        originalLevel++;
        const supervisor = fullEmployeeMap.get(tempSupervisorId);
        tempSupervisorId = supervisor ? supervisor.supervisorId : null;
      }
      
      if (isPrinting) {
        // Build the full subtree for this root employee for printing
        const fullSubTreeForRoot = buildHierarchyTree(sourceEmployees, rootEmployee.id, originalLevel + 1, fullEmployeeMap);
        const rootNodeWithFullChildren: EmployeeNode = {
          ...rootEmployee,
          supervisorName: rootEmployee.supervisorId ? fullEmployeeMap.get(rootEmployee.supervisorId)?.employeeName : undefined,
          supervisorPositionNumber: rootEmployee.supervisorId ? fullEmployeeMap.get(rootEmployee.supervisorId)?.positionNumber : null,
          children: fullSubTreeForRoot, // Attach full children tree
          level: originalLevel,
          directReportCount: fullSubTreeForRoot.length,
          totalReportCount: fullSubTreeForRoot.reduce((acc, child) => acc + (child.totalReportCount || 0), fullSubTreeForRoot.length),
        };
        return [rootNodeWithFullChildren];
      }

      // Normal view: Build subtree but prune its grandchildren
      const directChildrenSubTree = buildHierarchyTree(sourceEmployees, rootEmployee.id, originalLevel + 1, fullEmployeeMap);
      const rootNodeWithPrunedChildren: EmployeeNode = {
        ...rootEmployee,
        supervisorName: rootEmployee.supervisorId ? fullEmployeeMap.get(rootEmployee.supervisorId)?.employeeName : undefined,
        supervisorPositionNumber: rootEmployee.supervisorId ? fullEmployeeMap.get(rootEmployee.supervisorId)?.positionNumber : null,
        children: directChildrenSubTree.map(directChild => ({ ...directChild, children: [] })), // Prune here
        level: originalLevel,
        directReportCount: directChildrenSubTree.length,
        totalReportCount: directChildrenSubTree.reduce((acc, child) => acc + (child.totalReportCount || 0), directChildrenSubTree.length),
      };
      return [rootNodeWithPrunedChildren];
    }
  }, [employees, searchTerm, viewStack, filteredEmployeeIdsForSearch, isCurrentlySearching, fullEmployeeMap, isPrinting]);


  const currentEditingEmployee = useMemo(() => {
    return selectedNodeId ? employees.find(e => e.id === selectedNodeId) || null : null;
  }, [employees, selectedNodeId]);


  const handleImportData = (data: Employee[], fileName: string) => {
    const currentEmployeesForSummary = employees.length > 0 ? [...employees] : initialSampleEmployees;
    setOriginalEmployeesForSummary(currentEmployeesForSummary);
    setEmployees(data);
    setViewStack([]);
    setSearchTerm('');
    toast({ title: 'Data Imported', description: `Imported ${data.length} employees from ${fileName}.` });
    triggerReorganizationSummary(currentEmployeesForSummary, data);
  };

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id' | 'supervisorPositionNumber'> | Employee) => {
    const supervisor = newEmployeeData.supervisorId ? fullEmployeeMap.get(newEmployeeData.supervisorId) : null;
    const employeeName = newEmployeeData.employeeName?.trim() ? newEmployeeData.employeeName.trim() : null;

    const newEmployee: Employee = {
        id: ('id' in newEmployeeData && newEmployeeData.id) ? newEmployeeData.id : generateUniqueID(),
        ...newEmployeeData,
        employeeName: employeeName,
        supervisorPositionNumber: supervisor ? supervisor.positionNumber : null,
        grade: newEmployeeData.grade, 
        location: newEmployeeData.location,
    };

    setOriginalEmployeesForSummary([...employees]);
    setEmployees(prev => {
      const existingIndex = prev.findIndex(e => e.id === newEmployee.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newEmployee;
        toast({ title: 'Position Updated', description: `Position ${newEmployee.positionTitle} has been updated.` });
        triggerReorganizationSummary(originalEmployeesForSummary || [], updated);
        return updated;
      }
      toast({ title: 'Position Added', description: `Position ${newEmployee.positionTitle} has been added.` });
      triggerReorganizationSummary(originalEmployeesForSummary || [], [...prev, newEmployee]);
      return [...prev, newEmployee];
    });
    setSidebarView('controls');
  };

  const handleUpdateEmployee = (updatedEmployeeData: Employee) => {
    setOriginalEmployeesForSummary([...employees]);
    const supervisor = updatedEmployeeData.supervisorId ? fullEmployeeMap.get(updatedEmployeeData.supervisorId) : null;
    const employeeName = updatedEmployeeData.employeeName?.trim() ? updatedEmployeeData.employeeName.trim() : null;
    
    const employeeWithSupervisorPos = {
      ...updatedEmployeeData,
      employeeName: employeeName,
      supervisorPositionNumber: supervisor ? supervisor.positionNumber : null,
      grade: updatedEmployeeData.grade,
      location: updatedEmployeeData.location,
    };
    const updatedEmployees = employees.map(e => e.id === employeeWithSupervisorPos.id ? employeeWithSupervisorPos : e);
    setEmployees(updatedEmployees);
    toast({ title: 'Position Updated', description: `Position ${employeeWithSupervisorPos.positionTitle} details updated.` });
    setEditModalOpen(false);
    setSelectedNodeId(null);
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setOriginalEmployeesForSummary([...employees]);
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (!employeeToDelete) return;

    const newSupervisorId = employeeToDelete.supervisorId;
    const newSupervisorPositionNumber = employeeToDelete.supervisorPositionNumber;

    const updatedEmployees = employees
      .filter(e => e.id !== employeeId)
      .map(e => e.supervisorId === employeeId ? { ...e, supervisorId: newSupervisorId, supervisorPositionNumber: newSupervisorPositionNumber } : e);

    setEmployees(updatedEmployees);
    setViewStack(prevStack => {
        const newStack = prevStack.filter(id => id !== employeeId);
        if (selectedNodeId === employeeId || (selectedNodeId && !updatedEmployees.find(e=>e.id === selectedNodeId))) {
            setSelectedNodeId(newStack.length > 0 ? newStack[newStack.length -1] : null);
        }
        if (prevStack.includes(employeeId) && !updatedEmployees.find(e => e.id === newStack[newStack.length -1]) && newStack.length > 0) {
            return [];
        }
        return newStack;
    });

    toast({ title: 'Position Deleted', description: `Position ${employeeToDelete.positionTitle} and any direct reports have been reassigned or affected.` });
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId); // Select node regardless of drill-down
    const clickedEmployeeOriginal = fullEmployeeMap.get(nodeId);
    if (!clickedEmployeeOriginal) return;

    // Check if the employee has children in the *original complete dataset*
    const hasChildrenInOriginalData = employees.some(emp => emp.supervisorId === nodeId);
    const isCurrentRootOfDrillDown = viewStack.length > 0 && viewStack[viewStack.length - 1] === nodeId;

    if (hasChildrenInOriginalData && !isCurrentRootOfDrillDown) {
        if (isCurrentlySearching) {
            // If searching, set pending and clear search to transition to normal drill-down view
            setPendingDrillDownNodeId(nodeId);
            setSearchTerm(''); // This will trigger useEffect to handle the transition
        } else {
            // Not searching, normal drill-down
            setViewStack(prevStack => [...prevStack, nodeId]);
        }
    }
  };


  const handleEditEmployeeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditModalOpen(true);
  };


  const handleGoUp = () => {
    if (isCurrentlySearching && viewStack.length === 0) {
        // If at the top level of search results, clearing search term goes to full top level.
        setSearchTerm(''); 
        return;
    }
    // Otherwise, just pop from viewStack (works for both normal and search drill-down)
    const newStack = viewStack.slice(0, -1);
    setViewStack(newStack);
    setSelectedNodeId(newStack.length > 0 ? newStack[newStack.length - 1] : null);
  };


  const triggerReorganizationSummary = async (original: Employee[] | null, revised: Employee[]) => {
    if (!original || original.length === 0) {
      const currentCost = calculateTotalProformaCost(revised);
      const jobsCovered = Array.from(new Set(revised.map(e => e.jobName || 'N/A').filter(Boolean)));
      setReorgSummary({
        summary: "Initial organization structure loaded or no previous version for comparison.",
        costChange: currentCost,
        jobsAdded: jobsCovered,
        jobsRemoved: [],
        jobsCovered: jobsCovered,
      });
      setSummaryModalOpen(true);
      return;
    }

    setIsLoadingAi(true);
    setSummaryModalOpen(true);
    try {
      const originalHierarchyJson = JSON.stringify(original.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}: any) => emp));
      const revisedHierarchyJson = JSON.stringify(revised.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}: any) => emp));
      const summary = await summarizeReorganizationImpact({
        originalHierarchy: originalHierarchyJson,
        revisedHierarchy: revisedHierarchyJson,
      });
      setReorgSummary(summary);
    } catch (error) {
      console.error("Error fetching reorg summary:", error);
      toast({ title: 'AI Summary Error', description: 'Could not generate reorganization summary.', variant: 'destructive' });
      setReorgSummary(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGetAiRecommendations = async () => {
    if (employees.length === 0) {
      toast({ title: 'No Data', description: 'Please import or add employee data first.', variant: 'destructive' });
      return;
    }
    setIsLoadingAi(true);
    setAiModalOpen(true);
    try {
      const currentHierarchyJson = JSON.stringify(employees.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}: any) => emp));
      const organizationalGoals = "Improve efficiency, clarify reporting lines, and optimize costs.";
      const recommendations = await recommendHierarchyOptimizations({
        organizationHierarchy: currentHierarchyJson,
        organizationalGoals,
      });
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      toast({ title: 'AI Recommendation Error', description: 'Could not generate AI recommendations.', variant: 'destructive' });
      setAiRecommendations(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveVersion = () => {
    localStorage.setItem(`orgWeaverVersion_${new Date().toISOString()}`, JSON.stringify(employees));
    toast({
      title: "Version Saved",
      description: "Current organization structure has been saved locally.",
    });
  };

  const handlePrintChart = () => {
    setIsPrinting(true);
    // Use a timeout to help ensure the DOM updates before print dialog
    setTimeout(() => {
      try {
        window.print();
      } catch (error) {
          console.error("Print error:", error);
          toast({
            title: "Print Error",
            description: `Could not open print dialog. ${error instanceof Error ? error.message : 'Unknown error.'} This may be due to browser restrictions.`,
            variant: "destructive",
          });
      } finally {
        // Reset isPrinting state after a short delay,
        // allowing print dialog to process/close.
        setTimeout(() => {
            setIsPrinting(false);
        }, 100); 
      }
    }, 100); // 100ms delay before calling window.print()
  };

  const canGoUp = viewStack.length > 0 || (isCurrentlySearching && viewStack.length === 0 && searchTerm.length > 0);


  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" collapsible="icon" className="bg-sidebar border-sidebar-border">
        <SidebarHeader>
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]/sidebar:justify-center">
            <LogoIcon className="size-6 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]/sidebar:hidden">
              OrgWeaver
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent asChild>
          <ScrollArea className="h-full">
            {sidebarView === 'controls' && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center">
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarInput
                      type="text"
                      placeholder="Search positions/employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>Data Management</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={() => setImportModalOpen(true)}>
                          <Import className="mr-2" /> Import Data
                        </Button>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={() => setExportModalOpen(true)}>
                          <FileOutput className="mr-2" /> Export Data
                        </Button>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={handleSaveVersion}>
                           <Save className="mr-2" /> Save Version
                        </Button>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={handlePrintChart}>
                           <Printer className="mr-2" /> Print Chart
                        </Button>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                 <SidebarGroup>
                  <SidebarGroupLabel>View Options</SidebarGroupLabel>
                  <SidebarGroupContent>
                   <AttributeSelector selectedAttributes={selectedAttributes} onSelectionChange={setSelectedAttributes} />
                    <div className="mt-4">
                      <Label htmlFor="page-size-select">Page Size</Label>
                      <Select value={pageSize} onValueChange={(value) => setPageSize(value as PageSize)}>
                        <SelectTrigger id="page-size-select" className="w-full mt-1">
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>Actions</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                       <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={() => setSidebarView('addEmployee')}>
                          <UserPlus className="mr-2" /> Add Position
                        </Button>
                      </SidebarMenuItem>
                      {selectedNodeId && (
                        <SidebarMenuItem>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full justify-start">
                                <Trash2 className="mr-2" /> Delete Selected Position
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the position and reassign any direct reports to its supervisor.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEmployee(selectedNodeId)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </SidebarMenuItem>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Button variant="outline" className="w-full justify-start" onClick={handleGetAiRecommendations}>
                          <Brain className="mr-2" /> Get Recommendations
                        </Button>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => triggerReorganizationSummary(originalEmployeesForSummary || initialSampleEmployees, employees)}
                          disabled={!originalEmployeesForSummary && employees.length === initialSampleEmployees.length}
                        >
                          <ArrowRightLeft className="mr-2" /> View Reorg Summary
                        </Button>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
            {sidebarView === 'addEmployee' && (
              <AddEmployeeForm
                onSubmit={handleAddEmployee}
                allEmployees={employees}
                onCancel={() => setSidebarView('controls')}
              />
            )}
             {sidebarView === 'editEmployee' && currentEditingEmployee && (
              <AddEmployeeForm
                onSubmit={handleUpdateEmployee}
                existingEmployee={currentEditingEmployee}
                allEmployees={employees}
                onCancel={() => { setSidebarView('controls'); setSelectedNodeId(null); }}
              />
            )}
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]/sidebar:hidden">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OrgWeaver
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader onGoUp={handleGoUp} canGoUp={canGoUp} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <HierarchyVisualizer
            nodes={currentViewNodes}
            selectedAttributes={selectedAttributes}
            onSelectNode={handleNodeClick}
            onEditClick={handleEditEmployeeClick}
            selectedNodeId={selectedNodeId}
            pageSize={pageSize}
            isPrinting={isPrinting}
          />
        </main>
      </SidebarInset>

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportData}
      />
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
        employees={employees}
      />
      <AiRecommendationsModal
        isOpen={isAiModalOpen}
        onClose={() => setAiModalOpen(false)}
        recommendationsData={aiRecommendations}
        isLoading={isLoadingAi}
      />
      <ReorganizationSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summaryData={reorgSummary}
        isLoading={isLoadingAi}
      />
       {currentEditingEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedNodeId(null);
          }}
          employee={currentEditingEmployee}
          allEmployees={employees}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}
    </SidebarProvider>
  );
}

