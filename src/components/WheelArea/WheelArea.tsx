import { useRef, useEffect, useState } from 'react'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'
import { pickWinner } from '../../utils/spinCalculation'
import { WheelSpinner } from './WheelSpinner'
import { Shader } from './Shader'
import { SpinButton } from './SpinButton'
import { WinnerBadge } from './WinnerBadge'
import { PinIndicator } from './PinIndicator'

const SPIN_DURATION = 3000

interface Props {
  onEmptyWheelClick: () => void
}

export function WheelArea({ onEmptyWheelClick }: Props) {
  const state = useWheelState()
  const { colorSecondary } = state
  const dispatch = useWheelDispatch()
  const wheelRef = useRef<HTMLDivElement>(null)
  const isSpinningRef = useRef(false)
  const pendingWinnerIdRef = useRef<string | null>(null)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks the wheel's actual visual rotation (0-359°) so each spin starts
  // from the correct position regardless of entry additions/removals.
  const visualDegRef = useRef(0)
  const [spinHovered, setSpinHovered] = useState(false)

  useEffect(() => {
    return () => { if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current) }
  }, [])

  useEffect(() => {
    if (state.entries.length <= 1) {
      const fromDeg = visualDegRef.current
      visualDegRef.current = 0
      wheelRef.current?.animate(
        [{ transform: `rotate(${fromDeg}deg)` }, { transform: 'rotate(0deg)' }],
        { duration: 300, fill: 'forwards' },
      )
    }
  }, [state.entries.length])

  const spinWheel = () => {
    if (state.wheelStatus !== 'inactive' || isSpinningRef.current) return
    const targetIndex = pickWinner(state.entries)
    if (targetIndex === -1) return

    const n = state.entries.length
    const fraction = 360 / n
    // The visual rotation at which segment targetIndex aligns with the pin.
    const targetVisualDeg = ((n - targetIndex) * fraction) % 360
    const fromDeg = visualDegRef.current
    // Spin forward by however far it takes to reach targetVisualDeg, plus
    // 1440° (4 full rotations) to make the spin look substantial.
    const forwardNeeded = (targetVisualDeg - fromDeg + 360) % 360
    const toDeg = fromDeg + forwardNeeded + 1440

    wheelRef.current?.animate(
      [{ transform: `rotate(${fromDeg}deg)` }, { transform: `rotate(${toDeg}deg)` }],
      { duration: SPIN_DURATION, fill: 'forwards', easing: 'ease-in-out', iterations: 1 },
    )

    pendingWinnerIdRef.current = state.entries[targetIndex].id

    dispatch({ type: 'BEGIN_SPIN' })

    isSpinningRef.current = true
    spinTimeoutRef.current = setTimeout(() => {
      visualDegRef.current = toDeg % 360
      if (pendingWinnerIdRef.current) {
        dispatch({ type: 'REVEAL_WINNER', winnerId: pendingWinnerIdRef.current })
        pendingWinnerIdRef.current = null
      }
      isSpinningRef.current = false
    }, SPIN_DURATION)
  }

  const cleanup = () => {
    // Snap to the stored visual position to clear the large accumulated WAAPI value.
    wheelRef.current?.animate(
      [{ transform: `rotate(${visualDegRef.current}deg)` }],
      { duration: 0, fill: 'forwards' },
    )
    dispatch({ type: 'CONFIRM_SPIN' })
  }

  const handleDismiss = () => {
    if (state.wheelStatus === 'spun' && !isSpinningRef.current) {
      cleanup()
    }
  }

  return (
    <div>
      <Shader onClick={handleDismiss} />

      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          translate: '-50% calc(-50% + (var(--w) * 4.8 / 39 - 20px) / 2)',
          width: 'var(--w)',
          height: 'var(--w)',
          zIndex: 11,
          cursor: state.wheelStatus === 'spun' ? 'pointer' : undefined,
        }}
      >
        <WheelSpinner wheelRef={wheelRef} onWheelClick={handleDismiss} onEmptyClick={onEmptyWheelClick} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: `inset 0 0 0 2px ${colorSecondary}`,
            opacity: state.wheelStatus === 'spun' && state.winnerId !== null ? 0.5 : 1,
            transition: 'opacity 0.4s',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />
        <SpinButton onSpin={spinWheel} onHoverChange={setSpinHovered} />
      </div>

      <WinnerBadge />
      <PinIndicator spinHovered={spinHovered} />
    </div>
  )
}
