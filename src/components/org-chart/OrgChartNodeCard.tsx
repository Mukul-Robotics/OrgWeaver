
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building } from 'lucide-react';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { cn } from '@/lib/utils';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
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


export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, isSelected, className }: OrgChartNodeCardProps) {
  const cardStyle = isSelected ? { borderColor: 'hsl(var(--primary))', borderWidth: '2px' } : {};

  const getDisplayValue = (attrKey: DisplayAttributeKey): string | number | undefined => {
    switch(attrKey) {
      case 'employeeNumber': return node.id;
      case 'supervisorNumber': return node.supervisorId;
      // All other keys should directly map to node properties
      default: return node[attrKey as keyof EmployeeNode];
    }
  }


  return (
    <Card 
      className={cn(
        `mb-1 shadow-sm hover:shadow-lg transition-shadow duration-200 w-full ${onSelectNode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`,
        className
      )}
      style={cardStyle}
      onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
      aria-selected={isSelected}
    >
      <CardHeader className="p-2">
        <CardTitle className="text-base flex items-center">
          <Briefcase className="mr-1.5 h-4 w-4 text-primary shrink-0" />
          <span className="truncate" title={node.employeeName}>{node.employeeName}</span>
        </CardTitle>
        <CardDescription className="text-xs truncate" title={node.positionTitle}>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-xs space-y-0.5">
        {selectedAttributes.map((attrKey) => {
          const value = getDisplayValue(attrKey);
          if (value === undefined || value === null || value === '') return null;
          // Do not display name and title again as they are in the header
          if (attrKey === 'employeeName' || attrKey === 'positionTitle') return null;

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
        {node.department && !selectedAttributes.includes('department') && ( // Show department badge if not already listed
          <Badge variant="secondary" className="mt-1 text-xs py-0 px-1">{node.department}</Badge>
        )}
      </CardContent>
    </Card>
  );
}

