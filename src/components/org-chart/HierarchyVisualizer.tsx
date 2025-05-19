
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';
import { cn } from '@/lib/utils';

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

// Define an array of border color classes for nesting indication
const levelColors = [
  'border-primary/50',
  'border-accent/50',
  'border-destructive/30',
  'border-yellow-500/50',
  'border-green-500/50',
  'border-blue-500/50',
  'border-indigo-500/50',
  'border-purple-500/50',
  'border-pink-500/50',
];

export function HierarchyVisualizer({
  nodes,
  selectedAttributes,
  onSelectNode,
  selectedNodeId,
}: HierarchyVisualizerProps) {

  const renderEmployeeSegment = (node: EmployeeNode, level: number): JSX.Element => {
    return (
      // Container for a single employee and their direct reports' section
      <div key={node.id} className="mb-4 w-full">
        <OrgChartNodeCard
          node={node}
          selectedAttributes={selectedAttributes}
          onSelectNode={onSelectNode}
          isSelected={selectedNodeId === node.id}
          className="mb-2" // Add some margin below the card itself
        />
        {node.children && node.children.length > 0 && (
          // Container for the direct reports (children)
          // This will be a flex container to arrange children in columns
          <div className={cn(
            "mt-1 ml-4 pl-3 border-l-2 flex flex-wrap justify-start gap-x-4 gap-y-2", // gap-x for space between cards in a row, gap-y for space when they wrap
            levelColors[level % levelColors.length]
          )}>
            {node.children.map(child => (
              // Each child is a column item with responsive width
              <div key={child.id} className={cn(
                "flex-shrink-0 flex-grow-0",
                // Default: 2 items per row (mobile-first approach). gap-x-4 is 1rem.
                "basis-[calc(50%-0.5rem)]", // Each takes 50% minus half the gap
                // md: 3 items per row. 2 gaps total. Each takes 33.33% minus (2 * 0.5rem / 3)
                "md:basis-[calc(33.333%-0.666rem)]",
                // lg: 4 items per row. 3 gaps total. Each takes 25% minus (3 * 0.5rem / 4)
                "lg:basis-[calc(25%-0.75rem)]",
                 // xl: 5 items per row. 4 gaps total. Each takes 20% minus (4 * 0.5rem / 5)
                "xl:basis-[calc(20%-0.8rem)]"
              )}>
                {renderEmployeeSegment(child, level + 1)} {/* Recursive call for the child */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network mb-4"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
        <h3 className="text-xl font-semibold mb-2">No Organization Data</h3>
        <p className="text-center">Import data or add employees using the control panel to visualize the hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="p-1 md:p-2 overflow-auto h-full bg-background">
      {/* Render each top-level node; they will stack vertically by default */}
      {nodes.map(node => renderEmployeeSegment(node, node.level ?? 0))}
    </div>
  );
}
