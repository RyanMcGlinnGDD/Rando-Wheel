# Rando-Wheel Design Spec

**Date:** 2026-04-27
**Status:** Approved

## Overview

Rando-Wheel is a standalone SPA that replicates the spinning wheel from the guess-who Electron app. It is built with React, Mantine, and TanStack Router. The wheel supports a flexible, user-managed entry list with persistent localStorage storage, per-entry manual toggles, and auto-exclusion after selection (with auto-reset when the pool is exhausted).

---

## Tech Stack

- **React 18** — UI
- **Mantine** — component library and design system (`defaultColorScheme="dark"`)
- **TanStack Router** — routing (single route now, extensible for future `/settings`)
- **localStorage** — persistence (no backend)
- **Web Animation API** — wheel spin animation (same as guess-who)
- **CSS Grid + clip-path** — wheel segment rendering (same technique as guess-who)

---

## Architecture

### State Management

React Context + `useReducer`. A `WheelProvider` wraps the TanStack Router root layout and exposes state and dispatch to all children.

A `useEffect` syncs the full state to `localStorage` on every change. On mount, state is hydrated from `localStorage`; if no saved state exists the app starts with an empty entry list.

### State Shape

```typescript
type Entry = {
  id: string;        // uuid
  name: string;
  included: boolean; // manual sidebar toggle
  spunOut: boolean;  // auto-excluded by removeOnSelect after being picked
};

type WheelState = {
  entries: Entry[];
  removeOnSelect: boolean;
  wheelStatus: 'inactive' | 'active' | 'spun';
  winnerId: string | null;
  previousEndDegree: number;
  selectionOffset: number;
  colorPrimary: string;   // Mantine CSS var, e.g. "var(--mantine-color-blue-6)"
  colorSecondary: string; // e.g. "var(--mantine-color-white)"
  colorWinner: string;    // e.g. "var(--mantine-color-red-7)"
};
```

### Reducer Actions

| Action | Effect |
|---|---|
| `ADD_ENTRY` | Appends a new entry with `included: true, spunOut: false` |
| `REMOVE_ENTRY` | Removes entry by id |
| `TOGGLE_INCLUDED` | Flips `included` on the target entry |
| `SET_REMOVE_ON_SELECT` | Sets the `removeOnSelect` flag |
| `BEGIN_SPIN` | Sets `winnerId`, `previousEndDegree`, `selectionOffset`, sets `wheelStatus` to `'spun'`. Payload carries the computed target index and new degree value from the spin calculation. |
| `CONFIRM_SPIN` | If `removeOnSelect` is true: marks winner `spunOut: true`, or resets all `spunOut` flags if pool exhausted. If `removeOnSelect` is false: no `spunOut` changes (entries remain always eligible). Sets `wheelStatus` to `'inactive'`, clears `winnerId`. |
| `DISMISS_WHEEL` | Sets `wheelStatus` to `'inactive'` without confirming a spin |
| `RESET_SPUN_OUT` | Sets `spunOut: false` on all entries |
| `CLEAR_ALL` | Empties the entry list |
| `SET_COLORS` | Updates `colorPrimary`, `colorSecondary`, `colorWinner` |

---

## Routing

Single route `/` for now. TanStack Router root layout wraps `WheelProvider`. A future `/settings` route for color customization will slot in without refactoring the existing structure.

---

## Component Structure

```
WheelProvider (Context + Reducer + localStorage sync)
  TanStack RootLayout
    WheelPage (route /)
      WheelArea
        WheelSpinner
          SegmentList (ul > li × entries.length)
          SpinButton (center hub)
          WinnerBadge
          PinIndicator
          Shader (backdrop div)
      EntrySidebar
        AddEntryForm (TextInput + ActionIcon)
        EntryList (scrollable)
          EntryRow × n (Checkbox + name + spun badge + remove button)
        SidebarControls (pinned bottom)
          RemoveOnSelectToggle (Mantine Switch)
          ResetSpunOutButton (Mantine Button)
          ClearAllButton (Mantine Button, destructive)
```

---

## Wheel Mechanics

### Segment Rendering

All entries (active, manually excluded, and spun-out) appear as segments on the wheel. `--_items` CSS variable equals `entries.length`. `--_idx` is the 1-based segment index. Segment angle = `360deg / entries.length`.

Visual states on the wheel:
- **Active** (`included: true, spunOut: false`) — full color, normal text
- **Manually excluded** (`included: false`) — dimmed, text opacity reduced
- **Spun out** (`spunOut: true`) — dimmed with distinct tint
- **Winner** (current `winnerId`) — `colorWinner` background

### Spin Target Selection

Loop picks a random index until it finds an entry where `included === true && spunOut === false`. If no such entry exists the SPIN button is disabled.

### Degree Calculation

Identical to guess-who:

```
fraction = 360 / entries.length
randomAdditionalDegrees = (360 - randomIndex * fraction * -1 - 2160 - previousEndDegree - selectionOffset * fraction) * -1
```

After cleanup: `adjustedEndDegree = previousEndDegree % 360` to prevent degree accumulation.

### Auto-Reset Threshold

Only relevant when `removeOnSelect` is true. When `removeOnSelect` is false, `spunOut` is never set and the pool never depletes.

```
spunOutCount >= includedCount - 1
```

When the last included entry wins, all `spunOut` flags reset instead of marking the winner as spun out. Generalizes the hardcoded `>= 23` from guess-who to any list size.

### Interaction Flow (Three-Click Pattern)

1. **Click wheel** — `inactive` → `active` (wheel slides to center, shader fades in, SPIN button appears)
2. **Click SPIN** — `active` → `spun` (3s ease-in-out animation, winner segment highlighted, winner badge fades in)
3. **Click wheel or shader** — `spun` → `inactive` (degree cleanup, `CONFIRM_SPIN` dispatched, winner badge fades out)

Clicking the shader while `active` (before spinning) dismisses the wheel (`DISMISS_WHEEL`).

### Empty / Exhausted State

The SPIN button is disabled when no eligible entries exist: the list is empty, or all `included` entries are also `spunOut: true` (only possible when `removeOnSelect` is true). When `removeOnSelect` is false, the pool never depletes. A prompt guides the user to add entries or click "Reset Spun" as appropriate.

---

## Sidebar

**Layout:** Fixed width, full viewport height, right side. Flex column: add form at top, scrollable entry list in the middle, controls pinned at the bottom.

**Add entry form:** `TextInput` + `ActionIcon` (plus icon). Submits on Enter or button click. Trims whitespace; ignores empty input.

**Entry row:** Mantine `Checkbox` (controls `included`) + name text + optional "spun" `Badge` when `spunOut: true` + `ActionIcon` (X) to remove. Manually excluded entries show strikethrough and reduced opacity. Spun-out entries show a green "spun" badge.

**Controls:**
- `Switch` — "Remove from wheel when selected"
- `Button` — "Reset Spun" (re-enables all spun-out entries)
- `Button` variant destructive — "Clear All" (empties the list)

---

## Styling

- `MantineProvider` at root with `defaultColorScheme="dark"`
- Wheel segment colors default to `var(--mantine-color-blue-6)` / `var(--mantine-color-white)` / `var(--mantine-color-red-7)`
- Colors stored in state as CSS variable strings so the future `/settings` route can dispatch `SET_COLORS` and the wheel re-renders immediately
- Pin uses the same bouncing CSS keyframe animation from guess-who, rendered as an `<img>` asset
- Shader backdrop uses `rgba(0,0,0,0.6)`
- Segment transitions: 350ms linear when `spun`, 100ms when `inactive` (same as guess-who)

---

## Initial/Default Data

On first load with no localStorage data, the entry list is empty. A centered empty state prompt in the wheel area and sidebar instructs the user to add names before spinning. Default names are derived from the guess-who character list, substituting each name with a common name starting with the same letter (e.g. "Alice", "Bob", "Carol", etc.) — but these are not pre-populated; they serve only as reference for test data during development.

---

## Out of Scope (for now)

- `/settings` route for color customization (state shape already accommodates it)
- Import/export of entry lists
- Multiple saved lists
- Sound effects
- Mobile layout optimization
