import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { AddEntryForm } from './AddEntryForm'
import * as WheelContext from '../../context/WheelContext'

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>)

describe('AddEntryForm', () => {
  it('dispatches ADD_ENTRY and clears the input on submit', async () => {
    const dispatch = vi.fn()
    vi.spyOn(WheelContext, 'useWheelDispatch').mockReturnValue(dispatch)

    renderWithMantine(<AddEntryForm />)
    const input = screen.getByPlaceholderText('Add a name…')

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
})
