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
