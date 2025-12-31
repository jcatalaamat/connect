import { YStack } from '@my/ui'
import { ReactNode } from 'react'
import { NavHeader } from './NavHeader'

interface AppLayoutProps {
  children: ReactNode
  hideHeader?: boolean
}

export function AppLayout({ children, hideHeader = false }: AppLayoutProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      {!hideHeader && <NavHeader />}
      <YStack flex={1}>{children}</YStack>
    </YStack>
  )
}
