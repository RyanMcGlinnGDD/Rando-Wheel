import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div style={{ color: 'white', padding: 24 }}>Rando-Wheel — scaffold OK</div>
  ),
})
