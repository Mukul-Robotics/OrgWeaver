'use client';

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Employee } from '@/types/org-chart';
import { parseCSV } from '@/lib/orgChartUtils';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Employee[], fileName: string) => void;
}

export function ImportDataModal({ isOpen, onClose, onImport }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.endsWith('.csv')) {
        setFileType('csv');
      } else if (selectedFile.name.endsWith('.json')) {
        setFileType('json');
      } else {
        setFileType(null);
        toast({
          title: "Unsupported File Type",
          description: "Please upload a CSV or JSON file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = () => {
    if (!file || !fileType) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let employees: Employee[] = [];
        if (fileType === 'csv') {
          employees = parseCSV(content);
        } else if (fileType === 'json') {
          employees = JSON.parse(content);
          // Basic validation for JSON structure
          if (!Array.isArray(employees) || !employees.every(emp => emp.id && emp.employeeName && emp.proformaCost !== undefined)) {
             throw new Error("Invalid JSON structure. Expected an array of employees with id, employeeName, and proformaCost.");
          }
        }
        
        // Basic validation for all imported employees
        if (!employees.every(emp => emp.id && emp.employeeName && typeof emp.proformaCost === 'number')) {
            throw new Error("Imported data is missing required fields (id, employeeName, proformaCost) or has incorrect types.");
        }

        onImport(employees, file.name);
        toast({
          title: "Import Successful",
          description: `${employees.length} records imported from ${file.name}.`,
        });
        onClose();
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: (error as Error).message || "Could not parse the file. Please ensure it's correctly formatted.",
          variant: "destructive",
        });
      } finally {
        setFile(null);
        setFileType(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Organization Data</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file containing employee data. Ensure required fields (id, employeeName, proformaCost) are present.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="import-file" className="text-right col-span-1">
              File
            </Label>
            <Input id="import-file" type="file" accept=".csv,.json" onChange={handleFileChange} className="col-span-3" />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground text-center">Selected: {file.name} ({fileType})</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={!file || !fileType}>
            <UploadCloud className="mr-2 h-4 w-4" /> Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
