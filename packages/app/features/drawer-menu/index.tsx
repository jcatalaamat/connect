import { Avatar, Button, Paragraph, Separator, Settings, Text, XStack, YStack, getTokens, useWindowDimensions } from '@my/ui'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { CalendarCheck, Cog, Compass, LayoutDashboard, LogIn, LogOut, MapPin, Shield, User, UserPlus } from '@tamagui/lucide-icons'
import { useCity } from 'app/provider/city'
import { useUserRole } from 'app/hooks'
import { useSafeAreaInsets } from 'app/utils/useSafeAreaInsets'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useUser } from 'app/utils/useUser'
import { SolitoImage } from 'solito/image'
import { useLink } from 'solito/link'

export function DrawerMenu(props) {
  const { profile, avatarUrl, session } = useUser()
  const { city, clearCity } = useCity()
  const { isPractitioner, isAdmin, isAuthenticated, adminCitySlug } = useUserRole()
  const supabase = useSupabase()
  const name = profile?.name
  const insets = useSafeAreaInsets()
  const height = useWindowDimensions().height

  // All useLink calls at the top to maintain consistent hook order
  const exploreLink = useLink({ href: '/' })
  const bookingsLink = useLink({ href: '/booking/lookup' })
  const dashboardLink = useLink({ href: '/practitioner/dashboard' })
  const adminLink = useLink({ href: adminCitySlug ? `/admin/${adminCitySlug}` : '/admin/mallorca' })
  const onboardingLink = useLink({ href: '/practitioner/onboarding' })
  const profileEditLink = useLink({ href: '/profile/edit' })
  const settingsLink = useLink({ href: '/settings' })
  const signInLink = useLink({ href: '/sign-in' })

  const handleLogout = () => {
    supabase.auth.signOut()
  }

  return (
    <DrawerContentScrollView {...props} f={1}>
      <YStack
        maw={600}
        mx="auto"
        w="100%"
        f={1}
        h={height - insets.bottom - insets.top}
        py="$4"
        pb="$2"
      >
        {/* City Selection */}
        {city && (
          <YStack paddingHorizontal="$4" paddingBottom="$4">
            <XStack alignItems="center" gap="$2">
              <MapPin size={16} color="$gray10" />
              <Text size="$3" theme="alt2">{city.name}, {city.country}</Text>
            </XStack>
            <Button
              size="$2"
              marginTop="$2"
              variant="outlined"
              onPress={clearCity}
            >
              Change City
            </Button>
          </YStack>
        )}

        <Separator marginBottom="$2" />

        <Settings>
          <Settings.Items>
            {/* Main Navigation */}
            <Settings.Group>
              <Settings.Item
                icon={Compass}
                {...exploreLink}
                accentTheme="blue"
              >
                Explore
              </Settings.Item>
              <Settings.Item
                icon={CalendarCheck}
                {...bookingsLink}
                accentTheme="green"
              >
                My Bookings
              </Settings.Item>
            </Settings.Group>

            {/* Practitioner Section */}
            {isPractitioner && (
              <Settings.Group>
                <Settings.Item
                  icon={LayoutDashboard}
                  {...dashboardLink}
                  accentTheme="purple"
                >
                  Dashboard
                </Settings.Item>
              </Settings.Group>
            )}

            {/* Admin Section - always show if admin */}
            {isAdmin && (
              <Settings.Group>
                <Settings.Item
                  icon={Shield}
                  {...adminLink}
                  accentTheme="orange"
                >
                  Admin
                </Settings.Item>
              </Settings.Group>
            )}

            {/* Become a Practitioner */}
            {isAuthenticated && !isPractitioner && (
              <Settings.Group>
                <Settings.Item
                  icon={UserPlus}
                  {...onboardingLink}
                  accentTheme="pink"
                >
                  Become a Practitioner
                </Settings.Item>
              </Settings.Group>
            )}

            {/* Account Section */}
            <Settings.Group>
              {isAuthenticated ? (
                <>
                  <Settings.Item
                    icon={User}
                    {...profileEditLink}
                    accentTheme="gray"
                  >
                    Profile
                  </Settings.Item>
                  <Settings.Item {...settingsLink} icon={Cog}>
                    Settings
                  </Settings.Item>
                  <Settings.Item
                    icon={LogOut}
                    onPress={handleLogout}
                    accentTheme="red"
                  >
                    Log Out
                  </Settings.Item>
                </>
              ) : (
                <Settings.Item
                  icon={LogIn}
                  {...signInLink}
                  accentTheme="blue"
                >
                  Sign In
                </Settings.Item>
              )}
            </Settings.Group>
          </Settings.Items>
        </Settings>

        {/* User Info Footer */}
        {isAuthenticated && (
          <XStack gap="$4" mb="$7" mt="auto" ai="center" px="$4">
            <Avatar circular size="$3">
              <SolitoImage
                src={avatarUrl}
                alt="your avatar"
                width={getTokens().size['3'].val}
                height={getTokens().size['3'].val}
              />
            </Avatar>
            <YStack>
              <Paragraph>{name ?? 'No Name'}</Paragraph>
              <Text size="$1" theme="alt2">{session?.user?.email}</Text>
            </YStack>
          </XStack>
        )}
      </YStack>
    </DrawerContentScrollView>
  )
}
