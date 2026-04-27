export interface Entry {
  id: string
  name: string
  included: boolean
  spunOut: boolean
}

export type WheelStatus = 'inactive' | 'active' | 'spun'

export interface WheelState {
  entries: Entry[]
  removeOnSelect: boolean
  wheelStatus: WheelStatus
  winnerId: string | null
  previousEndDegree: number
  selectionOffset: number
  colorPrimary: string
  colorSecondary: string
  colorWinner: string
}

export type WheelAction =
  | { type: 'ADD_ENTRY'; name: string }
  | { type: 'REMOVE_ENTRY'; id: string }
  | { type: 'TOGGLE_INCLUDED'; id: string }
  | { type: 'SET_REMOVE_ON_SELECT'; value: boolean }
  | { type: 'ACTIVATE_WHEEL' }
  | {
      type: 'BEGIN_SPIN'
      winnerId: string
      previousEndDegree: number
      selectionOffset: number
    }
  | { type: 'CONFIRM_SPIN' }
  | { type: 'DISMISS_WHEEL' }
  | { type: 'RESET_SPUN_OUT' }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_COLORS'; colorPrimary: string; colorSecondary: string; colorWinner: string }
