import { useWheelState } from '../../context/WheelContext'

const PIN_SRC = '/pin.png'

export function PinIndicator() {
  const { wheelStatus } = useWheelState()
  const isActive = wheelStatus !== 'inactive'

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        translate: 'calc(-50% + 0.1vw) -50%',
        pointerEvents: 'none',
        zIndex: 14,
      }}
    >
      <img
        src={PIN_SRC}
        alt="pin"
        style={{
          height: '7vw',
          translate: '0 -22vw',
          transition: 'transform 0.25s',
          transform: isActive ? undefined : 'translateX(45vw) translateY(4vw) rotate(-15deg)',
          animation: isActive ? 'pinBounce 1s ease-in-out infinite' : undefined,
        }}
      />
      <style>{`
        @keyframes pinBounce {
          0%, 100% { translate: 0 -22vw; }
          50% { translate: 0 -21vw; }
        }
      `}</style>
    </div>
  )
}
