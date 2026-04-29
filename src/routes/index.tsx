/* eslint-disable react-refresh/only-export-components */
import { useRef, useState, useEffect } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { WheelArea } from '../components/WheelArea/WheelArea'
import { EntrySidebar } from '../components/EntrySidebar/EntrySidebar'
import type { AddEntryFormHandle } from '../components/EntrySidebar/AddEntryForm'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WheelPage,
})

function WheelPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const addEntryFormRef = useRef<AddEntryFormHandle>(null)
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current) }
  }, [])

  const handleEmptyWheelClick = () => {
    setSidebarOpen(true)
    focusTimeoutRef.current = setTimeout(() => addEntryFormRef.current?.focus(), 320)
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <WheelArea onEmptyWheelClick={handleEmptyWheelClick} />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 50,
        }}
      >
        {/* Handle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateX(-100%) translateY(-50%)',
            width: 20,
            height: 52,
            background: 'var(--mantine-color-dark-6)',
            border: '1px solid var(--mantine-color-dark-4)',
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mantine-color-dark-2)',
            fontSize: 16,
            padding: 0,
          }}
        >
          {sidebarOpen ? '›' : '‹'}
        </button>

        <EntrySidebar addEntryFormRef={addEntryFormRef} />
      </div>
    </div>
  )
}
