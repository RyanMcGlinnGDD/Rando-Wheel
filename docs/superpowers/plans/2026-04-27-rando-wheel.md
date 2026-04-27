# Rando-Wheel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone React SPA replicating the guess-who spinning wheel with a flexible user-managed entry list, Mantine styling, and TanStack Router.

**Architecture:** React Context + useReducer for all app state; only the persistent slice (entries, settings, colors) is synced to localStorage — ephemeral wheel state initializes fresh each session. TanStack Router with code-based routing provides the app shell and leaves room for a future `/settings` route. The wheel uses the CSS Grid + `clip-path` segment technique and the Web Animation API for spin animation, ported directly from guess-who.

**Tech Stack:** React 18, TypeScript, Mantine 7, TanStack Router v1, Vite, Vitest, React Testing Library

---

## File Map

```
public/
  pin.png                              # Copied from guess-who/assets/game/pin.png
src/
  main.tsx                             # App entry: RouterProvider
  types.ts                             # Shared TypeScript types + action union
  routes/
    __root.tsx                         # Root layout: MantineProvider + WheelProvider
    index.tsx                          # / route → WheelPage
  context/
    wheelReducer.ts                    # Pure reducer + initialState
    wheelReducer.test.ts               # Reducer unit tests
    WheelContext.tsx                   # Context, Provider, useWheelState, useWheelDispatch
  utils/
    spinCalculation.ts                 # pickWinner(), computeDegrees(), normalizeDegree()
    spinCalculation.test.ts            # Spin utility unit tests
  components/
    WheelArea/
      WheelArea.tsx                    # Logic hub: ref, spin/cleanup, click handlers, composition
      WheelSpinner.tsx                 # Presentational: renders ul/li segments
      WheelSpinner.module.css          # Segment CSS (grid, clip-path, transitions, colors)
      Shader.tsx                       # Dark backdrop div
      SpinButton.tsx                   # Center hub SPIN! button
      WinnerBadge.tsx                  # Animated winner name display
      PinIndicator.tsx                 # Bouncing pin image
    EntrySidebar/
      EntrySidebar.tsx                 # Sidebar shell + layout
      AddEntryForm.tsx                 # TextInput + submit ActionIcon
      EntryList.tsx                    # ScrollArea wrapping EntryRow list
      EntryRow.tsx                     # Checkbox + name + spun Badge + remove ActionIcon
      SidebarControls.tsx              # Switch + Reset Spun Button + Clear All Button
  test/
    setup.ts                           # @testing-library/jest-dom import
index.html
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
vitest.config.ts
```

---

## Task 1: Project Scaffolding

**Files:** `package.json`, `vite.config.ts`, `tsconfig.app.json`, `vitest.config.ts`, `index.html`, `src/test/setup.ts`

- [ ] **Step 1: Initialize Vite + React + TypeScript**

Run inside `v:/code/github/Rando-Wheel` (choose "ignore files and continue" when prompted):
```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Delete boilerplate files**

Delete: `src/App.css`, `src/App.tsx`, `src/index.css`, `src/assets/react.svg`, `public/vite.svg`

- [ ] **Step 3: Install dependencies**

```bash
npm install @mantine/core @mantine/hooks @tanstack/react-router
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 4: Replace vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 5: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 6: Create src/test/setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Replace tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Add test script to package.json**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Copy pin asset**

```bash
cp ../guess-who/assets/game/pin.png public/pin.png
```

- [ ] **Step 10: Replace index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rando Wheel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Verify baseline**

```bash
npm test
```
Expected: "No test files found" with exit 0 (no errors).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite, Mantine, TanStack Router, Vitest"
```

---

## Task 2: Types

**Files:** Create `src/types.ts`

- [ ] **Step 1: Create types file**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Wheel Reducer (TDD)

**Files:** Create `src/context/wheelReducer.ts`, `src/context/wheelReducer.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/context/wheelReducer.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { wheelReducer, initialState } from './wheelReducer'
import type { WheelState, Entry } from '../types'

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: crypto.randomUUID(),
  name: 'Alice',
  included: true,
  spunOut: false,
  ...overrides,
})

describe('wheelReducer', () => {
  describe('ADD_ENTRY', () => {
    it('adds an entry with included=true and spunOut=false', () => {
      const next = wheelReducer(initialState, { type: 'ADD_ENTRY', name: 'Alice' })
      expect(next.entries).toHaveLength(1)
      expect(next.entries[0]).toMatchObject({ name: 'Alice', included: true, spunOut: false })
      expect(next.entries[0].id).toBeTruthy()
    })

    it('trims whitespace from the name', () => {
      const next = wheelReducer(initialState, { type: 'ADD_ENTRY', name: '  Bob  ' })
      expect(next.entries[0].name).toBe('Bob')
    })
  })

  describe('REMOVE_ENTRY', () => {
    it('removes the entry with the given id', () => {
      const entry = makeEntry()
      const state: WheelState = { ...initialState, entries: [entry] }
      const next = wheelReducer(state, { type: 'REMOVE_ENTRY', id: entry.id })
      expect(next.entries).toHaveLength(0)
    })

    it('leaves other entries intact', () => {
      const a = makeEntry({ name: 'Alice' })
      const b = makeEntry({ name: 'Bob' })
      const state: WheelState = { ...initialState, entries: [a, b] }
      const next = wheelReducer(state, { type: 'REMOVE_ENTRY', id: a.id })
      expect(next.entries).toHaveLength(1)
      expect(next.entries[0].name).toBe('Bob')
    })
  })

  describe('TOGGLE_INCLUDED', () => {
    it('flips included from true to false', () => {
      const entry = makeEntry({ included: true })
      const state: WheelState = { ...initialState, entries: [entry] }
      const next = wheelReducer(state, { type: 'TOGGLE_INCLUDED', id: entry.id })
      expect(next.entries[0].included).toBe(false)
    })

    it('flips included from false to true', () => {
      const entry = makeEntry({ included: false })
      const state: WheelState = { ...initialState, entries: [entry] }
      const next = wheelReducer(state, { type: 'TOGGLE_INCLUDED', id: entry.id })
      expect(next.entries[0].included).toBe(true)
    })
  })

  describe('SET_REMOVE_ON_SELECT', () => {
    it('sets removeOnSelect', () => {
      const next = wheelReducer(initialState, { type: 'SET_REMOVE_ON_SELECT', value: true })
      expect(next.removeOnSelect).toBe(true)
    })
  })

  describe('ACTIVATE_WHEEL', () => {
    it('sets wheelStatus to active', () => {
      const next = wheelReducer(initialState, { type: 'ACTIVATE_WHEEL' })
      expect(next.wheelStatus).toBe('active')
    })
  })

  describe('BEGIN_SPIN', () => {
    it('sets winnerId, degrees, offset, and wheelStatus to spun', () => {
      const entry = makeEntry()
      const state: WheelState = { ...initialState, entries: [entry] }
      const next = wheelReducer(state, {
        type: 'BEGIN_SPIN',
        winnerId: entry.id,
        previousEndDegree: 1800,
        selectionOffset: 0,
      })
      expect(next.winnerId).toBe(entry.id)
      expect(next.previousEndDegree).toBe(1800)
      expect(next.selectionOffset).toBe(0)
      expect(next.wheelStatus).toBe('spun')
    })
  })

  describe('CONFIRM_SPIN', () => {
    it('sets wheelStatus to inactive and clears winnerId', () => {
      const entry = makeEntry()
      const state: WheelState = {
        ...initialState,
        entries: [entry],
        wheelStatus: 'spun',
        winnerId: entry.id,
        removeOnSelect: false,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.wheelStatus).toBe('inactive')
      expect(next.winnerId).toBeNull()
    })

    it('does not mark spunOut when removeOnSelect is false', () => {
      const entry = makeEntry()
      const state: WheelState = {
        ...initialState,
        entries: [entry],
        wheelStatus: 'spun',
        winnerId: entry.id,
        selectionOffset: 0,
        removeOnSelect: false,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries[0].spunOut).toBe(false)
    })

    it('marks winner as spunOut when removeOnSelect is true and pool is not exhausted', () => {
      const winner = makeEntry({ name: 'Alice' })
      const other = makeEntry({ name: 'Bob' })
      const state: WheelState = {
        ...initialState,
        entries: [winner, other],
        wheelStatus: 'spun',
        winnerId: winner.id,
        selectionOffset: 0,
        removeOnSelect: true,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries.find(e => e.id === winner.id)?.spunOut).toBe(true)
      expect(next.entries.find(e => e.id === other.id)?.spunOut).toBe(false)
    })

    it('resets all spunOut flags when the last included entry wins', () => {
      const winner = makeEntry({ name: 'Alice', spunOut: false })
      const exhausted = makeEntry({ name: 'Bob', spunOut: true })
      const state: WheelState = {
        ...initialState,
        entries: [winner, exhausted],
        wheelStatus: 'spun',
        winnerId: winner.id,
        selectionOffset: 0,
        removeOnSelect: true,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries.every(e => !e.spunOut)).toBe(true)
    })
  })

  describe('DISMISS_WHEEL', () => {
    it('sets wheelStatus to inactive', () => {
      const state: WheelState = { ...initialState, wheelStatus: 'active' }
      const next = wheelReducer(state, { type: 'DISMISS_WHEEL' })
      expect(next.wheelStatus).toBe('inactive')
    })
  })

  describe('RESET_SPUN_OUT', () => {
    it('clears spunOut on all entries', () => {
      const entries = [
        makeEntry({ spunOut: true }),
        makeEntry({ spunOut: true }),
        makeEntry({ spunOut: false }),
      ]
      const state: WheelState = { ...initialState, entries }
      const next = wheelReducer(state, { type: 'RESET_SPUN_OUT' })
      expect(next.entries.every(e => !e.spunOut)).toBe(true)
    })
  })

  describe('CLEAR_ALL', () => {
    it('empties the entry list', () => {
      const state: WheelState = { ...initialState, entries: [makeEntry(), makeEntry()] }
      const next = wheelReducer(state, { type: 'CLEAR_ALL' })
      expect(next.entries).toHaveLength(0)
    })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```
Expected: FAIL — `Cannot find module './wheelReducer'`

- [ ] **Step 3: Implement the reducer**

Create `src/context/wheelReducer.ts`:
```ts
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
              e.id === state.winnerId ? { ...e, spunOut: true } : e,
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/wheelReducer.ts src/context/wheelReducer.test.ts
git commit -m "feat: add wheel reducer with full test coverage"
```

---

## Task 4: Spin Calculation Utilities (TDD)

**Files:** Create `src/utils/spinCalculation.ts`, `src/utils/spinCalculation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/spinCalculation.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { pickWinner, computeDegrees, normalizeDegree } from './spinCalculation'
import type { Entry } from '../types'

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: crypto.randomUUID(),
  name: 'Test',
  included: true,
  spunOut: false,
  ...overrides,
})

afterEach(() => vi.restoreAllMocks())

describe('pickWinner', () => {
  it('returns -1 when no entries are eligible', () => {
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: true }),
    ]
    expect(pickWinner(entries)).toBe(-1)
  })

  it('returns the index of the first eligible entry when random=0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: false }),
      makeEntry({ included: true, spunOut: false }),
    ]
    // eligible = [index 1, index 2]; Math.floor(0 * 2) = 0 → index 1
    expect(pickWinner(entries)).toBe(1)
  })

  it('skips spunOut entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: true, spunOut: true }),
      makeEntry({ included: true, spunOut: false }),
    ]
    expect(pickWinner(entries)).toBe(1)
  })

  it('skips manually excluded entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: false }),
    ]
    expect(pickWinner(entries)).toBe(1)
  })
})

describe('computeDegrees', () => {
  it('computes correctly for the first spin (all zeros)', () => {
    // fraction = 360/4 = 90
    // (360 - 0*90*-1 - 2160 - 0 - 0*90) * -1 = (360 - 2160) * -1 = 1800
    expect(computeDegrees(0, 4, 0, 0)).toBe(1800)
  })

  it('offsets for a non-zero target index', () => {
    // (360 - 1*90*-1 - 2160 - 0 - 0*90) * -1 = (360 + 90 - 2160) * -1 = 1710
    expect(computeDegrees(1, 4, 0, 0)).toBe(1710)
  })
})

describe('normalizeDegree', () => {
  it('returns degree mod 360', () => {
    expect(normalizeDegree(1800)).toBe(0)   // 5 * 360 = 1800
    expect(normalizeDegree(1710)).toBe(270) // 4 * 360 = 1440, 1710 - 1440 = 270
    expect(normalizeDegree(90)).toBe(90)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```
Expected: FAIL — `Cannot find module './spinCalculation'`

- [ ] **Step 3: Implement spin utilities**

Create `src/utils/spinCalculation.ts`:
```ts
import type { Entry } from '../types'

export function pickWinner(entries: Entry[]): number {
  const eligible = entries.map((e, i) => ({ e, i })).filter(({ e }) => e.included && !e.spunOut)
  if (eligible.length === 0) return -1
  return eligible[Math.floor(Math.random() * eligible.length)].i
}

export function computeDegrees(
  targetIndex: number,
  totalEntries: number,
  previousEndDegree: number,
  selectionOffset: number,
): number {
  const fraction = 360 / totalEntries
  return (
    (360 - targetIndex * fraction * -1 - 2160 - previousEndDegree - selectionOffset * fraction) * -1
  )
}

export function normalizeDegree(degree: number): number {
  return degree % 360
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/spinCalculation.ts src/utils/spinCalculation.test.ts
git commit -m "feat: add spin calculation utilities with tests"
```

---

## Task 5: WheelContext + localStorage Persistence

**Files:** Create `src/context/WheelContext.tsx`

- [ ] **Step 1: Create the context, provider, and hooks**

Create `src/context/WheelContext.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/WheelContext.tsx
git commit -m "feat: add WheelContext with localStorage persistence"
```

---

## Task 6: Router + App Shell

**Files:** Create `src/main.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`

- [ ] **Step 1: Create root route**

Create `src/routes/__root.tsx`:
```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { WheelProvider } from '../context/WheelContext'
import '@mantine/core/styles.css'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <WheelProvider>
        <Outlet />
      </WheelProvider>
    </MantineProvider>
  )
}
```

- [ ] **Step 2: Create index route (temporary placeholder)**

Create `src/routes/index.tsx`:
```tsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div style={{ color: 'white', padding: 24 }}>Rando-Wheel — scaffold OK</div>
  ),
})
```

- [ ] **Step 3: Create main.tsx**

Create `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'

const routeTree = rootRoute.addChildren([indexRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 4: Verify app renders**

```bash
npm run dev
```
Expected: Dark Mantine background, "Rando-Wheel — scaffold OK" text. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/routes/__root.tsx src/routes/index.tsx
git commit -m "feat: set up TanStack Router with Mantine and WheelProvider"
```

---

## Task 7: WheelSpinner — CSS + Presentational Component

**Files:** Create `src/components/WheelArea/WheelSpinner.module.css`, `src/components/WheelArea/WheelSpinner.tsx`

- [ ] **Step 1: Create the wheel CSS module**

Create `src/components/WheelArea/WheelSpinner.module.css`:
```css
.wheelObject {
  width: 100%;
  height: 100%;
  clip-path: inset(0 0 0 0 round 50%);
  position: relative;
}

.wheelVisual {
  all: unset;
  list-style: none;
  aspect-ratio: 1 / 1;
  display: grid;
  place-content: center start;
  clip-path: inset(0 0 0 0 round 50%);
  rotate: 90deg;
  container-type: inline-size;
  height: 100%;
  width: 100%;
}

.segment {
  align-content: center;
  display: grid;
  font-size: 3.5cqi;
  font-weight: bold;
  grid-area: 1 / -1;
  padding-left: 1.5vw;
  box-sizing: border-box;
  transform-origin: center right;
  width: 50cqi;
  white-space: nowrap;
  letter-spacing: 0.2vh;
  clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
  rotate: calc(360deg / var(--items) * calc(var(--idx) - 1));
  aspect-ratio: 1 / calc(2 * tan(180deg / var(--items)));
}

.segment p {
  margin: 0;
  opacity: 1;
  transition: opacity 0.25s;
}

.fastTransition {
  transition:
    background-color 0.35s linear 0.25s,
    color 0.35s linear 0.25s;
}

.instantTransition {
  transition:
    background-color 0.1s linear,
    color 0.1s linear;
}

.dimmedText p {
  opacity: 0.25;
}
```

- [ ] **Step 2: Create the presentational WheelSpinner component**

Create `src/components/WheelArea/WheelSpinner.tsx`:
```tsx
import type { CSSProperties, RefObject } from 'react'
import { useWheelState } from '../../context/WheelContext'
import styles from './WheelSpinner.module.css'

interface Props {
  wheelRef: RefObject<HTMLDivElement>
  onWheelClick: () => void
}

export function WheelSpinner({ wheelRef, onWheelClick }: Props) {
  const { entries, wheelStatus, winnerId, colorPrimary, colorSecondary, colorWinner } =
    useWheelState()

  const getSegmentBg = (index: number, id: string) => {
    if (id === winnerId) return colorWinner
    return index % 2 === 0 ? colorPrimary : colorSecondary
  }

  const getSegmentTextColor = (id: string) => {
    if (id === winnerId) return 'white'
    return 'var(--mantine-color-dark-9)'
  }

  const isDimmed = (id: string, included: boolean, spunOut: boolean) =>
    !included || (spunOut && id !== winnerId)

  return (
    <div ref={wheelRef} className={styles.wheelObject} onMouseUp={onWheelClick}>
      <ul
        className={styles.wheelVisual}
        style={{ '--items': entries.length } as CSSProperties}
      >
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`${styles.segment} ${
              wheelStatus === 'spun' ? styles.fastTransition : styles.instantTransition
            } ${isDimmed(entry.id, entry.included, entry.spunOut) ? styles.dimmedText : ''}`}
            style={
              {
                '--idx': i + 1,
                backgroundColor: getSegmentBg(i, entry.id),
                color: getSegmentTextColor(entry.id),
              } as CSSProperties
            }
          >
            <p>{entry.name}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WheelArea/WheelSpinner.tsx src/components/WheelArea/WheelSpinner.module.css
git commit -m "feat: add WheelSpinner presentational component and CSS segment layout"
```

---

## Task 8: Overlay Components

**Files:** Create `Shader.tsx`, `SpinButton.tsx`, `WinnerBadge.tsx`, `PinIndicator.tsx`

- [ ] **Step 1: Create Shader**

Create `src/components/WheelArea/Shader.tsx`:
```tsx
import { useWheelState } from '../../context/WheelContext'

interface Props {
  onClick: () => void
}

export function Shader({ onClick }: Props) {
  const { wheelStatus } = useWheelState()
  const isInactive = wheelStatus === 'inactive'

  return (
    <div
      onMouseUp={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: isInactive ? 0 : 1,
        pointerEvents: isInactive ? 'none' : 'all',
        cursor: 'pointer',
        transition: 'opacity 0.25s',
        zIndex: 10,
      }}
    />
  )
}
```

- [ ] **Step 2: Create SpinButton**

Create `src/components/WheelArea/SpinButton.tsx`:
```tsx
import { useWheelState } from '../../context/WheelContext'
import { pickWinner } from '../../utils/spinCalculation'

interface Props {
  onSpin: () => void
}

export function SpinButton({ onSpin }: Props) {
  const { wheelStatus, entries } = useWheelState()
  const isVisible = wheelStatus === 'active'
  const hasEligible = pickWinner(entries) !== -1

  return (
    <div
      onMouseUp={onSpin}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        translate: '-50% -50%',
        width: '10vw',
        height: '10vw',
        borderRadius: '50%',
        backgroundColor: 'var(--mantine-color-red-7)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '2.6vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasEligible ? 'pointer' : 'default',
        pointerEvents: isVisible ? 'all' : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(0.9)' : 'scale(0.3)',
        transition: 'transform 0.4s, opacity 0.25s',
        zIndex: 12,
        letterSpacing: '0.1vw',
      }}
    >
      SPIN!
    </div>
  )
}
```

- [ ] **Step 3: Create WinnerBadge**

Create `src/components/WheelArea/WinnerBadge.tsx`:
```tsx
import { useWheelState } from '../../context/WheelContext'

export function WinnerBadge() {
  const { winnerId, entries, wheelStatus } = useWheelState()
  const winner = entries.find(e => e.id === winnerId)
  const isVisible = wheelStatus === 'spun' && !!winner

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        translate: '-50% -50%',
        color: 'var(--mantine-color-red-7)',
        fontSize: '7svw',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        letterSpacing: '0.2vw',
        filter: 'drop-shadow(5px 5px 5px rgba(0,0,0,0.67))',
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.3)',
        transition: isVisible
          ? 'transform 0.6s, opacity 0.3s 0.2s'
          : 'transform 0.4s, opacity 0.25s',
        zIndex: 13,
      }}
    >
      {winner?.name ?? ''}
    </div>
  )
}
```

- [ ] **Step 4: Create PinIndicator**

Create `src/components/WheelArea/PinIndicator.tsx`:
```tsx
import { useWheelState } from '../../context/WheelContext'

// pin.png lives in public/ — reference as a URL string, not an ES module import
const PIN_SRC = '/pin.png'

export function PinIndicator() {
  const { wheelStatus } = useWheelState()
  const isActive = wheelStatus !== 'inactive'

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        translate: 'calc(-50% + 0.1vw) -50%',
        pointerEvents: 'none',
        zIndex: 14,
      }}
    >
      <img
        src={PIN_SRC}
        alt="pin"
        style={{
          height: '7vw',
          translate: '0 -22vw',
          transition: 'transform 0.25s',
          transform: isActive ? undefined : 'translateX(45vw) translateY(4vw) rotate(-15deg)',
          animation: isActive ? 'pinBounce 1s ease-in-out infinite' : undefined,
        }}
      />
      <style>{`
        @keyframes pinBounce {
          0%, 100% { translate: 0 -22vw; }
          50% { translate: 0 -21vw; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/WheelArea/Shader.tsx src/components/WheelArea/SpinButton.tsx src/components/WheelArea/WinnerBadge.tsx src/components/WheelArea/PinIndicator.tsx
git commit -m "feat: add wheel overlay components (Shader, SpinButton, WinnerBadge, PinIndicator)"
```

---

## Task 9: WheelArea — Logic + Composition

**Files:** Create `src/components/WheelArea/WheelArea.tsx`

- [ ] **Step 1: Create WheelArea**

Create `src/components/WheelArea/WheelArea.tsx`:
```tsx
import { useRef } from 'react'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'
import { pickWinner, computeDegrees, normalizeDegree } from '../../utils/spinCalculation'
import { WheelSpinner } from './WheelSpinner'
import { Shader } from './Shader'
import { SpinButton } from './SpinButton'
import { WinnerBadge } from './WinnerBadge'
import { PinIndicator } from './PinIndicator'

export function WheelArea() {
  const state = useWheelState()
  const dispatch = useWheelDispatch()
  const wheelRef = useRef<HTMLDivElement>(null)
  const isSpinningRef = useRef(false)

  const spinWheel = () => {
    if (state.wheelStatus !== 'active' || isSpinningRef.current) return
    const targetIndex = pickWinner(state.entries)
    if (targetIndex === -1) return

    const degrees = computeDegrees(
      targetIndex,
      state.entries.length,
      state.previousEndDegree,
      state.selectionOffset,
    )

    wheelRef.current?.animate([{ transform: `rotate(${degrees}deg)` }], {
      duration: 3000,
      fill: 'forwards',
      easing: 'ease-in-out',
      iterations: 1,
    })

    dispatch({
      type: 'BEGIN_SPIN',
      winnerId: state.entries[targetIndex].id,
      previousEndDegree: degrees,
      selectionOffset: targetIndex,
    })

    isSpinningRef.current = true
    setTimeout(() => {
      isSpinningRef.current = false
    }, 4000)
  }

  const cleanup = () => {
    const adjusted = normalizeDegree(state.previousEndDegree)
    wheelRef.current?.animate([{ transform: `rotate(${adjusted}deg)` }], {
      duration: 0,
      fill: 'forwards',
    })
    dispatch({ type: 'CONFIRM_SPIN' })
  }

  const handleWheelClick = () => {
    if (state.wheelStatus === 'spun' && !isSpinningRef.current) {
      cleanup()
    } else if (state.wheelStatus === 'inactive') {
      dispatch({ type: 'ACTIVATE_WHEEL' })
    }
  }

  const handleShaderClick = () => {
    if (state.wheelStatus === 'active') {
      dispatch({ type: 'DISMISS_WHEEL' })
    } else if (state.wheelStatus === 'spun' && !isSpinningRef.current) {
      cleanup()
    }
  }

  const isInactive = state.wheelStatus === 'inactive'

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <Shader onClick={handleShaderClick} />

      {/* Wheel container — fixed-centered on viewport */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: '39vw',
          height: '39vw',
          transform: isInactive ? 'translateX(50vw)' : undefined,
          transition: 'transform 0.25s',
          zIndex: 11,
          cursor: isInactive ? 'pointer' : undefined,
        }}
      >
        <WheelSpinner wheelRef={wheelRef} onWheelClick={handleWheelClick} />
        <SpinButton onSpin={spinWheel} />
      </div>

      <WinnerBadge />
      <PinIndicator />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WheelArea/WheelArea.tsx
git commit -m "feat: add WheelArea with spin/cleanup logic and component composition"
```

---

## Task 10: AddEntryForm

**Files:** Create `src/components/EntrySidebar/AddEntryForm.tsx`

- [ ] **Step 1: Create AddEntryForm**

Create `src/components/EntrySidebar/AddEntryForm.tsx`:
```tsx
import { useState } from 'react'
import { TextInput, ActionIcon } from '@mantine/core'
import { useWheelDispatch } from '../../context/WheelContext'

export function AddEntryForm() {
  const dispatch = useWheelDispatch()
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_ENTRY', name: trimmed })
    setValue('')
  }

  return (
    <TextInput
      value={value}
      onChange={e => setValue(e.currentTarget.value)}
      onKeyDown={e => { if (e.key === 'Enter') submit() }}
      placeholder="Add a name…"
      rightSection={
        <ActionIcon onClick={submit} variant="filled" color="blue" aria-label="Add entry">
          +
        </ActionIcon>
      }
    />
  )
}
```

- [ ] **Step 2: Write a smoke test**

Create `src/components/EntrySidebar/AddEntryForm.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddEntryForm } from './AddEntryForm'
import * as WheelContext from '../../context/WheelContext'

describe('AddEntryForm', () => {
  it('dispatches ADD_ENTRY and clears the input on submit', async () => {
    const dispatch = vi.fn()
    vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)

    render(<AddEntryForm />)
    const input = screen.getByPlaceholderText('Add a name…')

    await userEvent.type(input, 'Alice')
    await userEvent.keyboard('{Enter}')

    expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Alice' })
    expect(input).toHaveValue('')
  })

  it('does not dispatch when the input is empty', async () => {
    const dispatch = vi.fn()
    vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)

    render(<AddEntryForm />)
    await userEvent.keyboard('{Enter}')

    expect(dispatch).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```
Expected: All tests PASS including AddEntryForm tests.

- [ ] **Step 4: Commit**

```bash
git add src/components/EntrySidebar/AddEntryForm.tsx src/components/EntrySidebar/AddEntryForm.test.tsx
git commit -m "feat: add AddEntryForm component with tests"
```

---

## Task 11: EntryRow + EntryList

**Files:** Create `src/components/EntrySidebar/EntryRow.tsx`, `src/components/EntrySidebar/EntryList.tsx`

- [ ] **Step 1: Create EntryRow**

Create `src/components/EntrySidebar/EntryRow.tsx`:
```tsx
import { Checkbox, ActionIcon, Badge, Group, Text } from '@mantine/core'
import { useWheelDispatch } from '../../context/WheelContext'
import type { Entry } from '../../types'

interface Props {
  entry: Entry
}

export function EntryRow({ entry }: Props) {
  const dispatch = useWheelDispatch()

  return (
    <Group justify="space-between" wrap="nowrap" py={4} px={6}>
      <Checkbox
        checked={entry.included}
        onChange={() => dispatch({ type: 'TOGGLE_INCLUDED', id: entry.id })}
        label={
          <Text
            size="sm"
            td={!entry.included ? 'line-through' : undefined}
            c={!entry.included ? 'dimmed' : undefined}
          >
            {entry.name}
          </Text>
        }
      />
      <Group gap={4} wrap="nowrap">
        {entry.spunOut && (
          <Badge size="xs" color="green" variant="light">
            spun
          </Badge>
        )}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: entry.id })}
          aria-label={`Remove ${entry.name}`}
        >
          ✕
        </ActionIcon>
      </Group>
    </Group>
  )
}
```

- [ ] **Step 2: Create EntryList**

Create `src/components/EntrySidebar/EntryList.tsx`:
```tsx
import { ScrollArea } from '@mantine/core'
import { useWheelState } from '../../context/WheelContext'
import { EntryRow } from './EntryRow'

export function EntryList() {
  const { entries } = useWheelState()

  return (
    <ScrollArea flex={1} type="auto">
      {entries.map(entry => (
        <EntryRow key={entry.id} entry={entry} />
      ))}
    </ScrollArea>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/EntrySidebar/EntryRow.tsx src/components/EntrySidebar/EntryList.tsx
git commit -m "feat: add EntryRow and EntryList components"
```

---

## Task 12: SidebarControls

**Files:** Create `src/components/EntrySidebar/SidebarControls.tsx`

- [ ] **Step 1: Create SidebarControls**

Create `src/components/EntrySidebar/SidebarControls.tsx`:
```tsx
import { Switch, Button, Stack, Group } from '@mantine/core'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'

export function SidebarControls() {
  const { removeOnSelect } = useWheelState()
  const dispatch = useWheelDispatch()

  return (
    <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Switch
        label="Remove from wheel when selected"
        checked={removeOnSelect}
        onChange={e => dispatch({ type: 'SET_REMOVE_ON_SELECT', value: e.currentTarget.checked })}
        size="sm"
      />
      <Group grow>
        <Button
          variant="light"
          size="xs"
          onClick={() => dispatch({ type: 'RESET_SPUN_OUT' })}
        >
          Reset Spun
        </Button>
        <Button
          variant="light"
          color="red"
          size="xs"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
        >
          Clear All
        </Button>
      </Group>
    </Stack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EntrySidebar/SidebarControls.tsx
git commit -m "feat: add SidebarControls component"
```

---

## Task 13: EntrySidebar

**Files:** Create `src/components/EntrySidebar/EntrySidebar.tsx`

- [ ] **Step 1: Create EntrySidebar**

Create `src/components/EntrySidebar/EntrySidebar.tsx`:
```tsx
import { Stack, Text, Center } from '@mantine/core'
import { useWheelState } from '../../context/WheelContext'
import { AddEntryForm } from './AddEntryForm'
import { EntryList } from './EntryList'
import { SidebarControls } from './SidebarControls'

export function EntrySidebar() {
  const { entries } = useWheelState()
  const isEmpty = entries.length === 0

  return (
    <Stack
      gap="sm"
      p="sm"
      style={{
        width: 280,
        height: '100vh',
        borderLeft: '1px solid var(--mantine-color-dark-4)',
        backgroundColor: 'var(--mantine-color-dark-7)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <AddEntryForm />

      {isEmpty ? (
        <Center flex={1}>
          <Text c="dimmed" size="sm" ta="center">
            Add names above to get started.
            <br />
            They will appear on the wheel.
          </Text>
        </Center>
      ) : (
        <EntryList />
      )}

      <SidebarControls />
    </Stack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EntrySidebar/EntrySidebar.tsx
git commit -m "feat: add EntrySidebar with empty state"
```

---

## Task 14: WheelPage — Final Wiring

**Files:** Modify `src/routes/index.tsx`

- [ ] **Step 1: Replace the placeholder index route with WheelPage**

Replace `src/routes/index.tsx`:
```tsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { WheelArea } from '../components/WheelArea/WheelArea'
import { EntrySidebar } from '../components/EntrySidebar/EntrySidebar'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WheelPage,
})

function WheelPage() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <WheelArea />
      <EntrySidebar />
    </div>
  )
}
```

- [ ] **Step 2: Run the app and verify the full flow**

```bash
npm run dev
```

Walk through the golden path:
1. Open app — sidebar shows "Add names above to get started." Wheel area is dark.
2. Type a name in the sidebar input and press Enter — name appears in the list and on the wheel.
3. Add 3–5 more names.
4. Click the wheel area — shader fades in, wheel slides to center, pin bounces, SPIN! button appears.
5. Click SPIN! — wheel spins for 3 seconds and stops on a highlighted segment. Winner name appears.
6. Click the wheel or shader — winner name fades, wheel slides away.
7. Enable "Remove from wheel when selected" in sidebar — repeat spins, confirm spun entries get the green "spun" badge and are dimmed on the wheel.
8. Click "Reset Spun" — all badges clear.
9. Click "Clear All" — list empties, empty state prompt returns.
10. Refresh the page — entries from step 3 are restored from localStorage.

- [ ] **Step 3: Run all tests**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: wire WheelPage with WheelArea and EntrySidebar — app complete"
```
