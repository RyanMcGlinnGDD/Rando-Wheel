import type { CSSProperties, RefObject } from 'react'
import { useWheelState } from '../../context/WheelContext'
import styles from './WheelSpinner.module.css'

interface Props {
  wheelRef: RefObject<HTMLDivElement>
  onWheelClick: () => void
}

export function WheelSpinner({ wheelRef, onWheelClick }: Props) {
  const { entries, wheelStatus, winnerId, colorPrimary, colorSecondary, colorWinner } =
    useWheelState()

  const getSegmentBg = (index: number, id: string) => {
    if (id === winnerId) return colorWinner
    return index % 2 === 0 ? colorPrimary : colorSecondary
  }

  const getSegmentTextColor = (id: string) => {
    if (id === winnerId) return 'white'
    return 'var(--mantine-color-dark-9)'
  }

  const isDimmed = (id: string, included: boolean, spunOut: boolean) =>
    !included || (spunOut && id !== winnerId)

  return (
    <div ref={wheelRef} className={styles.wheelObject} onMouseUp={onWheelClick}>
      <ul
        className={styles.wheelVisual}
        style={{ '--items': entries.length } as CSSProperties}
      >
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`${styles.segment} ${
              wheelStatus === 'spun' ? styles.fastTransition : styles.instantTransition
            } ${isDimmed(entry.id, entry.included, entry.spunOut) ? styles.dimmedText : ''}`}
            style={
              {
                '--idx': i + 1,
                backgroundColor: getSegmentBg(i, entry.id),
                color: getSegmentTextColor(entry.id),
              } as CSSProperties
            }
          >
            <p>{entry.name}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
