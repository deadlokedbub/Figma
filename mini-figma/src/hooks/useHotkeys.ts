import { useEffect, useRef } from 'react'

export type HotkeyHandler = (event: KeyboardEvent) => void
export type HotkeyMap = Record<string, HotkeyHandler>

function combosFromEvent(event: KeyboardEvent): string[] {
  const modifiers: string[] = []
  if (event.ctrlKey || event.metaKey) modifiers.push('ctrl')
  if (event.shiftKey) modifiers.push('shift')
  if (event.altKey) modifiers.push('alt')

  const keys = new Set<string>()
  keys.add(event.key.toLowerCase())
  if (event.code.startsWith('Key')) keys.add(event.code.slice(3).toLowerCase())
  if (event.code.startsWith('Digit')) keys.add(event.code.slice(5))

  return [...keys].map((key) => [...modifiers, key].join('+'))
}

export function useHotkeys(hotkeys: HotkeyMap) {
  const hotkeysRef = useRef(hotkeys)

  useEffect(() => {
    hotkeysRef.current = hotkeys
  }, [hotkeys])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      const handler = combosFromEvent(event)
        .map((combo) => hotkeysRef.current[combo])
        .find(Boolean)
      if (!handler) return

      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
