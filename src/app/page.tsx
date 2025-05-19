
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

import type { Employee, EmployeeNode, DisplayAttributeKey, ReorganizationSummaryData, AiRecommendationsData, PageSize } from '@/types/org-chart';
import { DEFAULT_DISPLAY_ATTRIBUTES, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, EMPLOYEE_CATEGORIES } from '@/types/org-chart';
import { buildHierarchyTree, calculateTotalProformaCost } from '@/lib/orgChartUtils';
import { summarizeReorganizationImpact } from '@/ai/flows/summarize-reorganization-impact';
import { recommendHierarchyOptimizations } from '@/ai/flows/recommend-hierarchy-optimizations';
import { useToast } from '@/hooks/use-toast';
import { Import, FileOutput, Users, Brain, Sparkles, UserPlus, Edit3, Save, Trash2, ArrowRightLeft, Printer, ArrowUpFromLine, Tag, SearchIcon } from 'lucide-react';
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
  { id: '1', employeeName: 'Alice Wonderland', supervisorId: null, positionTitle: 'CEO', jobName: 'Chief Executive Officer', department: 'Executive', proformaCost: 300000, employeeCategory: 'Staff' },
  { id: '2', employeeName: 'Bob The Builder', supervisorId: '1', positionTitle: 'CTO', jobName: 'Chief Technology Officer', department: 'Technology', proformaCost: 250000, employeeCategory: 'Staff' },
  { id: '3', employeeName: 'Charlie Brown', supervisorId: '1', positionTitle: 'COO', jobName: 'Chief Operating Officer', department: 'Operations', proformaCost: 240000, employeeCategory: 'Staff' },
  { id: '4', employeeName: 'Diana Prince', supervisorId: '2', positionTitle: 'VP Engineering', jobName: 'VP Engineering', department: 'Technology', proformaCost: 200000, employeeCategory: 'Staff' },
  { id: '5', employeeName: 'Edward Scissorhands', supervisorId: '4', positionTitle: 'Software Engineer Lead', jobName: 'Team Lead', department: 'Technology', location: 'Remote', proformaCost: 150000, employeeCategory: 'Staff' },
  { id: '6', employeeName: 'Fiona Apple', supervisorId: '4', positionTitle: 'Senior Software Engineer', jobName: 'Senior SDE', department: 'Technology', grade: 'L6', proformaCost: 140000, employeeCategory: 'Staff' },
  { id: '7', employeeName: 'Gary Goodsupport', supervisorId: '3', positionTitle: 'Support Manager', jobName: 'Support Manager', department: 'Operations', proformaCost: 90000, employeeCategory: 'PSA' },
  { id: '8', employeeName: 'Helen Helpful', supervisorId: '7', positionTitle: 'Support Specialist', jobName: 'Support Spec.', department: 'Operations', proformaCost: 60000, employeeCategory: 'LSC' },
  { id: '9', employeeName: 'Ian Intern', supervisorId: '6', positionTitle: 'Software Intern', jobName: 'Intern SDE', department: 'Technology', proformaCost: 40000, employeeCategory: 'Intern' },
  { id: '10', employeeName: 'Jack Consultant', supervisorId: '2', positionTitle: 'Cloud Architect', jobName: 'Consultant Arch.', department: 'Technology', proformaCost: 180000, employeeCategory: 'IndividualConsultant' },
  { id: '11', employeeName: 'Olivia Operator', supervisorId: '3', positionTitle: 'Operations Analyst', jobName: 'Ops Analyst', department: 'Operations', proformaCost: 80000, employeeCategory: 'Staff' },
  { id: '12', employeeName: 'Henry Human', supervisorId: '1', positionTitle: 'VP Human Resources', jobName: 'VP HR', department: 'Human Resources', proformaCost: 190000, employeeCategory: 'Staff' },
  { id: '13', employeeName: 'Rachel Recruiter', supervisorId: '12', positionTitle: 'HR Specialist', jobName: 'HR Spec.', department: 'Human Resources', proformaCost: 75000, employeeCategory: 'Staff' },
  { id: '14', employeeName: 'Kevin Kandidate', supervisorId: '13', positionTitle: 'HR Intern', jobName: 'Intern HR', department: 'Human Resources', proformaCost: 35000, employeeCategory: 'Intern' },
];


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
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const { toast } = useToast();

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return employees;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return employees.filter(emp =>
      emp.employeeName.toLowerCase().includes(lowerCaseSearchTerm) ||
      (emp.positionTitle && emp.positionTitle.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.jobName && emp.jobName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.department && emp.department.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.id && emp.id.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.employeeCategory && emp.employeeCategory.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.grade && emp.grade.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (emp.location && emp.location.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [employees, searchTerm]);

  // Reset view stack if search term is active
  useEffect(() => {
    if (searchTerm.trim()) {
      setViewStack([]);
      setSelectedNodeId(null);
    }
  }, [searchTerm]);


  const currentViewNodes = useMemo(() => {
    const sourceEmployees = searchTerm.trim() ? filteredEmployees : employees;
    const currentRootId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;

    if (!currentRootId) {
      // Sort top-level employees alphabetically by name
      const topLevelEmployees = sourceEmployees.filter(e => !e.supervisorId);
      topLevelEmployees.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
      
      return topLevelEmployees.map(emp => buildHierarchyTree(sourceEmployees, emp.id, 0)[0]).filter(Boolean);

    } else {
      const rootEmployee = sourceEmployees.find(e => e.id === currentRootId);
      if (!rootEmployee) {
        setViewStack([]); // Reset stack if root employee not found in current source
         // Sort top-level employees alphabetically by name if resetting
        const topLevelEmployees = sourceEmployees.filter(e => !e.supervisorId);
        topLevelEmployees.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
        return topLevelEmployees.map(emp => buildHierarchyTree(sourceEmployees, emp.id, 0)[0]).filter(Boolean);
      }
      // Find the original level of the rootEmployee in the *unfiltered* hierarchy to maintain consistency
      let originalLevel = 0;
      let tempSupervisorId = rootEmployee.supervisorId;
      const allEmployeesMap = new Map(employees.map(e => [e.id, e])); // Use all employees for level calculation

      while(tempSupervisorId) {
        originalLevel++;
        const supervisor = allEmployeesMap.get(tempSupervisorId);
        tempSupervisorId = supervisor ? supervisor.supervisorId : null;
      }

      const children = buildHierarchyTree(sourceEmployees, rootEmployee.id, originalLevel + 1);
      const supervisor = rootEmployee.supervisorId ? sourceEmployees.find(sup => sup.id === rootEmployee.supervisorId) : null;

      const rootNode: EmployeeNode = {
        ...rootEmployee,
        supervisorName: supervisor ? supervisor.employeeName : undefined,
        children: children,
        level: originalLevel,
        directReportCount: children.length,
        totalReportCount: children.reduce((acc, child) => acc + (child.totalReportCount || 0), children.length),
      };
      return [rootNode];
    }
  }, [employees, filteredEmployees, searchTerm, viewStack]);


  const currentEditingEmployee = useMemo(() => {
    return selectedNodeId ? employees.find(e => e.id === selectedNodeId) || null : null;
  }, [employees, selectedNodeId]);


  const handleImportData = (data: Employee[], fileName: string) => {
    setOriginalEmployeesForSummary([...employees]);
    setEmployees(data);
    setViewStack([]);
    setSearchTerm(''); // Clear search on new import
    toast({ title: 'Data Imported', description: `Imported ${data.length} employees from ${fileName}.` });
    if (originalEmployeesForSummary && originalEmployeesForSummary.length > 0) {
       triggerReorganizationSummary(originalEmployeesForSummary, data);
    }
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setOriginalEmployeesForSummary([...employees]);
    setEmployees(prev => {
      const existingIndex = prev.findIndex(e => e.id === newEmployee.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newEmployee;
        return updated;
      }
      return [...prev, newEmployee];
    });
    toast({ title: 'Employee Added/Updated', description: `${newEmployee.employeeName} has been processed.` });
    setSidebarView('controls');
    triggerReorganizationSummary(originalEmployeesForSummary || [], [...employees, newEmployee]);
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
    setViewStack(prev => prev.filter(id => id !== employeeId)); // Remove deleted ID from stack
    setSelectedNodeId(null); // Clear selection
    toast({ title: 'Employee Deleted', description: `${employeeToDelete.employeeName} has been handled.` });
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Allow drill down only if no active search or if the selected node is part of filtered results
    const targetEmployees = searchTerm.trim() ? filteredEmployees : employees;
    const nodeToDrill = targetEmployees.find(e => e.id === nodeId);

    if (nodeToDrill) {
        const hasChildrenInCurrentView = targetEmployees.some(e => e.supervisorId === nodeId);
        const isCurrentRoot = viewStack.length > 0 && viewStack[viewStack.length - 1] === nodeId;
        if (hasChildrenInCurrentView && !isCurrentRoot) {
            setViewStack(prevStack => [...prevStack, nodeId]);
        }
    }
  };

  const handleEditEmployeeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditModalOpen(true);
  };


  const handleGoUp = () => {
    const newStack = viewStack.slice(0, -1);
    setViewStack(newStack);
    setSelectedNodeId(newStack.length > 0 ? newStack[newStack.length - 1] : null);
  };


  const triggerReorganizationSummary = async (original: Employee[], revised: Employee[]) => {
    if (!original || original.length === 0) {
      const currentCost = calculateTotalProformaCost(revised);
      const jobsCovered = Array.from(new Set(revised.map(e => e.jobName || 'N/A')));
      setReorgSummary({
        summary: "Initial organization structure loaded.",
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
      toast({ title: 'AI Recommendation Error', description: 'Could not generate recommendations.', variant: 'destructive' });
      setAiRecommendations(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveVersion = () => {
    if (employees.length === 0) {
      toast({ title: 'No Data', description: 'Nothing to save.', variant: 'destructive'});
      return;
    }
    const dataStr = JSON.stringify(employees.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}) => emp), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `orgweaver_snapshot_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Version Saved', description: 'Current hierarchy downloaded as JSON.'});
  };

  const handlePrintChart = () => {
    if (currentViewNodes.length === 0) {
      toast({ title: 'No Data', description: 'Nothing to print.', variant: 'destructive'});
      return;
    }
    try {
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      // Check if running in a sandboxed iframe, which often restricts window.print()
      if (window.self !== window.top && errorMessage.toLowerCase().includes('sandboxed')) {
         toast({ title: 'Print Error', description: `Printing is restricted in this sandboxed view. Try opening the app in a new tab or after deployment.`, variant: 'destructive'});
      } else {
         toast({ title: 'Print Error', description: `Could not open print dialog: ${errorMessage}.`, variant: 'destructive'});
      }
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value as PageSize);
  };


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader onGoUp={handleGoUp} canGoUp={viewStack.length > 0 && !searchTerm.trim()} />
        <div className="flex flex-1">
          <Sidebar collapsible="icon" className="hidden border-r bg-background md:flex" side="left">
            <SidebarHeader className="p-2">
              {/* Can add a small logo/title here if sidebar is collapsed */}
            </SidebarHeader>
            <ScrollArea className="flex-1">
              <SidebarContent className="py-2">
                {sidebarView === 'controls' && (
                  <>
                    <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center"><SearchIcon className="mr-2 h-4 w-4"/>Search</SidebarGroupLabel>
                      <SidebarInput 
                        placeholder="Search employees..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </SidebarGroup>
                    <Separator className="my-4" />
                    <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center"><Users className="mr-2 h-4 w-4"/>Data Management</SidebarGroupLabel>
                      <Button variant="outline" className="w-full justify-start mb-2" onClick={() => setImportModalOpen(true)}>
                        <Import className="mr-2 h-4 w-4" /> Import Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start mb-2" onClick={() => setExportModalOpen(true)}>
                        <FileOutput className="mr-2 h-4 w-4" /> Export Chart
                      </Button>
                       <Button variant="outline" className="w-full justify-start" onClick={handlePrintChart}>
                        <Printer className="mr-2 h-4 w-4" /> Print Chart
                      </Button>
                    </SidebarGroup>
                    <Separator className="my-4" />
                     <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center"><UserPlus className="mr-2 h-4 w-4"/>Add Employee</SidebarGroupLabel>
                       <Button variant="outline" className="w-full justify-start" onClick={() => { setSelectedNodeId(null); setSidebarView('addEmployee');}}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add New Employee
                      </Button>
                    </SidebarGroup>
                    <Separator className="my-4" />
                    <SidebarGroup>
                       <SidebarGroupLabel className="flex items-center"><Sparkles className="mr-2 h-4 w-4"/>Display Options</SidebarGroupLabel>
                      <AttributeSelector selectedAttributes={selectedAttributes} onSelectionChange={setSelectedAttributes} />
                      <div className="mt-3 space-y-1">
                        <Label htmlFor="pageSizeSelector" className="text-sm font-medium">Page Size</Label>
                        <Select value={pageSize} onValueChange={handlePageSizeChange}>
                          <SelectTrigger id="pageSizeSelector" className="w-full">
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
                    </SidebarGroup>
                    <Separator className="my-4" />
                    <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center"><Brain className="mr-2 h-4 w-4"/>AI Insights</SidebarGroupLabel>
                      <Button variant="outline" className="w-full justify-start mb-2" onClick={handleGetAiRecommendations}>
                        <Brain className="mr-2 h-4 w-4" /> Get Recommendations
                      </Button>
                       <Button variant="outline" className="w-full justify-start" onClick={() => triggerReorganizationSummary(originalEmployeesForSummary || employees, employees)}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> View Current Summary
                      </Button>
                    </SidebarGroup>
                     <Separator className="my-4" />
                     <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center"><Save className="mr-2 h-4 w-4"/>Versioning</SidebarGroupLabel>
                      <Button variant="outline" className="w-full justify-start" onClick={handleSaveVersion}>
                        <Save className="mr-2 h-4 w-4" /> Save Current Version
                      </Button>
                    </SidebarGroup>
                  </>
                )}
                {sidebarView === 'addEmployee' && (
                  <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center"><UserPlus className="mr-2 h-4 w-4"/>Add New Employee</SidebarGroupLabel>
                    <AddEmployeeForm onSubmit={handleAddEmployee} allEmployees={employees} onCancel={() => setSidebarView('controls')} />
                  </SidebarGroup>
                )}
              </SidebarContent>
            </ScrollArea>
            <SidebarFooter>
              {/* Footer content if any */}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1 flex flex-col">
            <main className="flex-1 p-0 overflow-hidden"> {/* Changed p-4 to p-0 and added overflow-hidden */}
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
        </div>
      </div>

      <ImportDataModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImportData} />
      <ExportDataModal isOpen={isExportModalOpen} onClose={() => setExportModalOpen(false)} employees={employees.map(({children, level, supervisorName, directReportCount, totalReportCount, ...emp}) => emp)} fileNamePrefix="orgweaver_export"/>
      <AiRecommendationsModal isOpen={isAiModalOpen} onClose={() => setAiModalOpen(false)} recommendationsData={aiRecommendations} isLoading={isLoadingAi} />
      <ReorganizationSummaryModal isOpen={isSummaryModalOpen} onClose={() => setSummaryModalOpen(false)} summaryData={reorgSummary} isLoading={isLoadingAi} />

      {currentEditingEmployee && (
        <EditEmployeeModal
            isOpen={isEditModalOpen}
            onClose={() => { setEditModalOpen(false); /* setSelectedNodeId(null); Don't nullify here, might be needed for delete context */ }}
            employee={currentEditingEmployee}
            allEmployees={employees}
            onUpdateEmployee={handleUpdateEmployee}
        />
      )}

      {selectedNodeId && employees.find(e => e.id === selectedNodeId) && (
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="fixed bottom-4 right-4 shadow-lg z-20" aria-label="Delete Selected Employee">
               <Trash2 className="h-5 w-5" /> <span className="ml-2 hidden sm:inline">Delete {employees.find(e => e.id === selectedNodeId)?.employeeName}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete "{employees.find(e => e.id === selectedNodeId)?.employeeName}".
                Direct reports will be reassigned to this employee's supervisor or become top-level. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteEmployee(selectedNodeId)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  );
}

    

    
