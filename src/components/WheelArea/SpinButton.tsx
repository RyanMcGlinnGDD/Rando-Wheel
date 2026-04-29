import { useState, useEffect } from 'react'
import { useWheelState } from '../../context/WheelContext'

interface Props {
  onSpin: () => void
  onHoverChange: (hovered: boolean) => void
}

export function SpinButton({ onSpin, onHoverChange }: Props) {
  const { wheelStatus, entries, colorTertiary } = useWheelState()
  const isVisible = wheelStatus !== 'spun' && entries.length >= 2
  const hasEligible = entries.some(e => e.included)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setIsHovered(false)
      onHoverChange(false)
    }
  }, [isVisible, onHoverChange])

  return (
    <div
      onMouseUp={e => { if (e.button === 0) onSpin() }}
      onMouseEnter={() => { setIsHovered(true); onHoverChange(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange(false) }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        translate: '-50% -50%',
        width: 'calc(var(--w) * 5 / 39)',
        height: 'calc(var(--w) * 5 / 39)',
        borderRadius: '50%',
        backgroundColor: colorTertiary,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 'calc(var(--w) * 1.3 / 39)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasEligible ? 'pointer' : 'default',
        pointerEvents: isVisible ? 'all' : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? (isHovered ? 'scale(1.05)' : 'scale(1)') : 'scale(0.3)',
        transition: 'transform 0.2s, opacity 0.25s',
        zIndex: 12,
        letterSpacing: 'calc(var(--w) * 0.05 / 39)',
      }}
    >
      SPIN!
    </div>
  )
}
