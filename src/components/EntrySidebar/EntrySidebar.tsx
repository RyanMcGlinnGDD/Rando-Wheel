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
