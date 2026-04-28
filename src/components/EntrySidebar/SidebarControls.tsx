import { Switch, Button, Stack, Group } from '@mantine/core'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'

export function SidebarControls() {
  const { removeOnSelect } = useWheelState()
  const dispatch = useWheelDispatch()

  return (
    <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Switch
        label="Remove from wheel when selected"
        checked={removeOnSelect}
        onChange={e => dispatch({ type: 'SET_REMOVE_ON_SELECT', value: e.currentTarget.checked })}
        size="sm"
      />
      <Group grow>
        <Button
          variant="light"
          size="xs"
          onClick={() => dispatch({ type: 'RESET_SPUN_OUT' })}
        >
          Reset Spun
        </Button>
        <Button
          variant="light"
          color="red"
          size="xs"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
        >
          Clear All
        </Button>
      </Group>
    </Stack>
  )
}
