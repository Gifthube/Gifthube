// Core types for the design tool domain model

export type PrimitiveAttributeValue = string | number | boolean | undefined | null;

export type AttributeType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "url";

export interface AttributeDefinition {
  name: string;
  type: AttributeType;
  required?: boolean;
  options?: string[]; // for enum
  default?: PrimitiveAttributeValue;
}

export type ElementType =
  | "div"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "a"
  | "img"
  | "button"
  | "input"
  | "textarea"
  | "label"
  | "select"
  | "option"
  | "ul"
  | "ol"
  | "li"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "nav"
  | "form"
  | "video"
  | "audio"
  | "iframe"
  | "canvas"
  | "script"
  | "link"
  | "hr"
  | "br";

export interface ElementSchema {
  tag: ElementType;
  void?: boolean; // true for void elements like img, br, hr, input, etc.
  attributes: AttributeDefinition[];
}

export interface DesignElement {
  id: string;
  tag: ElementType;
  attributes: Record<string, PrimitiveAttributeValue>;
  children?: DesignElement[];
}

export interface DocumentModel {
  root: DesignElement[]; // multiple top-level nodes allowed
}

export type AttributeSchemaMap = Record<ElementType, ElementSchema>;

