
import type { EmployeeNode, DisplayAttributeKey, PageSize } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';
import { cn } from '@/lib/utils';
import React from 'react';

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  onEditClick?: (nodeId: string) => void; // New prop
  selectedNodeId?: string | null;
  pageSize: PageSize;
}

const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'fitToScreen'>, { width: string; height: string }> = {
  a4Portrait: { width: '794px', height: '1123px' },
  a4Landscape: { width: '1123px', height: '794px' },
  letterPortrait: { width: '816px', height: '1056px' },
  letterLandscape: { width: '1056px', height: '816px' },
};

// Renders a single node and its direct children's cards in a grid
const renderEmployeeSegment = (
  node: EmployeeNode,
  selectedAttributes: DisplayAttributeKey[],
  onSelectNode?: (nodeId: string) => void,
  onEditClick?: (nodeId: string) => void,
  selectedNodeId?: string | null,
  isRootNodeInView: boolean = false // True if this node is one of the initial 'nodes' passed to HierarchyVisualizer
): JSX.Element => {
  return (
    <div key={node.id} className={cn("w-full", isRootNodeInView ? "mb-6" : "p-1")}>
      <OrgChartNodeCard
        node={node}
        selectedAttributes={selectedAttributes}
        onSelectNode={onSelectNode}
        onEditClick={onEditClick}
        isSelected={selectedNodeId === node.id}
        hasChildren={node.children && node.children.length > 0}
        className={cn(isRootNodeInView ? "" : "w-full")} // Ensure cards in grid take full cell width
      />
      {node.children && node.children.length > 0 && (
        <div className={cn(
          "mt-2 grid gap-3 pl-4 border-l-2 border-muted", // Indent children slightly & add connecting line
          "grid-cols-2", 
          "sm:grid-cols-3",
          "md:grid-cols-4",
          "lg:grid-cols-5",
          "xl:grid-cols-6"
        )}>
          {node.children.map(childNode => (
            // Render ONLY the card for each direct child.
            // Do not recursively call renderEmployeeSegment here for deep nesting in this component.
            // The drill-down is handled by changing the 'nodes' prop in the parent (OrgWeaverPage).
            <OrgChartNodeCard
              key={childNode.id}
              node={childNode}
              selectedAttributes={selectedAttributes}
              onSelectNode={onSelectNode}
              onEditClick={onEditClick}
              isSelected={selectedNodeId === childNode.id}
              hasChildren={childNode.children && childNode.children.length > 0}
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};


export function HierarchyVisualizer({
  nodes, // These are the "root" nodes for the current view
  selectedAttributes,
  onSelectNode,
  onEditClick,
  selectedNodeId,
  pageSize,
}: HierarchyVisualizerProps) {

  const visualizerStyle = React.useMemo(() => {
    if (pageSize === 'fitToScreen') {
      return { width: '100%', height: '100%' };
    }
    return PAGE_DIMENSIONS[pageSize] || { width: '100%', height: '100%' };
  }, [pageSize]);


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
      {/* 'nodes' here are the current roots of the view (e.g., top-level employees, or a single employee if drilled down) */}
      {nodes.map(node => renderEmployeeSegment(node, selectedAttributes, onSelectNode, onEditClick, selectedNodeId, true))}
    </div>
  );
}
