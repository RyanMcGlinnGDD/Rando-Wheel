import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { WheelArea } from '../components/WheelArea/WheelArea'
import { EntrySidebar } from '../components/EntrySidebar/EntrySidebar'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WheelPage,
})

function WheelPage() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <WheelArea />
      <EntrySidebar />
    </div>
  )
}
