import type { Employee, EmployeeNode } from '@/types/org-chart';

/**
 * Builds a tree structure from a flat list of employees.
 * @param employees - A flat array of Employee objects.
 * @param supervisorId - The ID of the current supervisor to build the subtree for (null for root).
 * @param level - The current depth level in the tree.
 * @returns An array of EmployeeNode objects representing the tree structure.
 */
export function buildHierarchyTree(
  employees: Employee[],
  supervisorId: string | null = null,
  level: number = 0
): EmployeeNode[] {
  const tree: EmployeeNode[] = [];
  const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

  employees.forEach(employee => {
    if (employee.supervisorId === supervisorId) {
      const supervisor = employee.supervisorId ? employeeMap.get(employee.supervisorId) : null;
      tree.push({
        ...employee,
        supervisorName: supervisor ? supervisor.employeeName : undefined,
        children: buildHierarchyTree(employees, employee.id, level + 1),
        level,
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
  const headers = Object.keys(employees[0]) as (keyof Employee)[];
  const csvRows = [
    headers.join(','), // header row
    ...employees.map(row =>
      headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(',')
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
  const rows = csvString.trim().split('\r\n');
  if (rows.length < 2) return [];

  const headers = rows[0].split(',') as (keyof Employee)[];
  const dataRows = rows.slice(1);

  return dataRows.map(rowString => {
    const values = rowString.split(',').map(val => {
      try {
        return JSON.parse(val);
      } catch {
        return val; // Fallback for non-JSON encoded values if any
      }
    });
    const employee = {} as Employee;
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === 'proformaCost') {
        (employee[header] as any) = parseFloat(value) || 0;
      } else if (header === 'supervisorId') {
        (employee[header] as any) = value === 'null' || value === '' ? null : value;
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
  return Math.random().toString(36).substr(2, 9);
}
