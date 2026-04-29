import { type Ref } from 'react'
import { Stack, Text, Center } from '@mantine/core'
import { useWheelState } from '../../context/WheelContext'
import { AddEntryForm, type AddEntryFormHandle } from './AddEntryForm'
import { EntryList } from './EntryList'
import { SidebarControls } from './SidebarControls'

interface Props {
  addEntryFormRef: Ref<AddEntryFormHandle>
}

export function EntrySidebar({ addEntryFormRef }: Props) {
  const { entries, wheelStatus } = useWheelState()
  const isEmpty = entries.length === 0
  const disabled = wheelStatus !== 'inactive'

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
      <AddEntryForm ref={addEntryFormRef} disabled={disabled} />

      {isEmpty ? (
        <Center flex={1}>
          <Text c="dimmed" size="sm" ta="center">
            Add entries above to get started.
            <br />
            They will appear on the wheel.
          </Text>
        </Center>
      ) : (
        <EntryList disabled={disabled} />
      )}

      <SidebarControls disabled={disabled} />
    </Stack>
  )
}
