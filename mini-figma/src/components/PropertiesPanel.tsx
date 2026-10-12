interface PropertiesPanelProps {
  fillColor: string | null
  onColorChange: (color: string) => void
}

export function PropertiesPanel({ fillColor, onColorChange }: PropertiesPanelProps) {
  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="px-3 py-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        Properties
      </div>
      {fillColor === null ? (
        <div className="px-3 pb-3 text-sm text-zinc-400">No selection</div>
      ) : (
        <label className="flex items-center gap-2 px-3 pb-3 text-sm text-zinc-700">
          Fill
          <input
            type="color"
            value={fillColor}
            onChange={(event) => onColorChange(event.target.value)}
            className="h-7 w-14 cursor-pointer rounded border border-zinc-200 bg-white p-0.5"
          />
        </label>
      )}
    </div>
  )
}
