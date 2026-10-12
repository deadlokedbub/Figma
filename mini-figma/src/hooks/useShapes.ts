import { useCallback, useEffect, useRef, useState } from 'react'
import { rectFromPoints } from '../utils/geometry'
import type { Point } from '../types/shape'
import type { Shape, ShapeType } from '../types/shape'

export interface NewShapeInput {
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
}

interface Draft {
  type: ShapeType
  start: Point
  end: Point
}

interface MoveDrag {
  id: string
  start: Point
  originX: number
  originY: number
  recorded: boolean
}

const MIN_SHAPE_SIZE = 2

let nextId = 1

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const draftRef = useRef<Draft | null>(null)
  const moveRef = useRef<MoveDrag | null>(null)
  const shapesRef = useRef<Shape[]>(shapes)
  const pastRef = useRef<Shape[][]>([])
  const futureRef = useRef<Shape[][]>([])

  useEffect(() => {
    shapesRef.current = shapes
  }, [shapes])

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0)
    setCanRedo(futureRef.current.length > 0)
  }, [])

  const pushHistory = useCallback(() => {
    pastRef.current.push(shapesRef.current)
    futureRef.current = []
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const undo = useCallback(() => {
    const previous = pastRef.current.pop()
    if (!previous) return
    futureRef.current.unshift(shapesRef.current)
    shapesRef.current = previous
    setShapes(previous)
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const redo = useCallback(() => {
    const next = futureRef.current.shift()
    if (!next) return
    pastRef.current.push(shapesRef.current)
    shapesRef.current = next
    setShapes(next)
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const addShape = useCallback(
    (input: NewShapeInput): Shape => {
      pushHistory()
      const shape: Shape = {
        id: `shape-${nextId++}`,
        fill: '#d9d9d9',
        stroke: '#0d99ff',
        strokeWidth: 1,
        ...input,
      }
      const next = [...shapesRef.current, shape]
      shapesRef.current = next
      setShapes(next)
      return shape
    },
    [pushHistory],
  )

  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id'>>) => {
    const next = shapesRef.current.map((shape) =>
      shape.id === id ? { ...shape, ...patch } : shape,
    )
    shapesRef.current = next
    setShapes(next)
  }, [])

  const removeShape = useCallback(
    (id: string) => {
      pushHistory()
      const next = shapesRef.current.filter((shape) => shape.id !== id)
      shapesRef.current = next
      setShapes(next)
      setSelectedId((current) => (current === id ? null : current))
    },
    [pushHistory],
  )

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const beginCreate = useCallback((type: ShapeType, start: Point) => {
    const next: Draft = { type, start, end: start }
    draftRef.current = next
    setDraft(next)
  }, [])

  const updateCreate = useCallback((end: Point) => {
    const current = draftRef.current
    if (!current) return
    const next: Draft = { ...current, end }
    draftRef.current = next
    setDraft(next)
  }, [])

  const endCreate = useCallback(() => {
    const current = draftRef.current
    draftRef.current = null
    setDraft(null)
    if (!current) return

    const rect = rectFromPoints(current.start, current.end)
    if (rect.width < MIN_SHAPE_SIZE || rect.height < MIN_SHAPE_SIZE) return

    const shape = addShape({ type: current.type, ...rect })
    setSelectedId(shape.id)
  }, [addShape])

  const beginMove = useCallback(
    (id: string, point: Point) => {
      const shape = shapesRef.current.find((item) => item.id === id)
      if (!shape) return
      moveRef.current = {
        id,
        start: point,
        originX: shape.x,
        originY: shape.y,
        recorded: false,
      }
      setDraggingId(id)
    },
    [],
  )

  const moveTo = useCallback(
    (point: Point) => {
      const drag = moveRef.current
      if (!drag) return
      if (!drag.recorded) {
        pushHistory()
        drag.recorded = true
      }
      updateShape(drag.id, {
        x: drag.originX + (point.x - drag.start.x),
        y: drag.originY + (point.y - drag.start.y),
      })
    },
    [pushHistory, updateShape],
  )

  const endMove = useCallback(() => {
    moveRef.current = null
    setDraggingId(null)
  }, [])

  const draftRect = draft ? rectFromPoints(draft.start, draft.end) : null

  return {
    shapes,
    selectedId,
    draggingId,
    draft: draft ? { type: draft.type, ...draftRect! } : null,
    canUndo,
    canRedo,
    addShape,
    updateShape,
    removeShape,
    selectShape,
    beginCreate,
    updateCreate,
    endCreate,
    beginMove,
    moveTo,
    endMove,
    pushHistory,
    undo,
    redo,
  }
}
