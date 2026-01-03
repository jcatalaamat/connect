import type { Session } from '@supabase/supabase-js'
import { Provider, loadThemePromise } from 'app/provider'
import { supabase } from 'app/utils/supabase/client.native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { LogBox, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

SplashScreen.preventAutoHideAsync()

LogBox.ignoreLogs([
  'Cannot update a component',
  'You are setting the style',
  'No route',
  'duplicate ID',
  'Require cycle',
])

export default function HomeLayout() {
  const [fontLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  const [themeLoaded, setThemeLoaded] = useState(false)
  const [sessionLoadAttempted, setSessionLoadAttempted] = useState(false)
  const [initialSession, setInitialSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data) {
          setInitialSession(data.session)
        }
      })
      .finally(() => {
        setSessionLoadAttempted(true)
      })
  }, [])

  useEffect(() => {
    loadThemePromise.then(() => {
      setThemeLoaded(true)
    })
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded && sessionLoadAttempted) {
      await SplashScreen.hideAsync()
    }
  }, [fontLoaded, sessionLoadAttempted])

  if (!themeLoaded || !fontLoaded || !sessionLoadAttempted) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Provider initialSession={initialSession}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(drawer)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="city-select"
              options={{
                headerShown: true,
                title: 'Choose Your City',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="create"
              options={{
                headerShown: true,
                title: 'New Offering',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: true,
                headerBackTitle: 'Back',
              }}
            />
            {/* Practitioner dashboard screens */}
            <Stack.Screen
              name="practitioner/dashboard/offerings/index"
              options={{
                headerShown: true,
                title: 'My Offerings',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/dashboard/offerings/new"
              options={{
                headerShown: true,
                title: 'New Offering',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/dashboard/offerings/[id]/index"
              options={{
                headerShown: true,
                title: 'Offering Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/dashboard/offerings/[id]/edit"
              options={{
                headerShown: true,
                title: 'Edit Offering',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/dashboard/bookings/index"
              options={{
                headerShown: true,
                title: 'My Bookings',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/dashboard/bookings/[id]"
              options={{
                headerShown: true,
                title: 'Booking Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/stripe-setup"
              options={{
                headerShown: true,
                title: 'Stripe Setup',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="practitioner/onboarding"
              options={{
                headerShown: true,
                title: 'Become a Practitioner',
                headerBackTitle: 'Back',
              }}
            />
            {/* Public city/practitioner pages */}
            <Stack.Screen
              name="[city]/[practitioner]/index"
              options={{
                headerShown: true,
                title: 'Practitioner',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="[city]/[practitioner]/[offering]"
              options={{
                headerShown: true,
                title: 'Offering',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="book/[offeringId]"
              options={{
                headerShown: true,
                title: 'Book',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="booking/lookup"
              options={{
                headerShown: true,
                title: 'Find Booking',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="booking/confirmation/[code]"
              options={{
                headerShown: true,
                title: 'Booking Confirmed',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>
        </Provider>
      </View>
    </GestureHandlerRootView>
  )
}
