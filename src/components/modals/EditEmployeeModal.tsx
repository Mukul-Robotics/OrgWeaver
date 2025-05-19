'use client';

import type { Employee } from '@/types/org-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddEmployeeForm } from '@/components/org-chart/AddEmployeeForm';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  allEmployees: Employee[];
  onUpdateEmployee: (updatedEmployee: Employee) => void;
}

export function EditEmployeeModal({ isOpen, onClose, employee, allEmployees, onUpdateEmployee }: EditEmployeeModalProps) {
  if (!employee) return null;

  const handleSubmit = (updatedEmployee: Employee) => {
    onUpdateEmployee(updatedEmployee);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Employee: {employee.employeeName}</DialogTitle>
          <DialogDescription>
            Modify employee details or reassign their supervisor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddEmployeeForm 
            onSubmit={handleSubmit}
            existingEmployee={employee}
            allEmployees={allEmployees}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
