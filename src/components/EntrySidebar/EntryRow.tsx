import { Checkbox, ActionIcon, Badge, Group, Text } from '@mantine/core'
import { useWheelDispatch } from '../../context/WheelContext'
import type { Entry } from '../../types'

interface Props {
  entry: Entry
}

export function EntryRow({ entry }: Props) {
  const dispatch = useWheelDispatch()

  return (
    <Group justify="space-between" wrap="nowrap" py={4} px={6}>
      <Checkbox
        checked={entry.included}
        onChange={() => dispatch({ type: 'TOGGLE_INCLUDED', id: entry.id })}
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
      <Group gap={4} wrap="nowrap">
        {entry.spunOut && (
          <Badge size="xs" color="green" variant="light">
            spun
          </Badge>
        )}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: entry.id })}
          aria-label={`Remove ${entry.name}`}
        >
          ✕
        </ActionIcon>
      </Group>
    </Group>
  )
}
