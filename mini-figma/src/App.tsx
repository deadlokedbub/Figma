import { useState } from 'react'
import { Canvas } from './components/Canvas'
import { LayersPanel } from './components/LayersPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Toolbar } from './components/Toolbar'
import { REDO_SHORTCUT, TOOL_SHORTCUTS, UNDO_SHORTCUT } from './constants/tools'
import { useHotkeys } from './hooks/useHotkeys'
import type { HotkeyMap } from './hooks/useHotkeys'
import { useShapes } from './hooks/useShapes'
import type { Tool } from './types/shape'

export default function App() {
  const shapesState = useShapes()
  const [tool, setTool] = useState<Tool>('select')

  const toolHotkeys = Object.fromEntries(
    Object.entries(TOOL_SHORTCUTS).map(([key, nextTool]) => [key, () => setTool(nextTool)]),
  ) as HotkeyMap

  useHotkeys({
    ...toolHotkeys,
    [UNDO_SHORTCUT]: shapesState.undo,
    [REDO_SHORTCUT]: shapesState.redo,
  })

  const selectedShape =
    shapesState.shapes.find((shape) => shape.id === shapesState.selectedId) ?? null

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas shapesState={shapesState} tool={tool} />
      <Toolbar activeTool={tool} onSelect={setTool} />
      <div className="absolute top-3 right-3 bottom-3 z-10 flex w-56 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <PropertiesPanel
          fillColor={selectedShape?.fill ?? null}
          onColorChange={(color) => {
            if (!selectedShape) return
            shapesState.pushHistory()
            shapesState.updateShape(selectedShape.id, { fill: color })
          }}
        />
        <LayersPanel
          shapes={shapesState.shapes}
          selectedId={shapesState.selectedId}
          onSelect={shapesState.selectShape}
        />
      </div>
    </div>
  )
}
