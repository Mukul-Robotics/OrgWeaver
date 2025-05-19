
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building, Edit3, Users2, Tag } from 'lucide-react';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { cn } from '@/lib/utils';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  onEditClick?: (nodeId: string) => void;
  isSelected?: boolean;
  className?: string;
  hasChildren?: boolean; // This prop was part of a previous iteration, ensure it's used or removed if no longer needed by current drill-down logic
}

const attributeIcons: Partial<Record<DisplayAttributeKey, React.ElementType>> = {
  employeeNumber: Hash,
  employeeName: UserCheck,
  supervisorId: ShieldAlert,
  supervisorName: ShieldAlert,
  positionTitle: Briefcase,
  jobName: Briefcase,
  department: Building,
  location: MapPin,
  proformaCost: DollarSign,
  grade: Users,
  employeeCategory: Tag, // Added icon for Employee Category
};

const categoryBorderColors: Record<string, string> = {
  'Executive': 'border-purple-500',
  'Manager': 'border-blue-500',
  'Individual Contributor': 'border-green-500',
  'Support Staff': 'border-yellow-500',
  // Add more categories and colors as needed
};

export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, onEditClick, isSelected, className }: OrgChartNodeCardProps) {
  const categoryBorderClass = node.employeeCategory ? categoryBorderColors[node.employeeCategory] : '';

  const getDisplayValue = (attrKey: DisplayAttributeKey): string | number | undefined => {
    if (attrKey === 'employeeNumber') return node.id;
    // Do not display supervisorId if supervisorName is selected and available, or if supervisorId is null (handled by check below)
    if (attrKey === 'supervisorId' && (selectedAttributes.includes('supervisorName') && node.supervisorName)) return undefined;
    if (attrKey === 'supervisorId' && !node.supervisorId) return undefined; // Don't show if null
    return node[attrKey as keyof EmployeeNode];
  }

  const hasReports = (node.totalReportCount ?? 0) > 0;
  const displayHasChildrenIndicator = (node.children && node.children.length > 0);


  return (
    <Card
      className={cn(
        `shadow-sm hover:shadow-lg transition-shadow duration-200 w-full flex flex-col h-[160px]`,
        onSelectNode ? 'cursor-pointer' : '',
        isSelected ? 'ring-2 ring-primary' : 'border-border', // Default border, can be overridden by categoryBorderClass
        categoryBorderClass, // Apply category-specific border color
        className
      )}
      onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
      aria-selected={isSelected}
      aria-haspopup={displayHasChildrenIndicator ? "tree" : undefined}
    >
      <CardHeader className="p-1.5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Briefcase className="mr-1 h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate" title={node.employeeName}>{node.employeeName}</span>
          </CardTitle>
          <div className="flex items-center space-x-1 shrink-0">
            {onEditClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(node.id);
                }}
                className="p-0.5 rounded hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Edit ${node.employeeName}`}
                title={`Edit ${node.employeeName}`}
              >
                <Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs truncate" title={node.positionTitle}>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-1.5 pt-0.5 text-xs space-y-0.5 flex-1 overflow-y-auto flex flex-col">
        <div className="flex-grow">
          {selectedAttributes.map((attrKey) => {
            const value = getDisplayValue(attrKey);
            if (value === undefined || value === null || value === '') return null;
            // These are already displayed in CardHeader or implicitly (like ID)
            if (attrKey === 'employeeName' || attrKey === 'positionTitle') return null;
            // Only show employeeNumber if explicitly selected AND it's not just repeating the ID (which is always available to the component)
            if (attrKey === 'employeeNumber' && !ALL_DISPLAY_ATTRIBUTES[attrKey]) return null;


            const Icon = attributeIcons[attrKey];
            return (
              <div key={attrKey} className="flex items-center text-muted-foreground truncate">
                {Icon && <Icon className="mr-1.5 h-3 w-3 shrink-0" />}
                <span className="font-medium text-foreground/80 whitespace-nowrap">{ALL_DISPLAY_ATTRIBUTES[attrKey]}: </span>
                <span className="ml-1 truncate" title={String(value)}>
                  {attrKey === 'proformaCost' && typeof value === 'number'
                    ? `$${value.toLocaleString()}`
                    : String(value)}
                </span>
              </div>
            );
          })}
          {node.department && !selectedAttributes.includes('department') && (
            <Badge variant="secondary" className="mt-0.5 text-xs py-0 px-1">{node.department}</Badge>
          )}
        </div>
        {hasReports && (
          <div className="mt-auto pt-1 text-right text-xs text-muted-foreground flex items-center justify-end space-x-1">
            <Users2 className="h-3 w-3" />
            <span title="Direct Reports">D:{node.directReportCount ?? 0}</span>
            <span>/</span>
            <span title="Total Reports">T:{node.totalReportCount ?? 0}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
