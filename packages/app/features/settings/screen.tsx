import { Paragraph, ScrollView, Separator, Settings, YStack, isWeb, useMedia } from '@my/ui'
import { Book, Cog, LayoutDashboard, Lock, LogOut, Mail, Moon, Shield, UserPlus } from '@tamagui/lucide-icons'
import { useUserRole } from 'app/hooks'
import { useThemeSetting } from 'app/provider/theme'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { usePathname } from 'app/utils/usePathname'
import { useLink } from 'solito/link'

import packageJson from '../../package.json'

export const SettingsScreen = () => {
  const media = useMedia()
  const pathname = usePathname()
  const { isPractitioner, isAdmin, adminCitySlug, isAuthenticated } = useUserRole()

  // All useLink calls at the top to maintain consistent hook order
  const dashboardLink = useLink({ href: '/practitioner/dashboard' })
  const adminLink = useLink({ href: adminCitySlug ? `/admin/${adminCitySlug}` : '/admin' })
  const onboardingLink = useLink({ href: '/practitioner/onboarding' })
  const generalLink = useLink({ href: media.sm ? '/settings/general' : '/settings' })
  const changePasswordLink = useLink({ href: '/settings/change-password' })
  const changeEmailLink = useLink({ href: '/settings/change-email' })
  const privacyLink = useLink({ href: '/privacy-policy' })
  const termsLink = useLink({ href: '/terms-of-service' })

  return (
    <YStack f={1}>
      <ScrollView>
        <Settings>
          <Settings.Items>
            {/* Role-based shortcuts */}
            {(isPractitioner || isAdmin || isAuthenticated) && (
              <Settings.Group $gtSm={{ space: '$1' }}>
                {isPractitioner && (
                  <Settings.Item
                    icon={LayoutDashboard}
                    {...dashboardLink}
                    accentTheme="purple"
                  >
                    Practitioner Dashboard
                  </Settings.Item>
                )}
                {isAdmin && adminCitySlug && (
                  <Settings.Item
                    icon={Shield}
                    {...adminLink}
                    accentTheme="orange"
                  >
                    Admin Dashboard
                  </Settings.Item>
                )}
                {isAuthenticated && !isPractitioner && (
                  <Settings.Item
                    icon={UserPlus}
                    {...onboardingLink}
                    accentTheme="pink"
                  >
                    Become a Practitioner
                  </Settings.Item>
                )}
              </Settings.Group>
            )}
            {(isPractitioner || isAdmin || isAuthenticated) && isWeb && (
              <Separator boc="$color3" mx="$-4" bw="$0.25" />
            )}
            <Settings.Group $gtSm={{ space: '$1' }}>
              <Settings.Item
                icon={Cog}
                isActive={pathname === 'settings/general'}
                {...generalLink}
                accentTheme="green"
              >
                General
              </Settings.Item>
              <Settings.Item
                icon={Lock}
                isActive={pathname === '/settings/change-password'}
                {...changePasswordLink}
                accentTheme="green"
              >
                Change Password
              </Settings.Item>
              <Settings.Item
                icon={Mail}
                isActive={pathname === '/settings/change-email'}
                {...changeEmailLink}
                accentTheme="green"
              >
                Change Email
              </Settings.Item>
            </Settings.Group>
            {isWeb && <Separator boc="$color3" mx="$-4" bw="$0.25" />}
            <Settings.Group>
              <Settings.Item
                icon={Book}
                isActive={pathname === '/privacy-policy'}
                {...privacyLink}
                accentTheme="purple"
              >
                Privacy Policy
              </Settings.Item>
              <Settings.Item
                icon={Book}
                isActive={pathname === '/terms-of-service'}
                {...termsLink}
                accentTheme="purple"
              >
                Terms Of Service
              </Settings.Item>
            </Settings.Group>
            {isWeb && <Separator boc="$color3" mx="$-4" bw="$0.25" />}
            <Settings.Group>
              <SettingsThemeAction />
              <SettingsItemLogoutAction />
            </Settings.Group>
          </Settings.Items>
        </Settings>
      </ScrollView>
      <Paragraph py="$2" ta="center" theme="alt2">
        Connect v{packageJson.version}
      </Paragraph>
    </YStack>
  )
}

const SettingsThemeAction = () => {
  const { toggle, current } = useThemeSetting()

  return (
    <Settings.Item icon={Moon} accentTheme="blue" onPress={toggle} rightLabel={current}>
      Theme
    </Settings.Item>
  )
}

const SettingsItemLogoutAction = () => {
  const supabase = useSupabase()

  return (
    <Settings.Item icon={LogOut} accentTheme="red" onPress={() => supabase.auth.signOut()}>
      Log Out
    </Settings.Item>
  )
}
