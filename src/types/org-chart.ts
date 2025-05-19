
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
  employeeCategory?: string; // Added employee category
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
  | 'employeeCategory'; // Added employee category

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
  employeeCategory: "Category", // Added employee category display name
};

// Default attributes to display
export const DEFAULT_DISPLAY_ATTRIBUTES: DisplayAttributeKey[] = [
  'employeeName',
  'positionTitle',
  'department',
  'proformaCost',
  'employeeCategory', // Added employeeCategory to default display
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
