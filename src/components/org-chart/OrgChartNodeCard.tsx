
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building, ChevronDownSquare, Edit3 } from 'lucide-react';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { cn } from '@/lib/utils';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  onEditClick?: (nodeId: string) => void; // New prop for edit action
  isSelected?: boolean;
  className?: string;
  hasChildren?: boolean;
}

const attributeIcons: Partial<Record<DisplayAttributeKey, React.ElementType>> = {
  employeeNumber: Hash,
  employeeName: UserCheck,
  supervisorId: ShieldAlert, // For raw ID if displayed
  supervisorName: ShieldAlert,
  positionTitle: Briefcase,
  jobName: Briefcase,
  department: Building,
  location: MapPin,
  proformaCost: DollarSign,
  grade: Users,
};


export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, onEditClick, isSelected, className, hasChildren }: OrgChartNodeCardProps) {
  const cardStyle = isSelected ? { borderColor: 'hsl(var(--primary))', borderWidth: '2px' } : {};

  const getDisplayValue = (attrKey: DisplayAttributeKey): string | number | undefined => {
    if (attrKey === 'employeeNumber') return node.id;
    // Avoid showing supervisorId (raw id) if supervisorName (derived name) is also selected, or if it's null
    if (attrKey === 'supervisorId' && (selectedAttributes.includes('supervisorName') || !node.supervisorId)) return undefined;
    return node[attrKey as keyof EmployeeNode];
  }

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
      aria-haspopup={hasChildren ? "tree" : undefined}
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
                  e.stopPropagation(); // Prevent card's main onClick
                  onEditClick(node.id);
                }}
                className="p-0.5 rounded hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Edit ${node.employeeName}`}
                title={`Edit ${node.employeeName}`}
              >
                <Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </button>
            )}
            {hasChildren && <ChevronDownSquare className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </div>
        <CardDescription className="text-xs truncate" title={node.positionTitle}>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-1.5 pt-0.5 text-xs space-y-0.5 flex-1 overflow-y-auto">
        {selectedAttributes.map((attrKey) => {
          const value = getDisplayValue(attrKey);
          if (value === undefined || value === null || value === '') return null;
          // Do not render employeeName and positionTitle here as they are in the header
          if (attrKey === 'employeeName' || attrKey === 'positionTitle') return null;
           // Do not display 'Employee No.' if it's not explicitly selected or is same as 'id'
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
      </CardContent>
    </Card>
  );
}
