import { useTheme, Button } from '@my/ui'
import { DrawerActions } from '@react-navigation/native'
import { Home, Menu, Calendar, LayoutDashboard, Shield, User } from '@tamagui/lucide-icons'
import { router, Stack, Tabs, useNavigation, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUserRole } from 'app/hooks'

export default function Layout() {
  const { accentColor } = useTheme()
  const navigation = useNavigation()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const { isPractitioner, isAdmin, adminCitySlug, isLoading } = useUserRole()

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Connect',
          headerShown: true,
          headerTintColor: accentColor.val,
          headerLeft: () => (
            <Button
              borderStyle="unset"
              borderWidth={0}
              backgroundColor="transparent"
              marginLeft="$-1"
              paddingHorizontal="$4"
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer())
              }}
            >
              <Menu size={24} />
            </Button>
          ),
        }}
      />
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          headerTintColor: accentColor.val,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            height: 60 + insets.bottom,
          },
          tabBarItemStyle: {
            paddingBottom: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10,
          },
        }}
      >
        {/* Browse Tab - Always visible */}
        <Tabs.Screen
          name="index"
          key="index"
          options={{
            headerShown: false,
            title: 'Browse',
            tabBarIcon: ({ size, focused }) => (
              <Home color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Bookings Tab - Always visible */}
        <Tabs.Screen
          name="bookings"
          key="bookings"
          options={{
            headerShown: false,
            title: 'Bookings',
            tabBarIcon: ({ size, focused }) => (
              <Calendar color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Dashboard Tab - Practitioners only */}
        <Tabs.Screen
          name="dashboard"
          key="dashboard"
          options={{
            headerShown: false,
            title: 'Dashboard',
            href: isPractitioner ? '/dashboard' : null,
            tabBarIcon: ({ size, focused }) => (
              <LayoutDashboard color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Admin Tab - Admins only */}
        <Tabs.Screen
          name="admin"
          key="admin"
          options={{
            headerShown: false,
            title: 'Admin',
            href: isAdmin ? '/admin' : null,
            tabBarIcon: ({ size, focused }) => (
              <Shield color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Profile Tab - Always visible */}
        <Tabs.Screen
          name="profile"
          key="profile"
          options={{
            headerShown: false,
            title: 'Profile',
            tabBarIcon: ({ size, focused }) => (
              <User color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
