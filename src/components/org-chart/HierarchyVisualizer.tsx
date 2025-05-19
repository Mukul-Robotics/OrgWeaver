
import type { EmployeeNode, DisplayAttributeKey, PageSize } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';
import { cn } from '@/lib/utils';
import React from 'react'; // Import React for useMemo

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  pageSize: PageSize;
}

const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'fitToScreen'>, { width: string; height: string }> = {
  a4Portrait: { width: '794px', height: '1123px' },
  a4Landscape: { width: '1123px', height: '794px' },
  letterPortrait: { width: '816px', height: '1056px' },
  letterLandscape: { width: '1056px', height: '816px' },
};

export function HierarchyVisualizer({
  nodes,
  selectedAttributes,
  onSelectNode,
  selectedNodeId,
  pageSize,
}: HierarchyVisualizerProps) {

  const visualizerStyle = React.useMemo(() => {
    if (pageSize === 'fitToScreen') {
      return { width: '100%', height: '100%' };
    }
    return PAGE_DIMENSIONS[pageSize] || { width: '100%', height: '100%' };
  }, [pageSize]);

  const renderEmployeeSegment = (node: EmployeeNode, level: number): JSX.Element => {
    return (
      <div key={node.id} className="mb-4 w-full"> {/* Container for an employee's card and their direct reports */}
        <OrgChartNodeCard
          node={node}
          selectedAttributes={selectedAttributes}
          onSelectNode={onSelectNode}
          isSelected={selectedNodeId === node.id}
          className="mb-2" // Space between this card and its children's grid
        />
        {node.children && node.children.length > 0 && (
          // Grid container for direct reports (children)
          <div className={cn(
            "mt-1 grid gap-2", // Use grid layout with a gap
            "grid-cols-2",    // Default to 2 columns for the smallest screens
            "sm:grid-cols-3",  // 3 columns on sm screens
            "md:grid-cols-4",  // 4 columns on md screens
            "lg:grid-cols-5",  // 5 columns on lg screens
            "xl:grid-cols-6"   // 6 columns on xl screens
          )}>
            {node.children.map(child => (
              // Each child's segment becomes a grid item
              <div key={child.id}>
                {renderEmployeeSegment(child, level + 1)}
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
    <div 
      style={visualizerStyle}
      className={cn(
        "p-1 md:p-2 overflow-auto bg-background mx-auto",
        pageSize === 'fitToScreen' ? 'h-full w-full' : 'shadow-lg border my-4'
      )}
      id="hierarchy-visualizer-container"
    >
      {/* Top-level nodes will stack vertically by default due to the div in renderEmployeeSegment */}
      {nodes.map(node => renderEmployeeSegment(node, node.level ?? 0))}
    </div>
  );
}
