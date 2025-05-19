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

  const renderNode = (node: EmployeeNode, level: number) => (
    <li key={node.id} className="list-none" style={{ marginLeft: `${level > 0 ? 2 : 0}rem` }}>
      {level > 0 && (
         <div className="absolute -left-4 top-1/2 h-full w-4 -translate-y-1/2">
           <div className="h-1/2 w-px bg-border"></div>
           <div className="h-px w-full bg-border"></div>
         </div>
      )}
      <div className="relative">
        <OrgChartNodeCard
            node={node}
            selectedAttributes={selectedAttributes}
            onSelectNode={onSelectNode}
            isSelected={selectedNodeId === node.id}
        />
        {node.children && node.children.length > 0 && (
          <ul className="pl-4 border-l border-dashed border-gray-300">
            {node.children.map(child => renderNode(child, level + 1))}
          </ul>
        )}
      </div>
    </li>
  );

  return (
    <div className="p-4 md:p-6 overflow-auto h-full">
      <ul className="space-y-4">
        {nodes.map(node => renderNode(node, node.level ?? 0))}
      </ul>
    </div>
  );
}
