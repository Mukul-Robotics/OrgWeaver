'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Employee } from '@/types/org-chart';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateUniqueID } from '@/lib/orgChartUtils';

const employeeFormSchema = z.object({
  id: z.string().optional(), // Optional for new employees, will be generated
  employeeName: z.string().min(1, { message: "Employee name is required." }),
  supervisorId: z.string().nullable().optional(),
  positionTitle: z.string().min(1, { message: "Position title is required." }),
  jobName: z.string().min(1, { message: "Job name is required." }),
  grade: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  proformaCost: z.coerce.number().min(0, { message: "Proforma cost must be a positive number." }),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface AddEmployeeFormProps {
  onSubmit: (employee: Employee) => void;
  existingEmployee?: Employee | null;
  allEmployees: Employee[]; // For supervisor selection
  onCancel?: () => void;
}

export function AddEmployeeForm({ onSubmit, existingEmployee, allEmployees, onCancel }: AddEmployeeFormProps) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: existingEmployee 
      ? { ...existingEmployee, supervisorId: existingEmployee.supervisorId || null } 
      : {
        employeeName: '',
        supervisorId: null,
        positionTitle: '',
        jobName: '',
        grade: '',
        department: '',
        location: '',
        proformaCost: 0,
      },
  });

  const handleSubmit = (values: EmployeeFormData) => {
    const employeeData: Employee = {
      ...values,
      id: existingEmployee?.id || values.id || generateUniqueID(), // Use existing ID or generate new
      supervisorId: values.supervisorId || null, // Ensure supervisorId is null if empty string
      proformaCost: Number(values.proformaCost)
    };
    onSubmit(employeeData);
    if (!existingEmployee) { // Reset form only if it's a new employee
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ScrollArea className="h-[calc(100vh-200px)] pr-3"> {/* Adjust height as needed */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="jobName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SDE II" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor (Employee No.)</FormLabel>
                  <FormControl>
                     <select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">None (Top Level)</option>
                        {allEmployees
                          .filter(emp => emp.id !== existingEmployee?.id) // Prevent self-supervision
                          .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employeeName} ({emp.id})
                          </option>
                        ))}
                      </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proformaCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proforma Cost</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 85000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. L5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{existingEmployee ? 'Update Employee' : 'Add Employee'}</Button>
        </div>
      </form>
    </Form>
  );
}
