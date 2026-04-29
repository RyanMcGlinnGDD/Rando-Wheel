export interface Entry {
  id: string
  name: string
  included: boolean
}

export type WheelStatus = 'inactive' | 'spun'

export interface WheelState {
  entries: Entry[]
  removeOnSelect: boolean
  wheelStatus: WheelStatus
  winnerId: string | null
  colorPrimary: string
  colorSecondary: string
  colorTertiary: string
}

export type WheelAction =
  | { type: 'ADD_ENTRY'; name: string }
  | { type: 'REMOVE_ENTRY'; id: string }
  | { type: 'TOGGLE_INCLUDED'; id: string }
  | { type: 'SET_REMOVE_ON_SELECT'; value: boolean }
  | { type: 'BEGIN_SPIN' }
  | { type: 'REVEAL_WINNER'; winnerId: string }
  | { type: 'CONFIRM_SPIN' }
  | { type: 'RESET_SPUN_OUT' }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_COLORS'; colorPrimary: string; colorSecondary: string; colorTertiary: string }
