import { Modal, Stack, ColorInput, Button, Group } from '@mantine/core'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'

interface Props {
  opened: boolean
  onClose: () => void
}

export function CustomizeWheelModal({ opened, onClose }: Props) {
  const { colorPrimary, colorSecondary, colorTertiary } = useWheelState()
  const dispatch = useWheelDispatch()

  const set = (patch: Partial<{ colorPrimary: string; colorSecondary: string; colorTertiary: string }>) =>
    dispatch({
      type: 'SET_COLORS',
      colorPrimary,
      colorSecondary,
      colorTertiary,
      ...patch,
    })

  return (
    <Modal opened={opened} onClose={onClose} title="Customize Wheel" centered>
      <Stack gap="md">
        <ColorInput
          label="Primary"
          description="Wedge fill color"
          value={colorPrimary}
          onChange={v => set({ colorPrimary: v })}
          format="hex"
        />
        <ColorInput
          label="Secondary"
          description="Wedge text and outlines"
          value={colorSecondary}
          onChange={v => set({ colorSecondary: v })}
          format="hex"
        />
        <ColorInput
          label="Tertiary"
          description="Spin button, pointer, and winner text"
          value={colorTertiary}
          onChange={v => set({ colorTertiary: v })}
          format="hex"
        />
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Done</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
