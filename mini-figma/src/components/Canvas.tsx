import { useRef } from 'react'
import { useShapes } from '../hooks/useShapes'
import { useViewport } from '../hooks/useViewport'
import { screenToCanvas } from '../utils/geometry'
import type { Point, Tool } from '../types/shape'
import { Shape } from './Shape'

interface CanvasProps {
  shapesState: ReturnType<typeof useShapes>
  tool: Tool
}

type Interaction = 'none' | 'draw' | 'move'

export function Canvas({ shapesState, tool }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<Interaction>('none')
  const { viewport, gridStyle, cursor, isSpacePressed, handlers } = useViewport(containerRef)
  const {
    shapes,
    selectedId,
    draft,
    selectShape,
    beginCreate,
    updateCreate,
    endCreate,
    beginMove,
    moveTo,
    endMove,
  } = shapesState

  const toCanvasPoint = (clientX: number, clientY: number): Point => {
    const rect = containerRef.current!.getBoundingClientRect()
    return screenToCanvas({ x: clientX - rect.left, y: clientY - rect.top }, viewport)
  }

  const isDrawingTool = tool === 'rectangle' || tool === 'ellipse'
  const canSelect = tool === 'select' && !isSpacePressed

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    handlers.onPointerDown(event)
    if (event.button !== 0 || isSpacePressed) return

    if (isDrawingTool) {
      event.preventDefault()
      interactionRef.current = 'draw'
      containerRef.current?.setPointerCapture(event.pointerId)
      beginCreate(tool, toCanvasPoint(event.clientX, event.clientY))
      return
    }

    if (event.target === event.currentTarget) selectShape(null)
  }

  const handleShapePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    id: string,
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    interactionRef.current = 'move'
    containerRef.current?.setPointerCapture(event.pointerId)
    selectShape(id)
    beginMove(id, toCanvasPoint(event.clientX, event.clientY))
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    handlers.onPointerMove(event)
    if (interactionRef.current === 'draw' && draft) {
      updateCreate(toCanvasPoint(event.clientX, event.clientY))
    } else if (interactionRef.current === 'move') {
      moveTo(toCanvasPoint(event.clientX, event.clientY))
    }
  }

  const finishInteraction = (event: React.PointerEvent<HTMLDivElement>) => {
    handlers.onPointerUp(event)
    const interaction = interactionRef.current
    if (interaction === 'none') return

    interactionRef.current = 'none'
    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }
    if (interaction === 'draw') endCreate()
    if (interaction === 'move') endMove()
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-[#f5f5f5]"
      style={{
        ...gridStyle,
        cursor: cursor ?? (isDrawingTool && !isSpacePressed ? 'crosshair' : undefined),
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishInteraction}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedId}
            zoom={viewport.zoom}
            onPointerDown={
              canSelect
                ? (event) => handleShapePointerDown(event, shape.id)
                : undefined
            }
          />
        ))}
        {draft && (
          <div
            className="absolute border border-dashed border-blue-500 bg-blue-500/10"
            style={{
              left: draft.x,
              top: draft.y,
              width: draft.width,
              height: draft.height,
              borderRadius: draft.type === 'ellipse' ? '9999px' : undefined,
            }}
          />
        )}
      </div>
    </div>
  )
}
