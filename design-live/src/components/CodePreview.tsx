import { DocumentModel } from "../domain/types";
import { generateHtml } from "../domain/generateHtml";

interface CodePreviewProps {
  documentModel: DocumentModel;
}

export function CodePreview({ documentModel }: CodePreviewProps) {
  const html = generateHtml(documentModel);
  const pretty = html || "<!-- Empty document -->";
  const blob = new Blob([`<!doctype html><html><head><meta charset=\"utf-8\" /></head><body>${html}</body></html>`], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  return (
    <div className="code-preview">
      <h3>HTML</h3>
      <pre className="code-block">{pretty}</pre>
      <h3>Preview</h3>
      <iframe src={url} title="Live Preview" />
    </div>
  );
}

export default CodePreview;

