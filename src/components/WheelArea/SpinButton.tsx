import { useWheelState } from '../../context/WheelContext'
import { pickWinner } from '../../utils/spinCalculation'

interface Props {
  onSpin: () => void
}

export function SpinButton({ onSpin }: Props) {
  const { wheelStatus, entries } = useWheelState()
  const isVisible = wheelStatus === 'active'
  const hasEligible = pickWinner(entries) !== -1

  return (
    <div
      onMouseUp={onSpin}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        translate: '-50% -50%',
        width: '10vw',
        height: '10vw',
        borderRadius: '50%',
        backgroundColor: 'var(--mantine-color-red-7)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '2.6vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasEligible ? 'pointer' : 'default',
        pointerEvents: isVisible ? 'all' : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(0.9)' : 'scale(0.3)',
        transition: 'transform 0.4s, opacity 0.25s',
        zIndex: 12,
        letterSpacing: '0.1vw',
      }}
    >
      SPIN!
    </div>
  )
}
