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
