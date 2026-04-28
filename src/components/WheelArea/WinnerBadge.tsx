import { useWheelState } from '../../context/WheelContext'

export function WinnerBadge() {
  const { winnerId, entries, wheelStatus } = useWheelState()
  const winner = entries.find(e => e.id === winnerId)
  const isVisible = wheelStatus === 'spun' && !!winner

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        translate: '-50% -50%',
        color: 'var(--mantine-color-red-7)',
        fontSize: '7svw',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        letterSpacing: '0.2vw',
        filter: 'drop-shadow(5px 5px 5px rgba(0,0,0,0.67))',
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.3)',
        transition: isVisible
          ? 'transform 0.6s, opacity 0.3s 0.2s'
          : 'transform 0.4s, opacity 0.25s',
        zIndex: 13,
      }}
    >
      {winner?.name ?? ''}
    </div>
  )
}
