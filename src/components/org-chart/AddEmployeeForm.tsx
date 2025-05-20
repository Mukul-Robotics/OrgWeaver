
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Employee } from '@/types/org-chart';
import { EMPLOYEE_CATEGORIES, PREDEFINED_GRADES, PREDEFINED_LOCATIONS } from '@/types/org-chart';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateUniqueID } from '@/lib/orgChartUtils';

const employeeFormSchema = z.object({
  id: z.string().optional(),
  employeeName: z.string().nullable().optional(), // Made optional for vacant positions
  supervisorId: z.string().nullable().optional(),
  positionTitle: z.string().min(1, { message: "Position title is required." }),
  jobName: z.string().min(1, { message: "Job name is required." }),
  positionNumber: z.string().min(1, {message: "Position number is required."}),
  grade: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  proformaCost: z.coerce.number().min(0, { message: "Proforma cost must be a positive number." }),
  employeeCategory: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface AddEmployeeFormProps {
  onSubmit: (employee: Omit<Employee, 'supervisorPositionNumber'>) => void;
  existingEmployee?: Employee | null;
  allEmployees: Employee[];
  onCancel?: () => void;
  grades: { value: string; label: string }[];
  locations: { value: string; label: string }[];
  categories: { value: string; label: string }[];
}

export function AddEmployeeForm({ onSubmit, existingEmployee, allEmployees, onCancel, grades, locations, categories }: AddEmployeeFormProps) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: existingEmployee
      ? {
          ...existingEmployee,
          employeeName: existingEmployee.employeeName || '', // Keep empty string for form input if null
          supervisorId: existingEmployee.supervisorId || null,
          employeeCategory: existingEmployee.employeeCategory || "",
          grade: existingEmployee.grade || "",
          location: existingEmployee.location || "",
          positionNumber: existingEmployee.positionNumber || "",
        }
      : {
        employeeName: '',
        supervisorId: null,
        positionTitle: '',
        jobName: '',
        positionNumber: `POS-${generateUniqueID().substring(0,4).toUpperCase()}`, // Suggest a unique position number
        grade: '',
        department: '',
        location: '',
        proformaCost: 0,
        employeeCategory: '',
      },
  });

  const handleSubmit = (values: EmployeeFormData) => {
    const employeeData: Omit<Employee, 'supervisorPositionNumber'> = {
      ...values,
      id: existingEmployee?.id || values.id || generateUniqueID(),
      employeeName: values.employeeName?.trim() ? values.employeeName.trim() : null, // Convert empty string to null
      supervisorId: values.supervisorId || null,
      proformaCost: Number(values.proformaCost),
      employeeCategory: values.employeeCategory || undefined,
      grade: values.grade || undefined,
      location: values.location || undefined,
      positionNumber: values.positionNumber,
    };
    onSubmit(employeeData);
    if (!existingEmployee) {
      form.reset({ // Reset with a new suggested position number
        ...form.formState.defaultValues,
        employeeName: '',
        positionTitle: '',
        jobName: '',
        supervisorId: null,
        positionNumber: `POS-${generateUniqueID().substring(0,4).toUpperCase()}`,
        department: '',
        proformaCost: 0,
        grade: '',
        location: '',
        employeeCategory: ''
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ScrollArea className="h-[calc(100vh-200px)] pr-3">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank for vacant position" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. POS123" {...field} />
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
                  <FormLabel>Supervisor (Position Number)</FormLabel>
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
                          .sort((a,b) => (a.employeeName || a.positionTitle || '').localeCompare(b.employeeName || b.positionTitle || ''))
                          .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employeeName || `Vacant: ${emp.positionTitle}`} (Pos: {emp.positionNumber})
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
                    <Input placeholder="e.g. Engineering" {...field} value={field.value || ''} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {grades.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{existingEmployee ? 'Update Position' : 'Add Position'}</Button>
        </div>
      </form>
    </Form>
  );
}
