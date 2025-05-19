
import type { EmployeeNode, DisplayAttributeKey } from '@/types/org-chart';
import { OrgChartNodeCard } from './OrgChartNodeCard';

interface HierarchyVisualizerProps {
  nodes: EmployeeNode[];
  selectedAttributes: DisplayAttributeKey[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

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

  const renderNode = (node: EmployeeNode, _level: number) => (
    <li 
      key={node.id} 
      className="list-none flex-shrink-0 flex-grow-0 basis-full sm:basis-[calc(50%-0.25rem)] md:basis-[calc(33.3333%-0.3333rem)] lg:basis-[calc(25%-0.375rem)]"
      // 0.5rem gap = 0.25rem per side for 2 items, 0.3333rem for 3, 0.375rem for 4
    >
      <div className="relative h-full"> {/* Ensures card and its children layout correctly */}
        <OrgChartNodeCard
            node={node}
            selectedAttributes={selectedAttributes}
            onSelectNode={onSelectNode}
            isSelected={selectedNodeId === node.id}
            className="h-full" // Make card take full height of li for alignment
        />
        {node.children && node.children.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2 pl-3 border-l-2 border-border"> 
            {/* Child UL now uses flex-wrap. pl-3 and border-l for visual nesting */}
            {node.children.map(child => renderNode(child, _level + 1))}
          </ul>
        )}
      </div>
    </li>
  );

  return (
    <div className="p-2 md:p-4 overflow-auto h-full"> {/* Reduced padding */}
      <ul className="flex flex-wrap gap-2"> {/* Top-level UL uses flex-wrap */}
        {nodes.map(node => renderNode(node, node.level ?? 0))}
      </ul>
    </div>
  );
}

