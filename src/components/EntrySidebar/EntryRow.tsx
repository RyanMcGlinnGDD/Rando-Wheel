import { Checkbox, ActionIcon, Group, Text } from '@mantine/core'
import { useWheelDispatch } from '../../context/WheelContext'
import type { Entry } from '../../types'

interface Props {
  entry: Entry
  disabled?: boolean
}

export function EntryRow({ entry, disabled }: Props) {
  const dispatch = useWheelDispatch()

  return (
    <Group justify="space-between" wrap="nowrap" py={4} px={6}>
      <Checkbox
        checked={entry.included}
        onChange={() => dispatch({ type: 'TOGGLE_INCLUDED', id: entry.id })}
        disabled={disabled}
        styles={{ root: { minWidth: 0 } }}
        label={
          <Text
            size="sm"
            td={!entry.included ? 'line-through' : undefined}
            c={!entry.included ? 'dimmed' : undefined}
          >
            {entry.name}
          </Text>
        }
      />
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: entry.id })}
        disabled={disabled}
        aria-label={`Remove ${entry.name}`}
      >
        ✕
      </ActionIcon>
    </Group>
  )
}
