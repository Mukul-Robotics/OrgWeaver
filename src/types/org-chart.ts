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
}

export interface EmployeeNode extends Employee {
  children: EmployeeNode[];
  // For display convenience, can be populated when building the tree
  supervisorName?: string; 
  level?: number; // For indentation/styling in the visualizer
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
  | 'proformaCost';

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
};

// Default attributes to display
export const DEFAULT_DISPLAY_ATTRIBUTES: DisplayAttributeKey[] = [
  'employeeName',
  'positionTitle',
  'department',
  'proformaCost',
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
