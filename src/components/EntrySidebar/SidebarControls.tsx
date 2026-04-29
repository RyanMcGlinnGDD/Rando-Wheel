import { useState } from 'react'
import { Switch, Button, Stack, Group } from '@mantine/core'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'
import { CustomizeWheelModal } from './CustomizeWheelModal'

interface Props {
  disabled?: boolean
}

export function SidebarControls({ disabled }: Props) {
  const { removeOnSelect } = useWheelState()
  const dispatch = useWheelDispatch()
  const [customizeOpen, setCustomizeOpen] = useState(false)

  return (
    <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Switch
        label="Uncheck when selected"
        checked={removeOnSelect}
        onChange={e => dispatch({ type: 'SET_REMOVE_ON_SELECT', value: e.currentTarget.checked })}
        disabled={disabled}
        size="sm"
      />
      <Button variant="light" size="xs" onClick={() => setCustomizeOpen(true)} disabled={disabled}>
        Customize Wheel
      </Button>
      <Group grow>
        <Button
          variant="light"
          size="xs"
          onClick={() => dispatch({ type: 'RESET_SPUN_OUT' })}
          disabled={disabled}
        >
          Reset Checks
        </Button>
        <Button
          variant="light"
          color="red"
          size="xs"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          disabled={disabled}
        >
          Clear All
        </Button>
      </Group>
      <CustomizeWheelModal opened={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </Stack>
  )
}
