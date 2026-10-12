import type { Shape } from '../types/shape'

const TYPE_LABELS: Record<Shape['type'], string> = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
}

interface LayersPanelProps {
  shapes: Shape[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="px-3 py-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        Layers
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        {shapes.length === 0 ? (
          <div className="px-2 text-sm text-zinc-400">No layers</div>
        ) : (
          [...shapes].reverse().map((shape, index) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                shape.id === selectedId
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span
                className={`h-3 w-3 shrink-0 border border-zinc-300 ${
                  shape.type === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'
                }`}
                style={{ backgroundColor: shape.fill }}
              />
              <span className="truncate">
                {TYPE_LABELS[shape.type]} {shapes.length - index}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
