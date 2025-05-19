
import type { Employee, EmployeeNode } from '@/types/org-chart';

/**
 * Builds a tree structure from a flat list of employees.
 * @param employees - A flat array of Employee objects.
 * @param supervisorId - The ID of the current supervisor to build the subtree for (null for root).
 * @param currentLevel - The current depth level in the tree for the nodes being generated.
 * @returns An array of EmployeeNode objects representing the tree structure.
 */
export function buildHierarchyTree(
  employees: Employee[],
  supervisorId: string | null = null,
  currentLevel: number = 0 // Renamed from level to currentLevel for clarity
): EmployeeNode[] {
  const tree: EmployeeNode[] = [];
  const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

  employees.forEach(employee => {
    if (employee.supervisorId === supervisorId) {
      const supervisor = employee.supervisorId ? employeeMap.get(employee.supervisorId) : null;
      // Recursively build children, incrementing their level
      const children = buildHierarchyTree(employees, employee.id, currentLevel + 1);
      tree.push({
        ...employee,
        supervisorName: supervisor ? supervisor.employeeName : undefined,
        children: children,
        level: currentLevel, // Set the level for this node
      });
    }
  });

  // Sort children by employee name alphabetically
  tree.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  return tree;
}


/**
 * Converts a flat list of employees to a CSV string.
 * @param employees - An array of Employee objects.
 * @returns A string in CSV format.
 */
export function convertToCSV(employees: Employee[]): string {
  if (!employees || employees.length === 0) {
    return "";
  }
  // Ensure we use a consistent set of headers based on the Employee type
  const headers: (keyof Employee)[] = [
    'id', 'employeeName', 'supervisorId', 'positionTitle', 'jobName', 
    'grade', 'department', 'location', 'proformaCost'
  ];
  
  const csvRows = [
    headers.join(','), // header row
    ...employees.map(row =>
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle null or undefined explicitly for CSV representation
        if (value === null || value === undefined) return ''; 
        return JSON.stringify(value);
      }).join(',')
    ),
  ];
  return csvRows.join('\r\n');
}

/**
 * Parses CSV data into an array of Employee objects.
 * Basic parser, assumes CSV format from convertToCSV.
 * @param csvString - The CSV string to parse.
 * @returns An array of Employee objects.
 */
export function parseCSV(csvString: string): Employee[] {
  const rows = csvString.trim().split(/\r\n|\n/); // Handle both CRLF and LF line endings
  if (rows.length < 2) return [];

  const headers = rows[0].split(',') as (keyof Employee)[];
  const dataRows = rows.slice(1);

  return dataRows.map(rowString => {
    // More robust CSV value splitting, handles quoted commas
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];
        if (char === '"') {
            inQuotes = !inQuotes;
            if (i + 1 < rowString.length && rowString[i+1] === '"') { // Handle escaped quote ""
                currentVal += '"';
                i++; // Skip next quote
            }
        } else if (char === ',' && !inQuotes) {
            values.push(currentVal);
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal); // Add the last value

    const employee = {} as Employee;
    headers.forEach((header, index) => {
      let value = values[index];
      try {
        // Only try to parse if it looks like a JSON string (starts with " and ends with ")
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = JSON.parse(value);
        }
      } catch {
        // Keep original value if JSON.parse fails
      }

      if (header === 'proformaCost') {
        (employee[header] as any) = parseFloat(value) || 0;
      } else if (header === 'supervisorId') {
        (employee[header] as any) = value === 'null' || value === '' || value === null ? null : String(value);
      } else if (header === 'id') {
        (employee[header] as any) = String(value);
      }
      else {
        (employee[header] as any) = value;
      }
    });
    // Ensure id is a string and proformaCost is a number
    employee.id = String(employee.id);
    employee.proformaCost = Number(employee.proformaCost);
    return employee;
  });
}

/**
 * Flattens a hierarchy tree into a list of employees.
 * @param nodes - An array of EmployeeNode objects.
 * @returns A flat array of Employee objects.
 */
export function flattenHierarchyTree(nodes: EmployeeNode[]): Employee[] {
  const flatList: Employee[] = [];
  function traverse(currentNodes: EmployeeNode[]) {
    for (const node of currentNodes) {
      const { children, supervisorName, level, ...employeeData } = node;
      flatList.push(employeeData);
      if (children && children.length > 0) {
        traverse(children);
      }
    }
  }
  traverse(nodes);
  return flatList;
}

/**
 * Calculates the total proforma cost of a list of employees.
 * @param employees - An array of Employee objects.
 * @returns The total proforma cost.
 */
export function calculateTotalProformaCost(employees: Employee[]): number {
  return employees.reduce((total, emp) => total + (Number(emp.proformaCost) || 0), 0);
}

/**
 * Generates a unique ID (simple version).
 */
export function generateUniqueID(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
