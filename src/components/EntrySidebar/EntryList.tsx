import { ScrollArea } from '@mantine/core'
import { useWheelState } from '../../context/WheelContext'
import { EntryRow } from './EntryRow'

export function EntryList() {
  const { entries } = useWheelState()

  return (
    <ScrollArea flex={1} type="auto">
      {entries.map(entry => (
        <EntryRow key={entry.id} entry={entry} />
      ))}
    </ScrollArea>
  )
}
