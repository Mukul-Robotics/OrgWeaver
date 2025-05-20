
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateUniqueID } from '@/lib/orgChartUtils';
import { PREDEFINED_GRADES, PREDEFINED_LOCATIONS, EMPLOYEE_CATEGORIES } from '@/types/org-chart';

// Sentinel value for "None (Optional)" category selection
const NO_CATEGORY_SELECTED_VALUE = "__NO_CATEGORY_SENTINEL__";

const employeeFormSchema = z.object({
  id: z.string().optional(),
  employeeName: z.string().nullable().optional(),
  supervisorId: z.string().nullable().optional(),
  positionTitle: z.string().min(1, { message: "Position title is required." }),
  jobName: z.string().min(1, { message: "Job name is required." }),
  positionNumber: z.string().min(1, {message: "Position number is required."}),
  grade: z.string().min(1, { message: "Grade is required." }),
  department: z.string().optional(),
  location: z.string().min(1, { message: "Location is required." }),
  proformaCost: z.coerce.number().min(0, { message: "Proforma cost must be a positive number." }),
  employeeCategory: z.string().optional(), // This will hold either a real category or the sentinel value
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface AddEmployeeFormProps {
  onSubmit: (employee: Omit<Employee, 'supervisorPositionNumber'>) => void;
  existingEmployee?: Employee | null;
  allEmployees: Employee[];
  onCancel?: () => void;
}

export function AddEmployeeForm({ onSubmit, existingEmployee, allEmployees, onCancel }: AddEmployeeFormProps) {
  const defaultGrade = PREDEFINED_GRADES.length > 0 ? PREDEFINED_GRADES[0].value : "";
  const defaultLocation = PREDEFINED_LOCATIONS.length > 0 ? PREDEFINED_LOCATIONS[0].value : "";
  // defaultCategory is removed as we will use NO_CATEGORY_SELECTED_VALUE for empty/new

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: existingEmployee
      ? {
          ...existingEmployee,
          employeeName: existingEmployee.employeeName || '',
          supervisorId: existingEmployee.supervisorId || null,
          employeeCategory: existingEmployee.employeeCategory || NO_CATEGORY_SELECTED_VALUE,
          grade: existingEmployee.grade || defaultGrade,
          location: existingEmployee.location || defaultLocation,
          positionNumber: existingEmployee.positionNumber || "",
        }
      : {
        employeeName: '',
        supervisorId: null,
        positionTitle: '',
        jobName: '',
        positionNumber: `POS-${generateUniqueID().substring(0,4).toUpperCase()}`,
        grade: defaultGrade,
        department: '',
        location: defaultLocation,
        proformaCost: 0,
        employeeCategory: NO_CATEGORY_SELECTED_VALUE, // Default to sentinel for new positions
      },
  });

  const handleSubmit = (values: EmployeeFormData) => {
    const employeeData: Omit<Employee, 'supervisorPositionNumber'> = {
      ...values,
      id: existingEmployee?.id || values.id || generateUniqueID(),
      employeeName: values.employeeName?.trim() ? values.employeeName.trim() : null,
      supervisorId: values.supervisorId || null,
      proformaCost: Number(values.proformaCost),
      employeeCategory: values.employeeCategory === NO_CATEGORY_SELECTED_VALUE ? undefined : values.employeeCategory,
      grade: values.grade, 
      location: values.location, 
      positionNumber: values.positionNumber,
    };
    onSubmit(employeeData);
    if (!existingEmployee) {
      form.reset({ 
        employeeName: '',
        supervisorId: null,
        positionTitle: '',
        jobName: '',
        positionNumber: `POS-${generateUniqueID().substring(0,4).toUpperCase()}`,
        grade: defaultGrade,
        department: '',
        location: defaultLocation,
        proformaCost: 0,
        employeeCategory: NO_CATEGORY_SELECTED_VALUE,
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
                  <FormLabel>Employee Name (optional for vacant)</FormLabel>
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
                          .filter(emp => emp.id !== existingEmployee?.id) 
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_GRADES.map(grade => (
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
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_LOCATIONS.map(location => (
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY_SELECTED_VALUE}>None (Optional)</SelectItem>
                      {EMPLOYEE_CATEGORIES.map(category => (
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
