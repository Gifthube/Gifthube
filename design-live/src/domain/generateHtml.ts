import { DesignElement, DocumentModel, ElementSchema } from "./types";
import { ELEMENT_SCHEMAS } from "./schemas";

function escapeHtml(text: unknown): string {
  if (text === undefined || text === null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAttributes(attributes: Record<string, unknown>, schema: ElementSchema): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      if (value) parts.push(key);
      continue;
    }
    parts.push(`${key}="${escapeHtml(value)}"`);
  }
  // ensure required attributes exist (fallback to defaults if available)
  for (const attr of schema.attributes) {
    if (!attr.required) continue;
    const hasValue = attributes[attr.name] !== undefined && attributes[attr.name] !== null && attributes[attr.name] !== "";
    if (!hasValue) {
      if (attr.default !== undefined && attr.default !== null) {
        parts.push(`${attr.name}="${escapeHtml(attr.default)}"`);
      }
    }
  }
  return parts.length ? " " + parts.join(" ") : "";
}

function renderElement(node: DesignElement): string {
  const schema = ELEMENT_SCHEMAS[node.tag];
  const attrs = renderAttributes(node.attributes || {}, schema);
  if (schema.void) {
    return `<${schema.tag}${attrs}>`;
  }
  const childrenHtml = (node.children || []).map(renderElement).join("");
  return `<${schema.tag}${attrs}>${childrenHtml}</${schema.tag}>`;
}

export function generateHtml(documentModel: DocumentModel): string {
  return documentModel.root.map(renderElement).join("");
}

