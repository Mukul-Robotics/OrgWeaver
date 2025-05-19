
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
      className="list-none flex-shrink-0 flex-grow-0 basis-full xs:basis-[calc(50%-0.25rem)] sm:basis-[calc(33.3333%-0.333rem)] lg:basis-[calc(25%-0.375rem)] xl:basis-[calc(20%-0.4rem)]"
    >
      <div className="relative">
        <OrgChartNodeCard
            node={node}
            selectedAttributes={selectedAttributes}
            onSelectNode={onSelectNode}
            isSelected={selectedNodeId === node.id}
        />
        {node.children && node.children.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2 mt-2 pl-2 border-l-2 border-border">
            {node.children.map(child => renderNode(child, _level + 1))}
          </ul>
        )}
      </div>
    </li>
  );

  return (
    <div className="p-1 md:p-2 overflow-auto h-full bg-background">
      <ul className="flex flex-wrap justify-center gap-2">
        {nodes.map(node => renderNode(node, node.level ?? 0))}
      </ul>
    </div>
  );
}
