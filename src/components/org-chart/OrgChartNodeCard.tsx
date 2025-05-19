
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building, Edit3, Users2 } from 'lucide-react'; // Added Users2 for report counts
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { cn } from '@/lib/utils';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  onEditClick?: (nodeId: string) => void;
  isSelected?: boolean;
  className?: string;
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
};


export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, onEditClick, isSelected, className }: OrgChartNodeCardProps) {
  const cardStyle = isSelected ? { borderColor: 'hsl(var(--primary))', borderWidth: '2px' } : {};

  const getDisplayValue = (attrKey: DisplayAttributeKey): string | number | undefined => {
    if (attrKey === 'employeeNumber') return node.id;
    if (attrKey === 'supervisorId' && (selectedAttributes.includes('supervisorName') || !node.supervisorId)) return undefined;
    return node[attrKey as keyof EmployeeNode];
  }

  const hasReports = (node.totalReportCount ?? 0) > 0;

  return (
    <Card
      className={cn(
        `shadow-sm hover:shadow-lg transition-shadow duration-200 w-full flex flex-col h-[160px]`,
        onSelectNode ? 'cursor-pointer' : '',
        isSelected ? 'ring-2 ring-primary' : '',
        className
      )}
      style={cardStyle}
      onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
      aria-selected={isSelected}
      aria-haspopup={hasReports ? "tree" : undefined} // Use hasReports for aria-haspopup
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
            {/* Removed ChevronDownSquare icon */}
          </div>
        </div>
        <CardDescription className="text-xs truncate" title={node.positionTitle}>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-1.5 pt-0.5 text-xs space-y-0.5 flex-1 overflow-y-auto flex flex-col">
        <div className="flex-grow"> {/* Wrapper for attributes to allow report counts to be at bottom */}
          {selectedAttributes.map((attrKey) => {
            const value = getDisplayValue(attrKey);
            if (value === undefined || value === null || value === '') return null;
            if (attrKey === 'employeeName' || attrKey === 'positionTitle') return null;
            if (attrKey === 'employeeNumber' && node.id === value && !selectedAttributes.includes('employeeNumber')) return null;

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
        {/* Display Report Counts */}
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
