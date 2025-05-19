'use client';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Employee } from '@/types/org-chart';
import { convertToCSV } from '@/lib/orgChartUtils';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  fileNamePrefix?: string;
}

type ExportFormat = 'json' | 'csv';

export function ExportDataModal({ isOpen, onClose, employees, fileNamePrefix = "org_chart" }: ExportDataModalProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const { toast } = useToast();

  const handleExport = () => {
    if (employees.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There is no employee data to export.",
        variant: "destructive",
      });
      return;
    }

    let dataStr = '';
    let mimeType = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${fileNamePrefix}_${timestamp}.${format}`;

    if (format === 'json') {
      dataStr = JSON.stringify(employees, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      dataStr = convertToCSV(employees);
      mimeType = 'text/csv';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Data exported as ${fileName}.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Organization Chart</DialogTitle>
          <DialogDescription>
            Select the format to export your current organization data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup defaultValue="json" onValueChange={(value: string) => setFormat(value as ExportFormat)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="format-json" />
              <Label htmlFor="format-json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv">CSV</Label>
            </div>
            {/* Add PDF/PNG options here in the future if implemented */}
          </RadioGroup>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleExport} disabled={employees.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
