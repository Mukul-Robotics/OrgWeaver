import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building } from 'lucide-react';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  isSelected?: boolean;
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


export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, isSelected }: OrgChartNodeCardProps) {
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
      className={`mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 ${onSelectNode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={cardStyle}
      onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
      aria-selected={isSelected}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          {node.employeeName}
        </CardTitle>
        <CardDescription>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-1">
        {selectedAttributes.map((attrKey) => {
          const value = getDisplayValue(attrKey);
          if (value === undefined || value === null || value === '') return null;
          const Icon = attributeIcons[attrKey];
          return (
            <div key={attrKey} className="flex items-center text-muted-foreground">
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              <span className="font-medium text-foreground/80">{ALL_DISPLAY_ATTRIBUTES[attrKey]}: </span>
              <span className="ml-1">
                {attrKey === 'proformaCost' && typeof value === 'number'
                  ? `$${value.toLocaleString()}`
                  : String(value)}
              </span>
            </div>
          );
        })}
        {node.department && (
          <Badge variant="secondary" className="mt-2">{node.department}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
