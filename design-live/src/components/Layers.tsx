import { DesignElement } from "../domain/types";
import { ELEMENT_SCHEMAS } from "../domain/schemas";

interface LayersProps {
  nodes: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
}

function LayerItem({ node, depth, selectedId, onSelect, onMove, onDelete }: {
  node: DesignElement;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
}) {
  const isSelected = node.id === selectedId;
  const schema = ELEMENT_SCHEMAS[node.tag];
  return (
    <div className={`layer-item${isSelected ? " selected" : ""}`} style={{ paddingLeft: depth * 12 }}>
      <button className="layer-title" onClick={() => onSelect(node.id)}>
        {schema.tag}
      </button>
      <div className="layer-actions">
        <button onClick={() => onMove(node.id, "up")}>↑</button>
        <button onClick={() => onMove(node.id, "down")}>↓</button>
        <button onClick={() => onDelete(node.id)}>✕</button>
      </div>
    </div>
  );
}

export function Layers({ nodes, selectedId, onSelect, onMove, onDelete }: LayersProps) {
  function render(nodes: DesignElement[], depth: number): JSX.Element[] {
    const items: JSX.Element[] = [];
    for (const node of nodes) {
      items.push(
        <LayerItem
          key={node.id}
          node={node}
          depth={depth}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          onDelete={onDelete}
        />
      );
      if (node.children && node.children.length) {
        items.push(...render(node.children, depth + 1));
      }
    }
    return items;
  }

  return <div className="layers">{render(nodes, 0)}</div>;
}

export default Layers;

