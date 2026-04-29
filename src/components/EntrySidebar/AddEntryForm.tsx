import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { TextInput, ActionIcon } from '@mantine/core'
import { useWheelDispatch } from '../../context/WheelContext'
import { PasteConfirmModal } from './PasteConfirmModal'

export interface AddEntryFormHandle {
  focus: () => void
}

interface Props {
  disabled?: boolean
}

interface PasteState {
  raw: string
  entries: string[]
  delimiter: 'newline' | 'comma'
}

export const AddEntryForm = forwardRef<AddEntryFormHandle, Props>(({ disabled }, ref) => {
  const dispatch = useWheelDispatch()
  const [value, setValue] = useState('')
  const [pasteState, setPasteState] = useState<PasteState | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_ENTRY', name: trimmed })
    setValue('')
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const text = e.clipboardData.getData('text')

    // Newlines take priority over commas
    if (text.includes('\n')) {
      const entries = text.split('\n').map(s => s.trim()).filter(Boolean)
      if (entries.length > 1) {
        e.preventDefault()
        setPasteState({ raw: text, entries, delimiter: 'newline' })
        return
      }
    }

    if (text.includes(',')) {
      const entries = text.split(',').map(s => s.trim()).filter(Boolean)
      if (entries.length > 1) {
        e.preventDefault()
        setPasteState({ raw: text, entries, delimiter: 'comma' })
        return
      }
    }
  }

  const handleSingle = () => {
    if (!pasteState) return
    const name = pasteState.delimiter === 'newline'
      ? pasteState.entries.join(' ')
      : pasteState.raw.trim()
    dispatch({ type: 'ADD_ENTRY', name })
    setPasteState(null)
  }

  const handleMultiple = () => {
    if (!pasteState) return
    pasteState.entries.forEach(name => dispatch({ type: 'ADD_ENTRY', name }))
    setPasteState(null)
  }

  return (
    <>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !disabled) submit() }}
        onPaste={handlePaste}
        placeholder="Add an entry…"
        disabled={disabled}
        rightSection={
          <ActionIcon onClick={submit} variant="filled" color="blue" aria-label="Add entry" disabled={disabled}>
            +
          </ActionIcon>
        }
      />

      {pasteState && (
        <PasteConfirmModal
          entries={pasteState.entries}
          delimiter={pasteState.delimiter}
          onCancel={() => setPasteState(null)}
          onSingle={handleSingle}
          onMultiple={handleMultiple}
        />
      )}
    </>
  )
})

AddEntryForm.displayName = 'AddEntryForm'
