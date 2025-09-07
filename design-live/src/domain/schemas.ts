import { AttributeSchemaMap, ElementSchema } from "./types";

const globalAttributes: ElementSchema["attributes"] = [
  { name: "id", type: "string" },
  { name: "class", type: "string" },
  { name: "title", type: "string" },
  { name: "hidden", type: "boolean" },
  { name: "style", type: "string" },
];

const withGlobal = (attrs: ElementSchema["attributes"]) => [
  ...globalAttributes,
  ...attrs,
];

export const ELEMENT_SCHEMAS: AttributeSchemaMap = {
  div: { tag: "div", attributes: withGlobal([]) },
  span: { tag: "span", attributes: withGlobal([]) },
  p: { tag: "p", attributes: withGlobal([]) },
  h1: { tag: "h1", attributes: withGlobal([]) },
  h2: { tag: "h2", attributes: withGlobal([]) },
  h3: { tag: "h3", attributes: withGlobal([]) },
  h4: { tag: "h4", attributes: withGlobal([]) },
  h5: { tag: "h5", attributes: withGlobal([]) },
  h6: { tag: "h6", attributes: withGlobal([]) },
  a: {
    tag: "a",
    attributes: withGlobal([
      { name: "href", type: "url" },
      { name: "target", type: "enum", options: ["_self", "_blank", "_parent", "_top"] },
      { name: "rel", type: "string" },
    ]),
  },
  img: {
    tag: "img",
    void: true,
    attributes: withGlobal([
      { name: "src", type: "url", required: true },
      { name: "alt", type: "string" },
      { name: "width", type: "number" },
      { name: "height", type: "number" },
      { name: "loading", type: "enum", options: ["eager", "lazy"] },
    ]),
  },
  button: { tag: "button", attributes: withGlobal([{ name: "type", type: "enum", options: ["button", "submit", "reset"] }]) },
  input: {
    tag: "input",
    void: true,
    attributes: withGlobal([
      { name: "type", type: "enum", options: ["text", "number", "email", "password", "checkbox", "radio", "file", "date", "color", "range"] },
      { name: "value", type: "string" },
      { name: "placeholder", type: "string" },
      { name: "checked", type: "boolean" },
      { name: "min", type: "number" },
      { name: "max", type: "number" },
      { name: "step", type: "number" },
    ]),
  },
  textarea: { tag: "textarea", attributes: withGlobal([{ name: "placeholder", type: "string" }, { name: "rows", type: "number" }, { name: "cols", type: "number" }]) },
  label: { tag: "label", attributes: withGlobal([{ name: "for", type: "string" }]) },
  select: { tag: "select", attributes: withGlobal([{ name: "multiple", type: "boolean" }]) },
  option: { tag: "option", attributes: withGlobal([{ name: "value", type: "string" }, { name: "selected", type: "boolean" }]) },
  ul: { tag: "ul", attributes: withGlobal([]) },
  ol: { tag: "ol", attributes: withGlobal([]) },
  li: { tag: "li", attributes: withGlobal([]) },
  section: { tag: "section", attributes: withGlobal([]) },
  article: { tag: "article", attributes: withGlobal([]) },
  header: { tag: "header", attributes: withGlobal([]) },
  footer: { tag: "footer", attributes: withGlobal([]) },
  nav: { tag: "nav", attributes: withGlobal([]) },
  form: { tag: "form", attributes: withGlobal([{ name: "action", type: "url" }, { name: "method", type: "enum", options: ["get", "post"] }]) },
  video: { tag: "video", attributes: withGlobal([{ name: "src", type: "url" }, { name: "controls", type: "boolean" }, { name: "autoplay", type: "boolean" }, { name: "loop", type: "boolean" }]) },
  audio: { tag: "audio", attributes: withGlobal([{ name: "src", type: "url" }, { name: "controls", type: "boolean" }, { name: "autoplay", type: "boolean" }, { name: "loop", type: "boolean" }]) },
  iframe: { tag: "iframe", attributes: withGlobal([{ name: "src", type: "url" }, { name: "width", type: "number" }, { name: "height", type: "number" }]) },
  canvas: { tag: "canvas", attributes: withGlobal([{ name: "width", type: "number" }, { name: "height", type: "number" }]) },
  script: { tag: "script", attributes: withGlobal([{ name: "src", type: "url" }]) },
  link: { tag: "link", void: true, attributes: withGlobal([{ name: "rel", type: "string", required: true }, { name: "href", type: "url", required: true }]) },
  hr: { tag: "hr", void: true, attributes: withGlobal([]) },
  br: { tag: "br", void: true, attributes: withGlobal([]) },
};

