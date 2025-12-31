import { DrawerMenu } from '@my/app/features/drawer-menu'
import { Drawer } from 'expo-router/drawer'

export default function Layout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerMenu {...props} />}
      screenOptions={{
        drawerType: 'back',
        swipeEnabled: true,
      }}
    />
  )
}
