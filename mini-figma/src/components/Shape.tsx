import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Shape as ShapeModel } from '../types/shape'

const HANDLE_SIZE = 8
const SELECTION_COLOR = '#0d99ff'

const HANDLE_ANCHORS: Array<[number, number]> = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [0, 1],
  [0.5, 1],
  [1, 1],
  [0, 0.5],
  [1, 0.5],
]

interface ShapeProps {
  shape: ShapeModel
  selected: boolean
  zoom: number
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export function Shape({ shape, selected, zoom, onPointerDown }: ShapeProps) {
  const isEllipse = shape.type === 'ellipse'
  const handleSize = HANDLE_SIZE / zoom
  const half = handleSize / 2

  return (
    <div
      className={`absolute ${isEllipse ? 'rounded-full' : 'rounded-sm'}`}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        backgroundColor: shape.fill,
        border: `${shape.strokeWidth}px solid ${shape.stroke}`,
        outline: selected ? `1px solid ${SELECTION_COLOR}` : undefined,
        cursor: onPointerDown ? 'move' : undefined,
      }}
      onPointerDown={onPointerDown}
    >
      {selected &&
        HANDLE_ANCHORS.map(([ax, ay]) => (
          <span
            key={`${ax}-${ay}`}
            className="pointer-events-none absolute rounded-[1px] border"
            style={{
              width: handleSize,
              height: handleSize,
              left: shape.width * ax - half,
              top: shape.height * ay - half,
              backgroundColor: '#ffffff',
              borderColor: SELECTION_COLOR,
            }}
          />
        ))}
    </div>
  )
}
