import { useWheelState } from '../../context/WheelContext'

interface Props {
  spinHovered: boolean
}

export function PinIndicator({ spinHovered }: Props) {
  const { entries, colorTertiary } = useWheelState()
  const isVisible = entries.length >= 1

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: 'calc(50% - var(--w) / 2 - var(--w) * 2.4 / 39 + 10px)',
        translate: '-50% 0',
        width: 'calc(var(--w) * 5.4 / 39)',
        height: 'calc(var(--w) * 4.8 / 39)',
        clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
        backgroundColor: colorTertiary,
        transform: spinHovered ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: 'top center',
        transition: 'transform 0.2s',
        pointerEvents: 'none',
        zIndex: 14,
      }}
    />
  )
}
