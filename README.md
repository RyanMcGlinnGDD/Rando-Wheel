# Rando Wheel

A wheelspin application for picking entries at random. Add a list of entries and spin.

---

## Features

### Entry management

- **Add entries** by typing a name and pressing Enter or clicking the add button
- **Paste detection** - pasting comma-separated or newline-separated text prompts you to split it into multiple entries or keep it as one
- **Toggle entries** on and off with checkboxes; unchecked entries are excluded from the wheel
- **Remove entries** individually with the ✕ button
- **Clear All** removes every entry at once
- **Reset Checks** re-enables all unchecked entries

### Spinning

- Click **SPIN!** to pick a random winner from all checked entries
- The wheel animates to the winning segment; the winner's name is displayed prominently
- Click anywhere to dismiss the result and return the wheel to its resting state
- Clicking the wheel while empty opens the sidebar and focuses the entry input

### Sidebar

- The entry sidebar slides in from the right via a handle button on the screen edge
- All controls are disabled while a spin is in progress

### Customisation

- **Uncheck when selected** - automatically unchecks the winner after each spin, so the same entry won't be picked again until all entries have won (then all are re-enabled)
- **Customize Wheel** opens a color picker modal with three configurable colours:
  - **Primary** - wedge fill color
  - **Secondary** - wedge text and outlines
  - **Tertiary** - spin button, pointer, and winner text

---

## Usage

### Adding entries

1. Open the sidebar using the handle on the right edge of the screen
2. Type an entry name in the input and press **Enter** or click **+**
3. Repeat for each entry - they appear on the wheel immediately
4. Paste a comma- or newline-separated list to add several entries at once

### Spinning the wheel

1. Make sure at least two entries are checked
2. Click **SPIN!** in the centre of the wheel
3. The wheel spins and lands on a randomly selected entry
4. The winner is shown above the wheel; click anywhere to dismiss

### Excluding entries

Uncheck any entry in the sidebar to remove it from the pool without deleting it. Unchecked entries appear dimmed on the wheel and are skipped when picking a winner.

### Customising colors

Open the sidebar, scroll to the bottom, and click **Customize Wheel**. Changes apply live to the wheel.

---

## Data storage

Entries, color choices, and persistent settings are saved to `localStorage` under the key `rando-wheel-state`. Clearing your browser's site data will reset everything.

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) - build tool
- [Mantine](https://mantine.dev/) - UI components
- [TanStack Router](https://tanstack.com/router) - client-side routing
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) - unit tests
