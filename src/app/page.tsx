
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

import type { Employee, EmployeeNode, DisplayAttributeKey, ReorganizationSummaryData, AiRecommendationsData } from '@/types/org-chart';
import { DEFAULT_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { buildHierarchyTree, calculateTotalProformaCost, flattenHierarchyTree } from '@/lib/orgChartUtils';
import { summarizeReorganizationImpact } from '@/ai/flows/summarize-reorganization-impact';
import { recommendHierarchyOptimizations } from '@/ai/flows/recommend-hierarchy-optimizations';
import { useToast } from '@/hooks/use-toast';
import { Import, FileOutput, Users, Brain, Sparkles, UserPlus, Edit3, Save, Trash2, ArrowRightLeft, Printer } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  { id: '1', employeeName: 'Alice Wonderland', supervisorId: null, positionTitle: 'CEO', jobName: 'Chief Executive Officer', department: 'Executive', proformaCost: 300000 },
  { id: '2', employeeName: 'Bob The Builder', supervisorId: '1', positionTitle: 'CTO', jobName: 'Chief Technology Officer', department: 'Technology', proformaCost: 250000 },
  { id: '3', employeeName: 'Charlie Brown', supervisorId: '1', positionTitle: 'COO', jobName: 'Chief Operating Officer', department: 'Operations', proformaCost: 240000 },
  { id: '4', employeeName: 'Diana Prince', supervisorId: '2', positionTitle: 'VP Engineering', jobName: 'VP Engineering', department: 'Technology', proformaCost: 200000 },
  { id: '5', employeeName: 'Edward Scissorhands', supervisorId: '4', positionTitle: 'Software Engineer Lead', jobName: 'Team Lead', department: 'Technology', location: 'Remote', proformaCost: 150000 },
  { id: '6', employeeName: 'Fiona Apple', supervisorId: '4', positionTitle: 'Senior Software Engineer', jobName: 'Senior SDE', department: 'Technology', grade: 'L6', proformaCost: 140000 },
];


export default function OrgWeaverPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialSampleEmployees);
  const [originalEmployeesForSummary, setOriginalEmployeesForSummary] = useState<Employee[] | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<DisplayAttributeKey[]>(DEFAULT_DISPLAY_ATTRIBUTES);
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

  const { toast } = useToast();

  const hierarchyTree = useMemo(() => buildHierarchyTree(employees), [employees]);

  const currentEditingEmployee = useMemo(() => {
    if (sidebarView === 'editEmployee' && selectedNodeId) {
      return employees.find(e => e.id === selectedNodeId) || null;
    }
    return null;
  }, [employees, selectedNodeId, sidebarView]);


  const handleImportData = (data: Employee[], fileName: string) => {
    setOriginalEmployeesForSummary([...employees]); // Save current state before import
    setEmployees(data);
    toast({ title: 'Data Imported', description: `Imported ${data.length} employees from ${fileName}.` });
    // Optionally trigger AI summary if originalEmployeesForSummary was not null
    if (originalEmployeesForSummary && originalEmployeesForSummary.length > 0) {
       triggerReorganizationSummary(originalEmployeesForSummary, data);
    }
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setOriginalEmployeesForSummary([...employees]);
    setEmployees(prev => {
      const existingIndex = prev.findIndex(e => e.id === newEmployee.id);
      if (existingIndex > -1) { // Update existing
        const updated = [...prev];
        updated[existingIndex] = newEmployee;
        return updated;
      }
      return [...prev, newEmployee]; // Add new
    });
    toast({ title: 'Employee Added/Updated', description: `${newEmployee.employeeName} has been processed.` });
    setSidebarView('controls');
    triggerReorganizationSummary(originalEmployeesForSummary || [], [...employees, newEmployee]);
  };
  
  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setOriginalEmployeesForSummary([...employees]);
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    toast({ title: 'Employee Updated', description: `${updatedEmployee.employeeName}'s details updated.` });
    setEditModalOpen(false);
    setSelectedNodeId(null); // Deselect node
    triggerReorganizationSummary(originalEmployeesForSummary || [], employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setOriginalEmployeesForSummary([...employees]);
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (!employeeToDelete) return;

    // Reassign direct reports to the deleted employee's supervisor or make them top-level
    const newSupervisorId = employeeToDelete.supervisorId;
    const updatedEmployees = employees
      .filter(e => e.id !== employeeId) // Remove the employee
      .map(e => e.supervisorId === employeeId ? { ...e, supervisorId: newSupervisorId } : e); // Reassign children

    setEmployees(updatedEmployees);
    toast({ title: 'Employee Deleted', description: `${employeeToDelete.employeeName} and their direct reports (if any) have been handled.` });
    setSelectedNodeId(null);
    triggerReorganizationSummary(originalEmployeesForSummary || [], updatedEmployees);
  };


  const triggerReorganizationSummary = async (original: Employee[], revised: Employee[]) => {
    if (!original || original.length === 0) {
      // If there's no original state (e.g. first import), just show current stats
      const currentCost = calculateTotalProformaCost(revised);
      const jobsCovered = Array.from(new Set(revised.map(e => e.jobName)));
      setReorgSummary({
        summary: "Initial organization structure loaded.",
        costChange: currentCost, // Show total cost as "change" from 0
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
      const originalHierarchyJson = JSON.stringify(original);
      const revisedHierarchyJson = JSON.stringify(revised);
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
      const currentHierarchyJson = JSON.stringify(employees);
      // For simplicity, using a generic goal. In a real app, this could be user input.
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
    // Currently, "Save Version" means download current state as JSON
    if (employees.length === 0) {
      toast({ title: 'No Data', description: 'Nothing to save.', variant: 'destructive'});
      return;
    }
    const dataStr = JSON.stringify(employees, null, 2);
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

  const handleSelectNodeForEdit = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditModalOpen(true);
  };
  
  const handlePrintChart = () => {
    if (employees.length === 0) {
      toast({ title: 'No Data', description: 'Nothing to print.', variant: 'destructive'});
      return;
    }
    // This standard browser function should open the print dialog.
    // The actual printing to PDF/Paper is handled by the browser's print UI.
    window.print();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
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
                {/* Edit Employee Form could also be here if not using a modal */}
              </SidebarContent>
            </ScrollArea>
            <SidebarFooter>
              {/* Footer content if any */}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1 flex flex-col">
            <main className="flex-1 p-0 overflow-hidden"> {/* Removed padding for visualizer to control its own */}
              <HierarchyVisualizer 
                nodes={hierarchyTree} 
                selectedAttributes={selectedAttributes}
                onSelectNode={handleSelectNodeForEdit}
                selectedNodeId={selectedNodeId}
              />
            </main>
          </SidebarInset>
        </div>
      </div>

      <ImportDataModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImportData} />
      <ExportDataModal isOpen={isExportModalOpen} onClose={() => setExportModalOpen(false)} employees={employees} fileNamePrefix="orgweaver_export"/>
      <AiRecommendationsModal isOpen={isAiModalOpen} onClose={() => setAiModalOpen(false)} recommendationsData={aiRecommendations} isLoading={isLoadingAi} />
      <ReorganizationSummaryModal isOpen={isSummaryModalOpen} onClose={() => setSummaryModalOpen(false)} summaryData={reorgSummary} isLoading={isLoadingAi} />
      
      {currentEditingEmployee && (
        <EditEmployeeModal 
            isOpen={isEditModalOpen}
            onClose={() => { setEditModalOpen(false); setSelectedNodeId(null); }}
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

