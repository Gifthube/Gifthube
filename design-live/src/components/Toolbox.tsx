import { ELEMENT_SCHEMAS } from "../domain/schemas";
import { ElementType } from "../domain/types";

interface ToolboxProps {
  onAdd: (tag: ElementType) => void;
}

export function Toolbox({ onAdd }: ToolboxProps) {
  const groups: { title: string; tags: ElementType[] }[] = [
    { title: "Text", tags: ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6"] },
    { title: "Media", tags: ["img", "video", "audio", "iframe", "canvas"] },
    { title: "Interactive", tags: ["button", "input", "textarea", "label", "select", "option", "a"] },
    { title: "Lists", tags: ["ul", "ol", "li"] },
    { title: "Layout", tags: ["section", "article", "header", "footer", "nav"] },
    { title: "Other", tags: ["form", "link", "script", "hr", "br"] },
  ];

  return (
    <div className="toolbox">
      <h3>Elements</h3>
      {groups.map((g) => (
        <div key={g.title} className="tool-group">
          <div className="tool-group-title">{g.title}</div>
          <div className="tool-grid">
            {g.tags.map((tag) => (
              <button key={tag} className="tool-btn" onClick={() => onAdd(tag)}>
                {ELEMENT_SCHEMAS[tag].void ? `${tag} /` : tag}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toolbox;

