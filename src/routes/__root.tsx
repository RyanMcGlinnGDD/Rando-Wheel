/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { WheelProvider } from '../context/WheelContext'
import '@mantine/core/styles.css'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <WheelProvider>
        <Outlet />
      </WheelProvider>
    </MantineProvider>
  )
}
