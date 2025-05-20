
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
import { DEFAULT_DISPLAY_ATTRIBUTES, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/types/org-chart';
import { buildHierarchyTree, calculateTotalProformaCost, generateUniqueID } from '@/lib/orgChartUtils';
import { summarizeReorganizationImpact } from '@/ai/flows/summarize-reorganization-impact';
import { recommendHierarchyOptimizations } from '@/ai/flows/recommend-hierarchy-optimizations';
import { useToast } from '@/hooks/use-toast';
import { Import, FileOutput, Users, Brain, Sparkles, UserPlus, Edit3, Save, Trash2, ArrowRightLeft, Printer, ArrowUpFromLine, SearchIcon } from 'lucide-react';
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


// Sample Data (can be replaced by actual import)
const initialSampleEmployees: Employee[] = [
  { id: '1', employeeName: 'Alice Wonderland', supervisorId: null, positionTitle: 'CEO', jobName: 'Chief Executive Officer', department: 'Executive', proformaCost: 300000, employeeCategory: 'Staff', grade: 'G7', location: 'NewYork' },
  { id: '2', employeeName: 'Bob The Builder', supervisorId: '1', positionTitle: 'CTO', jobName: 'Chief Technology Officer', department: 'Technology', proformaCost: 250000, employeeCategory: 'Staff', grade: 'G6', location: 'SanFrancisco' },
  { id: '3', employeeName: 'Charlie Brown', supervisorId: '1', positionTitle: 'COO', jobName: 'Chief Operating Officer', department: 'Operations', proformaCost: 240000, employeeCategory: 'Staff', grade: 'G6', location: 'NewYork' },
  { id: '4', employeeName: 'Diana Prince', supervisorId: '2', positionTitle: 'VP Engineering', jobName: 'VP Engineering', department: 'Technology', proformaCost: 200000, employeeCategory: 'Staff', grade: 'G5', location: 'Remote' },
  { id: '5', employeeName: 'Edward Scissorhands', supervisorId: '4', positionTitle: 'Software Engineer Lead', jobName: 'Team Lead', department: 'Technology', location: 'Remote', proformaCost: 150000, employeeCategory: 'Staff', grade: 'P5' },
  { id: '6', employeeName: 'Fiona Apple', supervisorId: '4', positionTitle: 'Senior Software Engineer', jobName: 'Senior SDE', department: 'Technology', grade: 'P6', proformaCost: 140000, employeeCategory: 'Staff', location: 'Remote' },
  { id: '7', employeeName: 'Gary Goodsupport', supervisorId: '3', positionTitle: 'Support Manager', jobName: 'Support Manager', department: 'Operations', proformaCost: 90000, employeeCategory: 'PSA', grade: 'P4', location: 'London' },
  { id: '8', employeeName: 'Helen Helpful', supervisorId: '7', positionTitle: 'Support Specialist', jobName: 'Support Spec.', department: 'Operations', proformaCost: 60000, employeeCategory: 'LSC', grade: 'P2', location: 'London' },
  { id: '9', employeeName: 'Ian Intern', supervisorId: '6', positionTitle: 'Software Intern', jobName: 'Intern SDE', department: 'Technology', proformaCost: 40000, employeeCategory: 'Intern', grade: 'I1', location: 'Remote' },
  { id: '10', employeeName: 'Jack Consultant', supervisorId: '2', positionTitle: 'Cloud Architect', jobName: 'Consultant Arch.', department: 'Technology', proformaCost: 180000, employeeCategory: 'IndividualConsultant', grade: 'P3', location: 'Remote' },
  { id: '11', employeeName: 'Olivia Operator', supervisorId: '3', positionTitle: 'Operations Analyst', jobName: 'Ops Analyst', department: 'Operations', proformaCost: 80000, employeeCategory: 'Staff', grade: 'P3', location: 'NewYork' },
  { id: '12', employeeName: 'Henry Human', supervisorId: '1', positionTitle: 'VP Human Resources', jobName: 'VP HR', department: 'Human Resources', proformaCost: 190000, employeeCategory: 'Staff', grade: 'G5', location: 'NewYork' },
  { id: '13', employeeName: 'Rachel Recruiter', supervisorId: '12', positionTitle: 'HR Specialist', jobName: 'HR Spec.', department: 'Human Resources', proformaCost: 75000, employeeCategory: 'PSA', grade: 'P3', location: 'NewYork' },
  { id: '14', employeeName: 'Kevin Kandidate', supervisorId: '13', positionTitle: 'HR Intern', jobName: 'Intern HR', department: 'Human Resources', proformaCost: 35000, employeeCategory: 'Intern', grade: 'I1', location: 'NewYork' },
];


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
        children: childrenNodes,
        level: currentLevel,
        directReportCount: childrenNodes.length,
        totalReportCount: totalReportCountInFilteredBranch,
      });
    }
  });
  nodes.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
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
          emp.employeeName.toLowerCase().includes(lowerCaseSearchTerm) ||
          (emp.positionTitle && emp.positionTitle.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.jobName && emp.jobName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.department && emp.department.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.id && emp.id.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.employeeCategory && emp.employeeCategory.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.grade && emp.grade.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (emp.location && emp.location.toLowerCase().includes(lowerCaseSearchTerm))
        )
        .map(emp => emp.id)
    );
  }, [employees, searchTerm]);

 useEffect(() => {
    const newIsSearching = searchTerm.trim() !== '';
    if (newIsSearching !== isCurrentlySearching) { // Search status flipped
      setViewStack([]); // Reset drill-down when search starts or stops
      setIsCurrentlySearching(newIsSearching);
    }

    // Handle transitioning from search to specific drill-down
    if (!newIsSearching && pendingDrillDownNodeId) {
      setViewStack([pendingDrillDownNodeId]);
      setPendingDrillDownNodeId(null);
    }
  }, [searchTerm, isCurrentlySearching, pendingDrillDownNodeId]);


  const currentViewNodes = useMemo(() => {
    if (isCurrentlySearching) {
      if (!filteredEmployeeIdsForSearch || filteredEmployeeIdsForSearch.size === 0) return [];
      const searchResultTree = buildFilteredTreeForSearch(employees, filteredEmployeeIdsForSearch, null, 0, fullEmployeeMap);
      const currentSearchRootId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;

      if (!currentSearchRootId) {
        return searchResultTree;
      } else {
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
        rootNodeFromSearch = findNodeInTreeRecursive(searchResultTree, currentSearchRootId);
        // If the drilled-down node is no longer in the filtered tree, show the top of the current search results.
        return rootNodeFromSearch ? [rootNodeFromSearch] : searchResultTree; 
      }
    } else { // Not searching - normal view
      const currentRootId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
      if (!currentRootId) {
        return buildHierarchyTree(employees, null, 0);
      } else {
        const rootEmployee = fullEmployeeMap.get(currentRootId);
        if (!rootEmployee) {
          // If root employee for drill-down doesn't exist (e.g. deleted), go to top level.
          return buildHierarchyTree(employees, null, 0); 
        }
        
        // Calculate original level of the rootEmployee in the full tree
        let originalLevel = 0;
        let tempSupervisorId = rootEmployee.supervisorId;
        while(tempSupervisorId) {
          originalLevel++;
          const supervisor = fullEmployeeMap.get(tempSupervisorId);
          tempSupervisorId = supervisor ? supervisor.supervisorId : null;
        }

        const children = buildHierarchyTree(employees, rootEmployee.id, originalLevel + 1);
        const supervisor = rootEmployee.supervisorId ? fullEmployeeMap.get(rootEmployee.supervisorId) : null;

        return [{
          ...rootEmployee,
          supervisorName: supervisor?.employeeName,
          children: children,
          level: originalLevel, 
          directReportCount: children.length, 
          totalReportCount: children.reduce((acc, child) => acc + (child.totalReportCount || 0), children.length), 
        }];
      }
    }
  }, [employees, searchTerm, viewStack, filteredEmployeeIdsForSearch, isCurrentlySearching, fullEmployeeMap]);


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

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id'> | Employee) => {
    const newEmployee: Employee = {
        id: ('id' in newEmployeeData && newEmployeeData.id) ? newEmployeeData.id : generateUniqueID(),
        ...newEmployeeData,
    };

    setOriginalEmployeesForSummary([...employees]);
    setEmployees(prev => {
      const existingIndex = prev.findIndex(e => e.id === newEmployee.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newEmployee;
        toast({ title: 'Employee Updated', description: `${newEmployee.employeeName} has been updated.` });
        triggerReorganizationSummary(originalEmployeesForSummary || [], updated);
        return updated;
      }
      toast({ title: 'Employee Added', description: `${newEmployee.employeeName} has been added.` });
      triggerReorganizationSummary(originalEmployeesForSummary || [], [...prev, newEmployee]);
      return [...prev, newEmployee];
    });
    setSidebarView('controls');
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setOriginalEmployeesForSummary([...employees]);
    const updatedEmployees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    setEmployees(updatedEmployees);
    toast({ title: 'Employee Updated', description: `${updatedEmployee.employeeName}'s details updated.` });
    setEditModalOpen(false);
    setSelectedNodeId(null);
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setOriginalEmployeesForSummary([...employees]);
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (!employeeToDelete) return;

    const newSupervisorId = employeeToDelete.supervisorId;
    const updatedEmployees = employees
      .filter(e => e.id !== employeeId)
      .map(e => e.supervisorId === employeeId ? { ...e, supervisorId: newSupervisorId } : e);

    setEmployees(updatedEmployees);
    setViewStack(prevStack => {
        const newStack = prevStack.filter(id => id !== employeeId);
        // If the deleted node was the selected one, or if selected node is no longer in the list
        if (selectedNodeId === employeeId || (selectedNodeId && !updatedEmployees.find(e=>e.id === selectedNodeId))) {
            // Select the new top of the stack if stack is not empty, otherwise null
            setSelectedNodeId(newStack.length > 0 ? newStack[newStack.length -1] : null);
        }
        // If the deleted node was part of the view stack, and the new top of stack is not valid, reset view to top.
        if (prevStack.includes(employeeId) && !updatedEmployees.find(e => e.id === newStack[newStack.length -1]) && newStack.length > 0) {
            return []; 
        }
        return newStack;
    });
    
    toast({ title: 'Employee Deleted', description: `${employeeToDelete.employeeName} and their direct reports (if any) have been reassigned.` });
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const clickedEmployeeOriginal = fullEmployeeMap.get(nodeId);
    if (!clickedEmployeeOriginal) {
        console.warn(`Clicked node ${nodeId} not found in fullEmployeeMap.`);
        return;
    }
    
    // Check against the full employee list for children
    const hasChildrenInOriginalData = employees.some(emp => emp.supervisorId === nodeId);
    const isCurrentRootOfDrillDown = viewStack.length > 0 && viewStack[viewStack.length - 1] === nodeId;

    if (hasChildrenInOriginalData && !isCurrentRootOfDrillDown) {
        if (isCurrentlySearching) {
            // If searching and click a node with children, prepare to drill down after clearing search
            setPendingDrillDownNodeId(nodeId);
            setSearchTerm(''); // This will trigger useEffect to handle the drill-down
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
    // If searching and at the top of search results, clearing search takes precedence over stack pop
    if (isCurrentlySearching && viewStack.length === 0) {
        setSearchTerm(''); // This will reset viewStack via useEffect
        return;
    }
    
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
      const originalHierarchyJson = JSON.stringify(original.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}) => emp));
      const revisedHierarchyJson = JSON.stringify(revised.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}) => emp));
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
      const currentHierarchyJson = JSON.stringify(employees.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}) => emp));
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
    try {
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Error",
        description: `Could not open print dialog. ${error instanceof Error ? error.message : 'Unknown error.'} This may be due to browser restrictions in this environment.`,
        variant: "destructive",
      });
    }
  };
  
  const canGoUp = viewStack.length > 0 || (isCurrentlySearching && viewStack.length === 0);


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
                      placeholder="Search employees..." 
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
                          <UserPlus className="mr-2" /> Add Employee
                        </Button>
                      </SidebarMenuItem>
                      {selectedNodeId && (
                        <SidebarMenuItem>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full justify-start">
                                <Trash2 className="mr-2" /> Delete Selected
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the employee and reassign their direct reports to their supervisor.
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
    
