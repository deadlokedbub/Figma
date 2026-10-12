import type { Tool } from '../types/shape'

export interface ToolDefinition {
  id: Tool
  label: string
  shortcut: string
}

export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Move', shortcut: 'V' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O' },
]

export const DEFAULT_TOOL: Tool = 'select'

export const TOOL_SHORTCUTS: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((tool) => [tool.shortcut.toLowerCase(), tool.id]),
)

export const UNDO_SHORTCUT = 'ctrl+z'
export const REDO_SHORTCUT = 'ctrl+shift+z'
