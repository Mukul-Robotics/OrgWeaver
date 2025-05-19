
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MapPin, DollarSign, Hash, UserCheck, ShieldAlert, Building, ChevronDownSquare } from 'lucide-react';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { cn } from '@/lib/utils';

interface OrgChartNodeCardProps {
  node: EmployeeNode;
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  isSelected?: boolean;
  className?: string;
  hasChildren?: boolean; // New prop
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


export function OrgChartNodeCard({ node, selectedAttributes, onSelectNode, isSelected, className, hasChildren }: OrgChartNodeCardProps) {
  const cardStyle = isSelected ? { borderColor: 'hsl(var(--primary))', borderWidth: '2px' } : {};

  const getDisplayValue = (attrKey: DisplayAttributeKey): string | number | undefined => {
    if (attrKey === 'employeeNumber') return node.id;
    return node[attrKey as keyof EmployeeNode];
  }

  return (
    <Card
      className={cn(
        `shadow-sm hover:shadow-lg transition-shadow duration-200 w-full flex flex-col h-[160px]`, // Fixed height
        onSelectNode ? 'cursor-pointer' : '',
        isSelected ? 'ring-2 ring-primary' : '',
        className
      )}
      style={cardStyle}
      onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
      aria-selected={isSelected}
      aria-haspopup={hasChildren ? "tree" : undefined} // Indicate drill-down possibility
    >
      <CardHeader className="p-1.5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Briefcase className="mr-1 h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate" title={node.employeeName}>{node.employeeName}</span>
          </CardTitle>
          {hasChildren && <ChevronDownSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        </div>
        <CardDescription className="text-xs truncate" title={node.positionTitle}>{node.positionTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-1.5 pt-0.5 text-xs space-y-0.5 flex-1 overflow-y-auto"> {/* Flex-1 and scroll */}
        {selectedAttributes.map((attrKey) => {
          const value = getDisplayValue(attrKey);
          if (value === undefined || value === null || value === '') return null;
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
        {node.department && !selectedAttributes.includes('department') && (
          <Badge variant="secondary" className="mt-0.5 text-xs py-0 px-1">{node.department}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
