import type { WheelState, WheelAction } from '../types'

export const initialState: WheelState = {
  entries: [],
  removeOnSelect: false,
  wheelStatus: 'inactive',
  winnerId: null,
  previousEndDegree: 0,
  selectionOffset: 0,
  colorPrimary: 'var(--mantine-color-blue-6)',
  colorSecondary: 'var(--mantine-color-white)',
  colorWinner: 'var(--mantine-color-red-7)',
}

export function wheelReducer(state: WheelState, action: WheelAction): WheelState {
  switch (action.type) {
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [
          ...state.entries,
          { id: crypto.randomUUID(), name: action.name.trim(), included: true, spunOut: false },
        ],
      }

    case 'REMOVE_ENTRY':
      return { ...state, entries: state.entries.filter(e => e.id !== action.id) }

    case 'TOGGLE_INCLUDED':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.id ? { ...e, included: !e.included } : e,
        ),
      }

    case 'SET_REMOVE_ON_SELECT':
      return { ...state, removeOnSelect: action.value }

    case 'ACTIVATE_WHEEL':
      return { ...state, wheelStatus: 'active' }

    case 'BEGIN_SPIN':
      return {
        ...state,
        wheelStatus: 'spun',
        winnerId: action.winnerId,
        previousEndDegree: action.previousEndDegree,
        selectionOffset: action.selectionOffset,
      }

    case 'CONFIRM_SPIN': {
      if (!state.removeOnSelect) {
        return { ...state, wheelStatus: 'inactive', winnerId: null }
      }
      const { winnerId } = state
      const includedCount = state.entries.filter(e => e.included).length
      const spunOutCount = state.entries.filter(e => e.included && e.spunOut).length
      const shouldReset = spunOutCount >= includedCount - 1
      return {
        ...state,
        wheelStatus: 'inactive',
        winnerId: null,
        entries: shouldReset
          ? state.entries.map(e => ({ ...e, spunOut: false }))
          : state.entries.map(e =>
              e.id === winnerId ? { ...e, spunOut: true } : e,
            ),
      }
    }

    case 'DISMISS_WHEEL':
      return { ...state, wheelStatus: 'inactive' }

    case 'RESET_SPUN_OUT':
      return { ...state, entries: state.entries.map(e => ({ ...e, spunOut: false })) }

    case 'CLEAR_ALL':
      return { ...state, entries: [] }

    case 'SET_COLORS':
      return {
        ...state,
        colorPrimary: action.colorPrimary,
        colorSecondary: action.colorSecondary,
        colorWinner: action.colorWinner,
      }

    default:
      return state
  }
}
