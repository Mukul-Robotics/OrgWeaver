
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';
import { cn } from '@/lib/utils';

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

// Define an array of border color classes to cycle through for hierarchy lines
const lineColors = [
  'border-primary',        // Color for lines from level 0 parents to level 1 children
  'border-accent',         // Color for lines from level 1 parents to level 2 children
  'border-destructive/70', // Color for lines from level 2 parents to level 3 children
  'border-yellow-500',     // Color for lines from level 3 parents to level 4 children
  'border-green-500',      // Color for lines from level 4 parents to level 5 children
  // Add more colors if deeper nesting is common, or it will cycle through these
];

export function HierarchyVisualizer({
  nodes,
  selectedAttributes,
  onSelectNode,
  selectedNodeId,
}: HierarchyVisualizerProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network mb-4"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
        <h3 className="text-xl font-semibold mb-2">No Organization Data</h3>
        <p className="text-center">Import data or add employees using the control panel to visualize the hierarchy.</p>
      </div>
    );
  }

  // The `currentLevel` parameter represents the depth of the current `node`.
  // The line connecting this `node` (parent) to its children's group will be colored based on this `currentLevel`.
  const renderNode = (node: EmployeeNode, currentLevel: number) => {
    const lineColorClass = lineColors[currentLevel % lineColors.length];

    return (
      <li
        key={node.id}
        className={cn(
          "list-none flex-shrink-0 flex-grow-0",
          // Default: 2 items per row. Adjust gap compensation if gap changes from gap-2 (0.5rem)
          "basis-[calc(50%-0.25rem)]", 
          // sm: 3 items per row. 0.5rem * 2 gaps / 3 items = 0.333rem per item
          "sm:basis-[calc(33.3333%-0.333rem)]",
          // md: 4 items per row. 0.5rem * 3 gaps / 4 items = 0.375rem per item
          "md:basis-[calc(25%-0.375rem)]",
          // lg: 5 items per row. 0.5rem * 4 gaps / 5 items = 0.4rem per item
          "lg:basis-[calc(20%-0.4rem)]",
          // xl: 6 items per row. 0.5rem * 5 gaps / 6 items = 0.416rem per item
          "xl:basis-[calc(16.666%-0.416rem)]"
        )}
      >
        <div className="relative">
          <OrgChartNodeCard
              node={node}
              selectedAttributes={selectedAttributes}
              onSelectNode={onSelectNode}
              isSelected={selectedNodeId === node.id}
          />
          {node.children && node.children.length > 0 && (
            <ul className={cn(
              "flex flex-wrap justify-center gap-2 mt-2 pl-2 border-l-2",
              lineColorClass // Apply dynamic color based on the parent's level
            )}>
              {node.children.map(child => renderNode(child, currentLevel + 1))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="p-1 md:p-2 overflow-auto h-full bg-background">
      <ul className="flex flex-wrap justify-center gap-2">
        {nodes.map(node => renderNode(node, node.level ?? 0))}
      </ul>
    </div>
  );
}
