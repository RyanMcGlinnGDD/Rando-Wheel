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
  'entries' | 'removeOnSelect' | 'colorPrimary' | 'colorSecondary' | 'colorTertiary'
>

function loadFromStorage(): Partial<WheelState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistentSlice
    // Ensure entries from older stored data always have included defined
    return { ...parsed, entries: parsed.entries?.map(e => ({ included: true, ...e })) ?? [] }
  } catch {
    return {}
  }
}

const WheelStateContext = createContext<WheelState | null>(null)
const WheelDispatchContext = createContext<Dispatch<WheelAction> | null>(null)

export function WheelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wheelReducer, {
    ...initialState,
    ...loadFromStorage(),
  })

  const { entries, removeOnSelect, colorPrimary, colorSecondary, colorTertiary } = state
  useEffect(() => {
    const slice: PersistentSlice = { entries, removeOnSelect, colorPrimary, colorSecondary, colorTertiary }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
  }, [entries, removeOnSelect, colorPrimary, colorSecondary, colorTertiary])

  return (
    <WheelStateContext.Provider value={state}>
      <WheelDispatchContext.Provider value={dispatch}>
        {children}
      </WheelDispatchContext.Provider>
    </WheelStateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWheelState(): WheelState {
  const ctx = useContext(WheelStateContext)
  if (!ctx) throw new Error('useWheelState must be used inside WheelProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWheelDispatch(): Dispatch<WheelAction> {
  const ctx = useContext(WheelDispatchContext)
  if (!ctx) throw new Error('useWheelDispatch must be used inside WheelProvider')
  return ctx
}
