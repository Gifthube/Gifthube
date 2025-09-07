import { useMemo, useState } from 'react'
import './App.css'
import { Toolbox } from './components/Toolbox'
import { Layers } from './components/Layers'
import { AttributesPanel } from './components/AttributesPanel'
import { CodePreview } from './components/CodePreview'
import { Canvas } from './components/Canvas'
import { createEmptyDocument, addElement, deleteElement, moveElement, updateAttribute, findElementById } from './state/document'
import { DocumentModel, ElementType } from './domain/types'

function App() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(() => {
    const { node } = findElementById(doc.root, selectedId || '')
    return node ?? null
  }, [doc, selectedId])

  function handleAdd(tag: ElementType) {
    setDoc((prev) => {
      const copy: DocumentModel = { root: structuredClone(prev.root) }
      addElement(copy, tag, selectedId || undefined)
      return copy
    })
  }

  function handleDelete(id: string) {
    setDoc((prev) => {
      const copy: DocumentModel = { root: structuredClone(prev.root) }
      deleteElement(copy, id)
      return copy
    })
    if (selectedId === id) setSelectedId(null)
  }

  function handleMove(id: string, dir: 'up' | 'down') {
    setDoc((prev) => {
      const copy: DocumentModel = { root: structuredClone(prev.root) }
      moveElement(copy, id, dir)
      return copy
    })
  }

  function handleAttr(name: string, value: unknown) {
    if (!selectedId) return
    setDoc((prev) => {
      const copy: DocumentModel = { root: structuredClone(prev.root) }
      updateAttribute(copy, selectedId, name, value)
      return copy
    })
  }

  return (
    <div className="app-shell">
      <aside className="left">
        <Toolbox onAdd={handleAdd} />
        <div className="divider" />
        <Layers
          nodes={doc.root}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      </aside>
      <main className="center">
        <div className="toolbar">
          <button onClick={() => setDoc(createEmptyDocument())}>New</button>
        </div>
        <div className="canvas-wrap">
          <div className="canvas-title">Canvas</div>
          <div className="canvas-scroll">
            <Canvas nodes={doc.root} selectedId={selectedId} onSelect={(id) => setSelectedId(id || null)} />
          </div>
        </div>
      </main>
      <aside className="right">
        <AttributesPanel selected={selected} onChange={handleAttr} />
        <div className="divider" />
        <CodePreview documentModel={doc} />
      </aside>
    </div>
  )
}

export default App
