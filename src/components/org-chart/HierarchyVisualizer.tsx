
import type { EmployeeNode, DisplayAttributeKey, PageSize } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';
import { cn } from '@/lib/utils';
import React from 'react';

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  onEditClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  pageSize: PageSize;
  isPrinting?: boolean;
}

// Approximate pixel dimensions at 96 DPI
const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'fitToScreen'>, { width: string; height: string }> = {
  a4Portrait: { width: '794px', height: '1123px' },
  a4Landscape: { width: '1123px', height: '794px' },
  letterPortrait: { width: '816px', height: '1056px' },
  letterLandscape: { width: '1056px', height: '816px' },
  a5Portrait: { width: '559px', height: '794px' },
  a5Landscape: { width: '794px', height: '559px' },
};

// Renders a single node and its children's cards
const renderEmployeeSegment = (
  node: EmployeeNode,
  selectedAttributes: DisplayAttributeKey[],
  onSelectNode?: (nodeId: string) => void,
  onEditClick?: (nodeId: string) => void,
  selectedNodeId?: string | null,
  isRootNodeInView: boolean = false,
  currentLevel: number = 0
): JSX.Element => {
  return (
    <div key={node.id} className={cn("w-full org-chart-segment", isRootNodeInView ? "mb-4" : "pt-2")}>
      <OrgChartNodeCard
        node={node}
        selectedAttributes={selectedAttributes}
        onSelectNode={onSelectNode}
        onEditClick={onEditClick}
        isSelected={selectedNodeId === node.id}
      />
      {node.children && node.children.length > 0 && (
        <div className="ml-4 pl-3 pt-2"> {/* Basic nesting indentation */}
          <div className={cn(
            "grid gap-2",
            // Responsive columns:
            "grid-cols-2", // Default: 2 columns for smallest screens
            "sm:grid-cols-3", // Small screens (640px+): 3 columns
            "md:grid-cols-4", // Medium screens (768px+): 4 columns (target for A4 portrait)
          )}>
            {node.children.map(childNode => (
               renderEmployeeSegment(
                 childNode,
                 selectedAttributes,
                 onSelectNode,
                 onEditClick,
                 selectedNodeId,
                 false,
                 currentLevel +1
                )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export function HierarchyVisualizer({
  nodes,
  selectedAttributes,
  onSelectNode,
  onEditClick,
  selectedNodeId,
  pageSize,
  isPrinting = false,
}: HierarchyVisualizerProps) {

  const visualizerStyle = React.useMemo(() => {
    if (isPrinting || pageSize === 'fitToScreen') {
      return { width: '100%', minHeight: '100%' }; // For printing, allow natural flow; for fitToScreen, take available space
    }
    return PAGE_DIMENSIONS[pageSize] || { width: '100%', minHeight: '100%' };
  }, [pageSize, isPrinting]);


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
        "bg-background",
        isPrinting ? "p-0 m-0" : "p-1 md:p-2 mx-auto", // No padding/margin for print, let print.css handle
        (pageSize === 'fitToScreen' && !isPrinting) ? 'h-full w-full overflow-auto' : '', 
        (pageSize !== 'fitToScreen' && !isPrinting) ? 'shadow-lg border my-4 overflow-auto' : ''
        // When printing, overflow is handled by print.css to be 'visible'
      )}
      id="hierarchy-visualizer-container"
    >
      {nodes.map(node => renderEmployeeSegment(node, selectedAttributes, onSelectNode, onEditClick, selectedNodeId, true, 0))}
    </div>
  );
}
