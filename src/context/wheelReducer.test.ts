import { describe, it, expect } from 'vitest'
import { wheelReducer, initialState } from './wheelReducer'
import type { WheelState, Entry } from '../types'

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: crypto.randomUUID(),
  name: 'Alice',
  included: true,
  ...overrides,
})

describe('wheelReducer', () => {
  describe('ADD_ENTRY', () => {
    it('adds an entry with included=true', () => {
      const next = wheelReducer(initialState, { type: 'ADD_ENTRY', name: 'Alice' })
      expect(next.entries).toHaveLength(1)
      expect(next.entries[0]).toMatchObject({ name: 'Alice', included: true })
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

    it('re-includes all entries when the last checked entry is removed', () => {
      const checked = makeEntry({ included: true })
      const unchecked = makeEntry({ included: false })
      const state: WheelState = { ...initialState, entries: [checked, unchecked] }
      const next = wheelReducer(state, { type: 'REMOVE_ENTRY', id: checked.id })
      expect(next.entries[0].included).toBe(true)
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

  describe('BEGIN_SPIN', () => {
    it('sets wheelStatus to spun with null winnerId', () => {
      const entry = makeEntry()
      const state: WheelState = { ...initialState, entries: [entry] }
      const next = wheelReducer(state, { type: 'BEGIN_SPIN' })
      expect(next.winnerId).toBeNull()
      expect(next.wheelStatus).toBe('spun')
    })
  })

  describe('REVEAL_WINNER', () => {
    it('sets winnerId', () => {
      const entry = makeEntry()
      const state: WheelState = { ...initialState, wheelStatus: 'spun', winnerId: null }
      const next = wheelReducer(state, { type: 'REVEAL_WINNER', winnerId: entry.id })
      expect(next.winnerId).toBe(entry.id)
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

    it('does not uncheck entries when removeOnSelect is false', () => {
      const entry = makeEntry()
      const state: WheelState = {
        ...initialState,
        entries: [entry],
        wheelStatus: 'spun',
        winnerId: entry.id,
        removeOnSelect: false,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries[0].included).toBe(true)
    })

    it('unchecks winner when removeOnSelect is true and pool is not exhausted', () => {
      const winner = makeEntry({ name: 'Alice' })
      const other = makeEntry({ name: 'Bob' })
      const state: WheelState = {
        ...initialState,
        entries: [winner, other],
        wheelStatus: 'spun',
        winnerId: winner.id,
        removeOnSelect: true,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries.find(e => e.id === winner.id)?.included).toBe(false)
      expect(next.entries.find(e => e.id === other.id)?.included).toBe(true)
    })

    it('re-includes all entries when the last included entry wins', () => {
      const winner = makeEntry({ name: 'Alice', included: true })
      const unchecked = makeEntry({ name: 'Bob', included: false })
      const state: WheelState = {
        ...initialState,
        entries: [winner, unchecked],
        wheelStatus: 'spun',
        winnerId: winner.id,
        removeOnSelect: true,
      }
      const next = wheelReducer(state, { type: 'CONFIRM_SPIN' })
      expect(next.entries.every(e => e.included)).toBe(true)
    })
  })

  describe('RESET_SPUN_OUT', () => {
    it('re-includes all entries', () => {
      const entries = [
        makeEntry({ included: false }),
        makeEntry({ included: false }),
        makeEntry({ included: true }),
      ]
      const state: WheelState = { ...initialState, entries }
      const next = wheelReducer(state, { type: 'RESET_SPUN_OUT' })
      expect(next.entries.every(e => e.included)).toBe(true)
    })
  })

  describe('CLEAR_ALL', () => {
    it('empties the entry list', () => {
      const state: WheelState = { ...initialState, entries: [makeEntry(), makeEntry()] }
      const next = wheelReducer(state, { type: 'CLEAR_ALL' })
      expect(next.entries).toHaveLength(0)
    })
  })

  describe('SET_COLORS', () => {
    it('updates all three color values', () => {
      const next = wheelReducer(initialState, {
        type: 'SET_COLORS',
        colorPrimary: '#ff0000',
        colorSecondary: '#00ff00',
        colorTertiary: '#0000ff',
      })
      expect(next.colorPrimary).toBe('#ff0000')
      expect(next.colorSecondary).toBe('#00ff00')
      expect(next.colorTertiary).toBe('#0000ff')
    })
  })
})
