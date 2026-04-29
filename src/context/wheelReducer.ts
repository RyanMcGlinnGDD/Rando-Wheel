import type { WheelState, WheelAction } from '../types'

export const initialState: WheelState = {
  entries: [],
  removeOnSelect: false,
  wheelStatus: 'inactive',
  winnerId: null,
  colorPrimary: '#228be6',
  colorSecondary: '#000000',
  colorTertiary: '#c92a2a',
}

export function wheelReducer(state: WheelState, action: WheelAction): WheelState {
  switch (action.type) {
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [
          ...state.entries,
          { id: crypto.randomUUID(), name: action.name.trim(), included: true },
        ],
      }

    case 'REMOVE_ENTRY': {
      const remaining = state.entries.filter(e => e.id !== action.id)
      const hasChecked = remaining.some(e => e.included)
      return {
        ...state,
        entries: hasChecked ? remaining : remaining.map(e => ({ ...e, included: true })),
      }
    }

    case 'TOGGLE_INCLUDED':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.id ? { ...e, included: !e.included } : e,
        ),
      }

    case 'SET_REMOVE_ON_SELECT':
      return { ...state, removeOnSelect: action.value }

    case 'BEGIN_SPIN':
      return { ...state, wheelStatus: 'spun', winnerId: null }

    case 'REVEAL_WINNER':
      return { ...state, winnerId: action.winnerId }

    case 'CONFIRM_SPIN': {
      if (!state.removeOnSelect) {
        return { ...state, wheelStatus: 'inactive', winnerId: null }
      }
      const { winnerId } = state
      const includedCount = state.entries.filter(e => e.included).length
      const shouldReset = includedCount <= 1
      return {
        ...state,
        wheelStatus: 'inactive',
        winnerId: null,
        entries: shouldReset
          ? state.entries.map(e => ({ ...e, included: true }))
          : state.entries.map(e =>
              e.id === winnerId ? { ...e, included: false } : e,
            ),
      }
    }

    case 'RESET_SPUN_OUT':
      return { ...state, entries: state.entries.map(e => ({ ...e, included: true })) }

    case 'CLEAR_ALL':
      return { ...state, entries: [] }

    case 'SET_COLORS':
      return {
        ...state,
        colorPrimary: action.colorPrimary,
        colorSecondary: action.colorSecondary,
        colorTertiary: action.colorTertiary,
      }

    default:
      return state
  }
}
