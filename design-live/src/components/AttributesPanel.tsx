import { ELEMENT_SCHEMAS } from "../domain/schemas";
import { DesignElement, AttributeDefinition } from "../domain/types";

interface AttributesPanelProps {
  selected: DesignElement | null;
  onChange: (name: string, value: unknown) => void;
}

function Field({ def, value, onChange }: { def: AttributeDefinition; value: unknown; onChange: (v: unknown) => void }) {
  const inputId = `attr-${def.name}`;
  if (def.type === "boolean") {
    return (
      <label className="field">
        <input id={inputId} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>{def.name}</span>
      </label>
    );
  }
  if (def.type === "enum" && def.options) {
    return (
      <label className="field">
        <span>{def.name}</span>
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
          <option value="">—</option>
          {def.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    );
  }
  const type = def.type === "number" ? "number" : def.type === "url" ? "url" : "text";
  return (
    <label className="field">
      <span>{def.name}</span>
      <input
        type={type}
        value={value as string | number | undefined | null ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (def.type === "number") {
            onChange(val === "" ? undefined : Number(val));
          } else {
            onChange(val === "" ? undefined : val);
          }
        }}
      />
    </label>
  );
}

export function AttributesPanel({ selected, onChange }: AttributesPanelProps) {
  if (!selected) return <div className="attributes"><em>No element selected</em></div>;
  const schema = ELEMENT_SCHEMAS[selected.tag];
  return (
    <div className="attributes">
      <h3>Attributes: {schema.tag}</h3>
      {schema.attributes.map((def) => (
        <Field
          key={def.name}
          def={def}
          value={(selected.attributes as Record<string, unknown>)[def.name]}
          onChange={(v) => onChange(def.name, v)}
        />
      ))}
    </div>
  );
}

export default AttributesPanel;

