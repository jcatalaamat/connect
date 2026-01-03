import { useTheme, Button } from '@my/ui'
import { DrawerActions } from '@react-navigation/native'
import { Compass, Menu, CalendarCheck, Briefcase, Shield, User } from '@tamagui/lucide-icons'
import { Stack, Tabs, useNavigation } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUserRole } from 'app/hooks'
import { useCity } from 'app/provider/city'

export default function Layout() {
  const { accentColor } = useTheme()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { isPractitioner, isAdmin, adminCitySlug } = useUserRole()
  const { city } = useCity()

  // Show admin tab if user is admin for any city
  const showAdminTab = isAdmin && !!adminCitySlug

  // Header title shows city name when selected
  const headerTitle = city ? city.name : 'Connect'

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
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
        key={`tabs-${isPractitioner}-${showAdminTab}`}
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
        {/* Explore Tab - Always visible */}
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Explore',
            tabBarIcon: ({ size, focused }) => (
              <Compass color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* My Bookings Tab - Always visible */}
        <Tabs.Screen
          name="bookings"
          options={{
            headerShown: false,
            title: 'My Bookings',
            tabBarIcon: ({ size, focused }) => (
              <CalendarCheck color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* My Offerings Tab - Practitioners only */}
        <Tabs.Screen
          name="dashboard"
          options={{
            headerShown: false,
            title: 'My Offerings',
            href: isPractitioner ? '/dashboard' : null,
            tabBarIcon: ({ size, focused }) => (
              <Briefcase color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Admin Tab - Admins only */}
        <Tabs.Screen
          name="admin"
          options={{
            headerShown: false,
            title: 'Admin',
            href: showAdminTab ? '/admin' : null,
            tabBarIcon: ({ size, focused }) => (
              <Shield color={focused ? '$blue10' : '$gray10'} size={size} strokeWidth={2} />
            ),
          }}
        />

        {/* Profile Tab - Always visible */}
        <Tabs.Screen
          name="profile"
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
