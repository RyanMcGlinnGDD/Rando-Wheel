import { useWheelState } from '../../context/WheelContext'

// Scale font size down for long names: area ∝ length × size², so size ∝ 1/√length.
// Calibrated so names ≤ 30 chars get the full 7svw; minimum 1.5svw.
function winnerFontSize(name: string): string {
  const size = Math.min(7, Math.max(1.5, 38 / Math.sqrt(Math.max(name.length, 1))))
  return `${size.toFixed(2)}svw`
}

export function WinnerBadge() {
  const { winnerId, entries, wheelStatus, colorTertiary } = useWheelState()
  const winner = entries.find(e => e.id === winnerId)
  const isVisible = wheelStatus === 'spun' && !!winner

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: 'calc(50% + (var(--w) * 4.8 / 39 - 20px) / 2)',
        translate: '-50% -50%',
        color: colorTertiary,
        fontSize: winnerFontSize(winner?.name ?? ''),
        fontWeight: 'bold',
        lineHeight: 1.1,
        maxWidth: '80vw',
        textAlign: 'center',
        overflowWrap: 'break-word',
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
