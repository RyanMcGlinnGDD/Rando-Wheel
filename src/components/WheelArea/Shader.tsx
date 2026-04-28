import { useWheelState } from '../../context/WheelContext'

interface Props {
  onClick: () => void
}

export function Shader({ onClick }: Props) {
  const { wheelStatus } = useWheelState()
  const isInactive = wheelStatus === 'inactive'

  return (
    <div
      onMouseUp={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: isInactive ? 0 : 1,
        pointerEvents: isInactive ? 'none' : 'all',
        cursor: 'pointer',
        transition: 'opacity 0.25s',
        zIndex: 10,
      }}
    />
  )
}
