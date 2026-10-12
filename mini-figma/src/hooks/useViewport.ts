import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DEFAULT_GRID_SIZE } from '../constants/viewport'
import { zoomAt } from '../utils/geometry'
import type { Viewport } from '../utils/geometry'

const WHEEL_ZOOM_FACTOR = 1.0015

function initialViewport(width: number, height: number): Viewport {
  return { x: width / 2, y: height / 2, zoom: 1 }
}

export function useViewport(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>(() =>
    initialViewport(window.innerWidth, window.innerHeight),
  )
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)

  const spacePressed = useRef(false)
  const panning = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    setViewport(initialViewport(rect.width, rect.height))
  }, [containerRef])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || spacePressed.current) return
      event.preventDefault()
      spacePressed.current = true
      setIsSpacePressed(true)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      spacePressed.current = false
      setIsSpacePressed(false)
      if (panning.current) {
        panning.current = false
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_FACTOR)
      setViewport((current) => zoomAt(current, factor, anchor))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [containerRef])

  const onPointerDown = (event: ReactPointerEvent) => {
    if (!spacePressed.current || event.button !== 0) return
    event.preventDefault()
    panning.current = true
    setIsPanning(true)
    lastPoint.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    if (!panning.current) return
    const dx = event.clientX - lastPoint.current.x
    const dy = event.clientY - lastPoint.current.y
    lastPoint.current = { x: event.clientX, y: event.clientY }
    setViewport((current) => ({ ...current, x: current.x + dx, y: current.y + dy }))
  }

  const onPointerUp = (event: ReactPointerEvent) => {
    if (!panning.current) return
    panning.current = false
    setIsPanning(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const gridStyle = {
    backgroundSize: `${DEFAULT_GRID_SIZE * viewport.zoom}px ${DEFAULT_GRID_SIZE * viewport.zoom}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
  }

  return {
    viewport,
    gridStyle,
    isSpacePressed,
    cursor: isPanning ? 'grabbing' : isSpacePressed ? 'grab' : undefined,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
  }
}
