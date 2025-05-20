
export interface Employee {
  id: string; // Unique record ID
  employeeName?: string | null; // Name of the employee, optional for vacant positions
  supervisorId: string | null;
  positionTitle: string;
  jobName: string;
  positionNumber: string; // Unique position identifier
  supervisorPositionNumber?: string | null;
  grade?: string;
  department?: string;
  location?: string;
  proformaCost: number;
  employeeCategory?: string;
}

export interface EmployeeNode extends Employee {
  children: EmployeeNode[];
  supervisorName?: string;
  level?: number;
  directReportCount?: number;
  totalReportCount?: number;
}

export type DisplayAttributeKey =
  | 'employeeNumber'
  | 'employeeName'
  | 'supervisorId'
  | 'supervisorName'
  | 'positionTitle'
  | 'jobName'
  | 'positionNumber'
  | 'supervisorPositionNumber'
  | 'grade'
  | 'department'
  | 'location'
  | 'proformaCost'
  | 'employeeCategory';

export const ALL_DISPLAY_ATTRIBUTES: Record<DisplayAttributeKey, string> = {
  employeeNumber: "Record ID", // Changed from Employee No. to reflect it can be a vacant position
  employeeName: "Name",
  supervisorId: "Supervisor Record ID",
  supervisorName: "Supervisor Name",
  positionTitle: "Position Title",
  jobName: "Job Name",
  positionNumber: "Position No.",
  supervisorPositionNumber: "Supervisor Pos. No.",
  grade: "Grade",
  department: "Department",
  location: "Location",
  proformaCost: "Proforma Cost",
  employeeCategory: "Category",
};

export const DEFAULT_DISPLAY_ATTRIBUTES: DisplayAttributeKey[] = [
  'employeeName',
  'positionTitle',
  'positionNumber',
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
  { value: "N/A", label: "N/A (Not Applicable)"}, // Added N/A
];

export const PREDEFINED_GRADES: { value: string; label: string }[] = [
  { value: "SG", label: "SG" },
  { value: "ASG", label: "ASG" },
  { value: "D2", label: "D2" },
  { value: "D1", label: "D1" },
  { value: "P7", label: "P7" },
  { value: "P6", label: "P6" },
  { value: "P5", label: "P5" },
  { value: "P4", label: "P4" },
  { value: "P3", label: "P3" },
  { value: "P2", label: "P2" },
  { value: "P1", label: "P1" },
  { value: "G7", label: "G7" },
  { value: "G6", label: "G6" },
  { value: "G5", label: "G5" },
  { value: "G4", label: "G4" },
  { value: "G3", label: "G3" },
  { value: "G2", label: "G2" },
  { value: "G1", label: "G1" },
  { value: "NOA", label: "NOA" },
  { value: "NOB", label: "NOB" },
  { value: "NOC", label: "NOC" },
  { value: "I2", label: "I2" },
  { value: "I1", label: "I1" },
  { value: "N/A", label: "N/A (Not Applicable)" }, // Added N/A
];

export const PREDEFINED_LOCATIONS: { value: string; label: string }[] = [
  { value: "NewYork", label: "New York, USA" },
  { value: "London", label: "London, UK" },
  { value: "Tokyo", label: "Tokyo, Japan" },
  { value: "SanFrancisco", label: "San Francisco, USA" },
  { value: "Berlin", label: "Berlin, Germany" },
  { value: "Singapore", label: "Singapore" },
  { value: "Remote", label: "Remote" },
  { value: "N/A", label: "N/A (Not Applicable)" }, // Added N/A
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
