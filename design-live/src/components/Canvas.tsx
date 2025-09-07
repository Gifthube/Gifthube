import { DesignElement } from "../domain/types";
import { ELEMENT_SCHEMAS } from "../domain/schemas";

interface CanvasProps {
  nodes: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function NodeView({ node, selectedId, onSelect }: { node: DesignElement; selectedId: string | null; onSelect: (id: string) => void }) {
  const isSelected = node.id === selectedId;
  const schema = ELEMENT_SCHEMAS[node.tag];
  return (
    <div className={`canvas-node${isSelected ? " selected" : ""}`} onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}>
      <div className="canvas-node-tag">{schema.tag}</div>
      {!schema.void && node.children && node.children.length > 0 && (
        <div className="canvas-children">
          {node.children.map((child) => (
            <NodeView key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Canvas({ nodes, selectedId, onSelect }: CanvasProps) {
  return (
    <div className="canvas" onClick={() => onSelect("") }>
      {nodes.length === 0 ? (
        <div className="canvas-empty">Drop or add elements from the toolbox</div>
      ) : (
        nodes.map((n) => <NodeView key={n.id} node={n} selectedId={selectedId} onSelect={onSelect} />)
      )}
    </div>
  );
}

export default Canvas;

