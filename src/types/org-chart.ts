
export interface Employee {
  id: string; // Employee number, must be unique
  employeeName: string;
  supervisorId: string | null; // Employee number of the supervisor, null for top-level employees
  positionTitle: string;
  jobName: string;
  grade?: string;
  department?: string;
  location?: string;
  proformaCost: number;
  employeeCategory?: string;
}

export interface EmployeeNode extends Employee {
  children: EmployeeNode[];
  supervisorName?: string;
  level?: number; // For indentation/styling in the visualizer
  directReportCount?: number;
  totalReportCount?: number;
}

// Defines which attributes can be selected for display in the org chart nodes
export type DisplayAttributeKey =
  | 'employeeNumber' // alias for id
  | 'employeeName'
  | 'supervisorId' // raw supervisor id
  | 'supervisorName' // derived supervisor name
  | 'positionTitle'
  | 'jobName'
  | 'grade'
  | 'department'
  | 'location'
  | 'proformaCost'
  | 'employeeCategory';

export const ALL_DISPLAY_ATTRIBUTES: Record<DisplayAttributeKey, string> = {
  employeeNumber: "Employee No.",
  employeeName: "Name",
  supervisorId: "Supervisor No.",
  supervisorName: "Supervisor Name",
  positionTitle: "Position Title",
  jobName: "Job Name",
  grade: "Grade",
  department: "Department",
  location: "Location",
  proformaCost: "Proforma Cost",
  employeeCategory: "Category",
};

// Default attributes to display
export const DEFAULT_DISPLAY_ATTRIBUTES: DisplayAttributeKey[] = [
  'employeeName',
  'positionTitle',
  'department',
  'proformaCost',
  'employeeCategory',
  'grade',
  'location',
];

export const EMPLOYEE_CATEGORIES: { value: string; label: string }[] = [
  { value: "Staff", label: "Staff" },
  { value: "PSA", label: "PSA (Professional Services)" },
  { value: "LSC", label: "LSC (Limited Service Contractor)" },
  { value: "Intern", label: "Intern" },
  { value: "IndividualConsultant", label: "Individual Consultant" },
  { value: "Fellow", label: "Fellow" },
];

export const PREDEFINED_GRADES: { value: string; label: string }[] = [
  { value: "L1", label: "L1 - Associate" },
  { value: "L2", label: "L2 - Analyst" },
  { value: "L3", label: "L3 - Senior Analyst" },
  { value: "L4", label: "L4 - Manager" },
  { value: "L5", label: "L5 - Senior Manager" },
  { value: "L6", label: "L6 - Director" },
  { value: "L7", label: "L7 - Senior Director" },
  { value: "VP", label: "VP - Vice President" },
  { value: "SVP", label: "SVP - Senior Vice President" },
  { value: "CSuite", label: "C-Suite" },
  { value: "InternG", label: "Intern Grade" },
  { value: "ConsultantG", label: "Consultant Grade" },
  { value: "FellowG", label: "Fellow Grade" },
  { value: "N/A", label: "N/A" },
];

export const PREDEFINED_LOCATIONS: { value: string; label: string }[] = [
  { value: "NewYork", label: "New York, USA" },
  { value: "London", label: "London, UK" },
  { value: "Tokyo", label: "Tokyo, Japan" },
  { value: "SanFrancisco", label: "San Francisco, USA" },
  { value: "Berlin", label: "Berlin, Germany" },
  { value: "Singapore", label: "Singapore" },
  { value: "Remote", label: "Remote" },
  { value: "N/A", label: "N/A" },
];


export interface ReorganizationSummaryData {
  summary: string;
  costChange: number;
  jobsAdded: string[];
  jobsRemoved: string[];
  jobsCovered: string[];
}

export interface AiRecommendation {
  area: string;
  optimization: string;
  potentialImpact: string;
}

export interface AiRecommendationsData {
  summary: string;
  recommendations: AiRecommendation[];
}

export type PageSize = 'fitToScreen' | 'a4Portrait' | 'a4Landscape' | 'letterPortrait' | 'letterLandscape';

export const PAGE_SIZE_OPTIONS: { value: PageSize, label: string }[] = [
  { value: 'fitToScreen', label: 'Fit to Screen' },
  { value: 'a4Portrait', label: 'A4 Portrait (210x297mm)' },
  { value: 'a4Landscape', label: 'A4 Landscape (297x210mm)' },
  { value: 'letterPortrait', label: 'Letter Portrait (8.5x11in)' },
  { value: 'letterLandscape', label: 'Letter Landscape (11x8.5in)' },
];

export const DEFAULT_PAGE_SIZE: PageSize = 'fitToScreen';
