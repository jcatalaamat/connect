import { SettingsScreen } from 'app/features/settings/screen'
import { Stack } from 'expo-router'

export default function ProfileTabScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <SettingsScreen />
    </>
  )
}
