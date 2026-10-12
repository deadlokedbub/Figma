import { TOOLS } from '../constants/tools'
import type { Tool } from '../types/shape'

interface ToolbarProps {
  activeTool: Tool
  onSelect: (tool: Tool) => void
}

export function Toolbar({ activeTool, onSelect }: ToolbarProps) {
  return (
    <div className="absolute top-1/2 left-3 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          title={`${tool.label} (${tool.shortcut})`}
          onClick={() => onSelect(tool.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-sm ${
            tool.id === activeTool
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          {tool.label.charAt(0)}
        </button>
      ))}
    </div>
  )
}
