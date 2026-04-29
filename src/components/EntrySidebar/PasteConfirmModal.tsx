import { Modal, Stack, Text, Button, Group, ScrollArea } from '@mantine/core'

interface Props {
  entries: string[]
  delimiter: 'newline' | 'comma'
  onCancel: () => void
  onSingle: () => void
  onMultiple: () => void
}

export function PasteConfirmModal({ entries, delimiter, onCancel, onSingle, onMultiple }: Props) {
  return (
    <Modal opened onClose={onCancel} title="Add as multiple entries?" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {delimiter === 'newline'
            ? 'The pasted text contains multiple lines.'
            : 'The pasted text contains commas.'}{' '}
          Add each as a separate entry?
        </Text>

        <ScrollArea.Autosize mah={240}>
          <Stack gap={4}>
            {entries.map((entry, i) => (
              <Text
                key={i}
                size="sm"
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: 'var(--mantine-color-dark-6)',
                  wordBreak: 'break-word',
                }}
              >
                {entry}
              </Text>
            ))}
          </Stack>
        </ScrollArea.Autosize>

        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" onClick={onCancel}>Cancel</Button>
          <Button variant="light" onClick={onSingle}>Single Entry</Button>
          <Button variant="filled" onClick={onMultiple}>Multiple Entries</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
