import type { CSSProperties, RefObject } from 'react'
import { useWheelState } from '../../context/WheelContext'
import styles from './WheelSpinner.module.css'

// Returns a cqi font-size that fits `name` within `availableCqi` of space,
// assuming bold text at ~0.55× char-width-to-height ratio.
function fitFontSize(name: string, maxCqi: number, availableCqi: number): string {
  const size = Math.min(maxCqi, Math.max(1.5, availableCqi / Math.max(name.length, 1)))
  return `${size.toFixed(2)}cqi`
}

interface Props {
  wheelRef: RefObject<HTMLDivElement>
  onWheelClick: () => void
  onEmptyClick: () => void
}

export function WheelSpinner({ wheelRef, onWheelClick, onEmptyClick }: Props) {
  const { entries, wheelStatus, winnerId, colorPrimary, colorSecondary } =
    useWheelState()

  const getSegmentBg = (id: string) => {
    if (id === winnerId) return colorSecondary
    return colorPrimary
  }

  const getSegmentTextColor = (id: string) => {
    if (id === winnerId) return '#ffffff'
    return colorSecondary
  }

  const isDimmed = (id: string, included: boolean) => !included && id !== winnerId
  const isSpunComplete = wheelStatus === 'spun' && winnerId !== null
  const segmentOpacity = isSpunComplete ? 0.5 : 1

  const n = entries.length

  if (n === 0) {
    return (
      <div
        ref={wheelRef}
        className={styles.wheelObject}
        onClick={onEmptyClick}
        style={{ containerType: 'inline-size', cursor: 'pointer' } as CSSProperties}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--mantine-color-dark-6)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '4cqi',
              letterSpacing: '0.1vh',
              textAlign: 'center',
              padding: '0 8cqi',
              color: 'var(--mantine-color-dark-3)',
            }}
          >
            Click to add entries
          </p>
        </div>
      </div>
    )
  }

  // For 1 entry render a plain full circle — the triangle/rectangle segment
  // techniques both degenerate at n=1
  if (n === 1) {
    const entry = entries[0]
    const transitionStyle = wheelStatus === 'spun'
      ? 'background-color 0.35s linear 0.25s, color 0.35s linear 0.25s'
      : 'background-color 0.1s linear, color 0.1s linear'
    return (
      <div
        ref={wheelRef}
        className={styles.wheelObject}
        onMouseUp={e => { if (e.button === 0) onWheelClick() }}
        style={{ containerType: 'inline-size' } as CSSProperties}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getSegmentBg(entry.id),
            color: getSegmentTextColor(entry.id),
            opacity: segmentOpacity,
            transition: `opacity 0.4s, ${transitionStyle}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: fitFontSize(entry.name, 5, 145),
              letterSpacing: '0.2vh',
              whiteSpace: 'nowrap',
              opacity: isDimmed(entry.id, entry.included) ? 0.25 : 1,
              transition: 'opacity 0.25s',
            }}
          >
            {entry.name}
          </p>
        </div>
      </div>
    )
  }

  // For n=2 use a rectangle clip-path so each segment covers a full semicircle.
  // tan(90°) is undefined, making the CSS calc() approach unusable at n=2.
  // For n>=3 compute aspect-ratio in JS (same value as the CSS tan() formula).
  const segmentShape: CSSProperties =
    n === 2
      ? { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', height: '100cqi' }
      : { clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', aspectRatio: `1 / ${2 * Math.tan(Math.PI / n)}` }

  return (
    <div ref={wheelRef} className={styles.wheelObject} onMouseUp={e => { if (e.button === 0) onWheelClick() }}>
      <ul
        className={styles.wheelVisual}
        style={{ '--items': n } as CSSProperties}
      >
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`${styles.segment} ${
              wheelStatus === 'spun' ? styles.fastTransition : styles.instantTransition
            } ${isDimmed(entry.id, entry.included) ? styles.dimmedText : ''}`}
            style={
              {
                '--idx': i + 1,
                backgroundColor: getSegmentBg(entry.id),
                color: getSegmentTextColor(entry.id),
                opacity: segmentOpacity,
                ...segmentShape,
              } as CSSProperties
            }
          >
            <p style={{ fontSize: fitFontSize(entry.name, 3.5, 46) }}>{entry.name}</p>
          </li>
        ))}
      </ul>
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: isSpunComplete ? 0.5 : 1,
          transition: 'opacity 0.4s',
        }}
      >
        {Array.from({ length: n }, (_, i) => {
          const angle = (3 * Math.PI) / 2 - Math.PI / n + (i * 2 * Math.PI) / n
          const x = 50 + 50 * Math.cos(angle)
          const y = 50 + 50 * Math.sin(angle)
          return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke={colorSecondary} strokeWidth="0.5" />
        })}
      </svg>
    </div>
  )
}
