import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { AddEntryForm } from './AddEntryForm'
import * as WheelContext from '../../context/WheelContext'

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>)

const paste = (input: HTMLElement, text: string) =>
  fireEvent.paste(input, { clipboardData: { getData: () => text } })

describe('AddEntryForm', () => {
  it('dispatches ADD_ENTRY and clears the input on submit', async () => {
    const dispatch = vi.fn()
    vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)

    renderWithMantine(<AddEntryForm />)
    const input = screen.getByPlaceholderText('Add an entry…')

    await userEvent.type(input, 'Alice')
    await userEvent.keyboard('{Enter}')

    expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Alice' })
    expect(input).toHaveValue('')
  })

  it('does not dispatch when the input is empty', async () => {
    const dispatch = vi.fn()
    vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)

    renderWithMantine(<AddEntryForm />)
    await userEvent.keyboard('{Enter}')

    expect(dispatch).not.toHaveBeenCalled()
  })

  describe('paste detection', () => {
    it('shows the modal for a multiline paste', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Alice\nBob\nCharlie')

      expect(screen.getByText('Add as multiple entries?')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('shows the modal for a comma-separated paste', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'apple, banana, cherry')

      expect(screen.getByText('Add as multiple entries?')).toBeInTheDocument()
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.getByText('banana')).toBeInTheDocument()
      expect(screen.getByText('cherry')).toBeInTheDocument()
    })

    it('prefers newline splitting when both delimiters are present', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Alice, Bob\nCharlie, Dave')

      // Modal shows 2 entries split by newline (commas stay inside entry names)
      expect(screen.getByText('Alice, Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie, Dave')).toBeInTheDocument()
    })

    it('does not show the modal for plain text', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'just a normal entry')

      expect(screen.queryByText('Add as multiple entries?')).not.toBeInTheDocument()
    })

    it('does not show the modal when only one non-empty part results', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      // Two newlines but only one non-empty line
      paste(screen.getByPlaceholderText('Add an entry…'), '\nAlice\n')

      expect(screen.queryByText('Add as multiple entries?')).not.toBeInTheDocument()
    })

    it('Multiple Entries dispatches ADD_ENTRY for each entry', async () => {
      const dispatch = vi.fn()
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Alice\nBob\nCharlie')
      await userEvent.click(screen.getByRole('button', { name: 'Multiple Entries' }))

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Alice' })
      expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Bob' })
      expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Charlie' })
    })

    it('Single Entry joins newline-split lines with a space', async () => {
      const dispatch = vi.fn()
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Hello\nWorld')
      await userEvent.click(screen.getByRole('button', { name: 'Single Entry' }))

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Hello World' })
    })

    it('Single Entry uses the raw text for comma-split paste', async () => {
      const dispatch = vi.fn()
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Alice, Bob')
      await userEvent.click(screen.getByRole('button', { name: 'Single Entry' }))

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_ENTRY', name: 'Alice, Bob' })
    })

    it('Cancel closes the modal without dispatching', async () => {
      const dispatch = vi.fn()
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), 'Alice\nBob')
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(dispatch).not.toHaveBeenCalled()
      expect(screen.queryByText('Add as multiple entries?')).not.toBeInTheDocument()
    })

    it('trims whitespace from each entry including Windows line endings', () => {
      vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(vi.fn())
      renderWithMantine(<AddEntryForm />)

      paste(screen.getByPlaceholderText('Add an entry…'), '  Alice  \r\n  Bob  \r\n  Charlie  ')

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })
})
