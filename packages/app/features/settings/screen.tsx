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
                    {...useLink({ href: '/practitioner/dashboard' })}
                    accentTheme="purple"
                  >
                    Practitioner Dashboard
                  </Settings.Item>
                )}
                {isAdmin && adminCitySlug && (
                  <Settings.Item
                    icon={Shield}
                    {...useLink({ href: `/admin/${adminCitySlug}` })}
                    accentTheme="orange"
                  >
                    Admin Dashboard
                  </Settings.Item>
                )}
                {isAuthenticated && !isPractitioner && (
                  <Settings.Item
                    icon={UserPlus}
                    {...useLink({ href: '/practitioner/onboarding' })}
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
                {...useLink({ href: media.sm ? '/settings/general' : '/settings' })}
                accentTheme="green"
              >
                General
              </Settings.Item>
              <Settings.Item
                icon={Lock}
                isActive={pathname === '/settings/change-password'}
                {...useLink({ href: '/settings/change-password' })}
                accentTheme="green"
              >
                Change Password
              </Settings.Item>
              <Settings.Item
                icon={Mail}
                isActive={pathname === '/settings/change-email'}
                {...useLink({ href: '/settings/change-email' })}
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
                {...useLink({ href: '/privacy-policy' })}
                accentTheme="purple"
              >
                Privacy Policy
              </Settings.Item>
              <Settings.Item
                icon={Book}
                isActive={pathname === '/terms-of-service'}
                {...useLink({ href: '/terms-of-service' })}
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
