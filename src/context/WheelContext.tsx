import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'
import { wheelReducer, initialState } from './wheelReducer'
import type { WheelState, WheelAction } from '../types'

const STORAGE_KEY = 'rando-wheel-state'

type PersistentSlice = Pick<
  WheelState,
  'entries' | 'removeOnSelect' | 'colorPrimary' | 'colorSecondary' | 'colorWinner'
>

function loadFromStorage(): Partial<WheelState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as PersistentSlice
  } catch {
    return {}
  }
}

function saveToStorage(state: WheelState): void {
  const slice: PersistentSlice = {
    entries: state.entries,
    removeOnSelect: state.removeOnSelect,
    colorPrimary: state.colorPrimary,
    colorSecondary: state.colorSecondary,
    colorWinner: state.colorWinner,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
}

const WheelStateContext = createContext<WheelState | null>(null)
const WheelDispatchContext = createContext<Dispatch<WheelAction> | null>(null)

export function WheelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wheelReducer, {
    ...initialState,
    ...loadFromStorage(),
  })

  useEffect(() => {
    saveToStorage(state)
  }, [state.entries, state.removeOnSelect, state.colorPrimary, state.colorSecondary, state.colorWinner])

  return (
    <WheelStateContext.Provider value={state}>
      <WheelDispatchContext.Provider value={dispatch}>
        {children}
      </WheelDispatchContext.Provider>
    </WheelStateContext.Provider>
  )
}

export function useWheelState(): WheelState {
  const ctx = useContext(WheelStateContext)
  if (!ctx) throw new Error('useWheelState must be used inside WheelProvider')
  return ctx
}

export function useWheelDispatch(): Dispatch<WheelAction> {
  const ctx = useContext(WheelDispatchContext)
  if (!ctx) throw new Error('useWheelDispatch must be used inside WheelProvider')
  return ctx
}
