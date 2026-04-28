import { useRef } from 'react'
import { useWheelState, useWheelDispatch } from '../../context/WheelContext'
import { pickWinner, computeDegrees, normalizeDegree } from '../../utils/spinCalculation'
import { WheelSpinner } from './WheelSpinner'
import { Shader } from './Shader'
import { SpinButton } from './SpinButton'
import { WinnerBadge } from './WinnerBadge'
import { PinIndicator } from './PinIndicator'

export function WheelArea() {
  const state = useWheelState()
  const dispatch = useWheelDispatch()
  const wheelRef = useRef<HTMLDivElement>(null)
  const isSpinningRef = useRef(false)

  const spinWheel = () => {
    if (state.wheelStatus !== 'active' || isSpinningRef.current) return
    const targetIndex = pickWinner(state.entries)
    if (targetIndex === -1) return

    const degrees = computeDegrees(
      targetIndex,
      state.entries.length,
      state.previousEndDegree,
      state.selectionOffset,
    )

    wheelRef.current?.animate([{ transform: `rotate(${degrees}deg)` }], {
      duration: 3000,
      fill: 'forwards',
      easing: 'ease-in-out',
      iterations: 1,
    })

    dispatch({
      type: 'BEGIN_SPIN',
      winnerId: state.entries[targetIndex].id,
      previousEndDegree: degrees,
      selectionOffset: targetIndex,
    })

    isSpinningRef.current = true
    setTimeout(() => {
      isSpinningRef.current = false
    }, 4000)
  }

  const cleanup = () => {
    const adjusted = normalizeDegree(state.previousEndDegree)
    wheelRef.current?.animate([{ transform: `rotate(${adjusted}deg)` }], {
      duration: 0,
      fill: 'forwards',
    })
    dispatch({ type: 'CONFIRM_SPIN' })
  }

  const handleWheelClick = () => {
    if (state.wheelStatus === 'spun' && !isSpinningRef.current) {
      cleanup()
    } else if (state.wheelStatus === 'inactive') {
      dispatch({ type: 'ACTIVATE_WHEEL' })
    }
  }

  const handleShaderClick = () => {
    if (state.wheelStatus === 'active') {
      dispatch({ type: 'DISMISS_WHEEL' })
    } else if (state.wheelStatus === 'spun' && !isSpinningRef.current) {
      cleanup()
    }
  }

  const isInactive = state.wheelStatus === 'inactive'

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <Shader onClick={handleShaderClick} />

      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: '39vw',
          height: '39vw',
          transform: isInactive ? 'translateX(50vw)' : undefined,
          transition: 'transform 0.25s',
          zIndex: 11,
          cursor: isInactive ? 'pointer' : undefined,
        }}
      >
        <WheelSpinner wheelRef={wheelRef} onWheelClick={handleWheelClick} />
        <SpinButton onSpin={spinWheel} />
      </div>

      <WinnerBadge />
      <PinIndicator />
    </div>
  )
}
