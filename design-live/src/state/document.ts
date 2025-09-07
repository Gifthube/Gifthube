import { DesignElement, DocumentModel, ElementType } from "../domain/types";
import { ELEMENT_SCHEMAS } from "../domain/schemas";

export function createEmptyDocument(): DocumentModel {
  return { root: [] };
}

export function generateId(prefix: string = "el"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function findElementById(
  nodes: DesignElement[],
  id: string
): { node: DesignElement | null; parent: DesignElement | null } {
  const stack: { node: DesignElement; parent: DesignElement | null }[] = nodes.map((n) => ({ node: n, parent: null }));
  while (stack.length) {
    const current = stack.pop()!;
    if (current.node.id === id) return current;
    for (const child of current.node.children || []) {
      stack.push({ node: child, parent: current.node });
    }
  }
  return { node: null, parent: null };
}

export function addElement(
  doc: DocumentModel,
  tag: ElementType,
  targetParentId?: string
): { id: string } {
  const id = generateId(tag);
  const schema = ELEMENT_SCHEMAS[tag];
  const attributes: Record<string, unknown> = {};
  for (const attr of schema.attributes) {
    if (attr.default !== undefined) attributes[attr.name] = attr.default;
  }
  const element: DesignElement = { id, tag, attributes, children: schema.void ? undefined : [] };
  if (targetParentId) {
    const { node: parent } = findElementById(doc.root, targetParentId);
    const usableParent = parent && !ELEMENT_SCHEMAS[parent.tag].void ? parent : null;
    if (usableParent) {
      usableParent.children = usableParent.children || [];
      usableParent.children.push(element);
      return { id };
    }
  }
  doc.root.push(element);
  return { id };
}

export function deleteElement(doc: DocumentModel, id: string): void {
  function removeFrom(list: DesignElement[]): boolean {
    const index = list.findIndex((n) => n.id === id);
    if (index >= 0) {
      list.splice(index, 1);
      return true;
    }
    for (const node of list) {
      if (node.children && removeFrom(node.children)) return true;
    }
    return false;
  }
  removeFrom(doc.root);
}

export function moveElement(doc: DocumentModel, id: string, direction: "up" | "down"): void {
  function moveIn(list: DesignElement[]): boolean {
    const i = list.findIndex((n) => n.id === id);
    if (i === -1) {
      for (const node of list) {
        if (node.children && moveIn(node.children)) return true;
      }
      return false;
    }
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return true;
    const [item] = list.splice(i, 1);
    list.splice(j, 0, item);
    return true;
  }
  moveIn(doc.root);
}

export function updateAttribute(
  doc: DocumentModel,
  id: string,
  name: string,
  value: unknown
): void {
  const { node } = findElementById(doc.root, id);
  if (!node) return;
  if (value === "" || value === null || value === undefined) {
    delete (node.attributes as Record<string, unknown>)[name];
  } else {
    (node.attributes as Record<string, unknown>)[name] = value;
  }
}

