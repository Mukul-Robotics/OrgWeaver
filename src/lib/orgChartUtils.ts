
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
  currentLevel: number = 0
): EmployeeNode[] {
  const tree: EmployeeNode[] = [];
  const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

  employees.forEach(employee => {
    if (employee.supervisorId === supervisorId) {
      const supervisor = employee.supervisorId ? employeeMap.get(employee.supervisorId) : null;
      const children = buildHierarchyTree(employees, employee.id, currentLevel + 1);
      
      let totalReportCount = children.length;
      children.forEach(child => {
        totalReportCount += child.totalReportCount || 0;
      });

      tree.push({
        ...employee,
        supervisorName: supervisor ? supervisor.employeeName : undefined,
        children: children,
        level: currentLevel,
        directReportCount: children.length,
        totalReportCount: totalReportCount,
      });
    }
  });

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
  const headers: (keyof Employee)[] = [
    'id', 'employeeName', 'supervisorId', 'positionTitle', 'jobName', 
    'grade', 'department', 'location', 'proformaCost', 'employeeCategory' // Added employeeCategory
  ];
  
  const csvRows = [
    headers.join(','), 
    ...employees.map(row =>
      headers.map(fieldName => {
        const value = row[fieldName];
        if (value === null || value === undefined) return ''; 
        return JSON.stringify(value); // Handles commas and quotes within values
      }).join(',')
    ),
  ];
  return csvRows.join('\r\n');
}

/**
 * Parses CSV data into an array of Employee objects.
 * @param csvString - The CSV string to parse.
 * @returns An array of Employee objects.
 */
export function parseCSV(csvString: string): Employee[] {
  const rows = csvString.trim().split(/\r\n|\n/); 
  if (rows.length < 2) return [];

  const headerString = rows[0].charCodeAt(0) === 0xFEFF ? rows[0].substring(1) : rows[0];
  const headers = headerString.split(',').map(h => h.trim()) as (keyof Employee)[];
  const dataRows = rows.slice(1);

  return dataRows.map(rowString => {
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];
        if (char === '"') {
            if (inQuotes && i + 1 < rowString.length && rowString[i+1] === '"') { 
                currentVal += '"';
                i++; 
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(currentVal);
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal); 

    const employee = {} as Partial<Employee>; // Use Partial for progressive assignment
    headers.forEach((header, index) => {
      let value: string | number | null | undefined = values[index] ? values[index].trim() : '';
      
      // Attempt to parse if it looks like a JSON stringified value (e.g., "some value", "null")
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        try {
         value = JSON.parse(value); 
        } catch {
          // If JSON.parse fails, it's likely a string that happens to start/end with quotes.
          // Remove the outer quotes.
          if (value.length >=2) value = value.substring(1, value.length -1);
        }
      }
      
      const cleanHeader = header.trim() as keyof Employee;

      if (cleanHeader === 'proformaCost') {
        employee[cleanHeader] = parseFloat(value as string) || 0;
      } else if (cleanHeader === 'supervisorId') {
        employee[cleanHeader] = (value === 'null' || value === '' || value === null || value === undefined) ? null : String(value);
      } else if (cleanHeader === 'id') {
         employee[cleanHeader] = String(value);
      } else if (value === 'null' || value === undefined || value === '') {
        employee[cleanHeader] = undefined; // Store actual undefined for optional fields
      }
      else {
        employee[cleanHeader] = value as any;
      }
    });
    // Ensure required fields have default values if not present or parsed incorrectly
    employee.id = String(employee.id || generateUniqueID());
    employee.employeeName = String(employee.employeeName || 'Unknown Employee');
    employee.positionTitle = String(employee.positionTitle || 'Unknown Position');
    employee.jobName = String(employee.jobName || 'Unknown Job');
    employee.proformaCost = Number(employee.proformaCost || 0);
    
    return employee as Employee;
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
      const { children, supervisorName, level, directReportCount, totalReportCount, ...employeeData } = node;
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
