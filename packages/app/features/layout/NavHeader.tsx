import { XStack, YStack, H3, Button, Text, Sheet, Separator, Anchor } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { Menu, X, Home, Calendar, User, LayoutDashboard, Shield, LogIn, UserPlus } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Platform } from 'react-native'
import { useCity } from 'app/provider/city'
import { useUserRole } from 'app/hooks/useUserRole'
import { useUser } from 'app/utils/useUser'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  show: boolean
}

export function NavHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { city, citySlug, clearCity } = useCity()
  const { isPractitioner, isAdmin, isAuthenticated, adminCitySlug } = useUserRole()
  const { user } = useUser()

  const navItems: NavItem[] = [
    {
      label: city ? city.name : 'Browse',
      href: citySlug ? `/${citySlug}` : '/',
      icon: <Home size={18} />,
      show: true,
    },
    {
      label: 'Bookings',
      href: '/booking/lookup',
      icon: <Calendar size={18} />,
      show: true,
    },
    {
      label: 'Become a Practitioner',
      href: '/practitioner/onboarding',
      icon: <UserPlus size={18} />,
      show: isAuthenticated && !isPractitioner,
    },
    {
      label: 'Dashboard',
      href: '/practitioner/dashboard',
      icon: <LayoutDashboard size={18} />,
      show: isPractitioner,
    },
    {
      label: 'Admin',
      href: adminCitySlug ? `/admin/${adminCitySlug}` : '/admin',
      icon: <Shield size={18} />,
      show: isAdmin && !!adminCitySlug,
    },
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      href: isAuthenticated ? '/profile' : '/sign-in',
      icon: isAuthenticated ? <User size={18} /> : <LogIn size={18} />,
      show: true,
    },
  ]

  const visibleItems = navItems.filter((item) => item.show)

  const handleNavigation = (href: string) => {
    setMenuOpen(false)
    router.push(href)
  }

  const handleLogoClick = () => {
    clearCity()
    router.push('/')
  }

  // Desktop navigation
  const DesktopNav = () => (
    <XStack
      display="none"
      $gtSm={{ display: 'flex' }}
      gap="$2"
      alignItems="center"
    >
      {visibleItems.map((item) => (
        <Button
          key={item.href}
          size="$3"
          chromeless
          onPress={() => handleNavigation(item.href)}
          icon={item.icon}
        >
          {item.label}
        </Button>
      ))}
    </XStack>
  )

  // Mobile hamburger menu
  const MobileNav = () => (
    <>
      <Button
        size="$3"
        chromeless
        display="flex"
        $gtSm={{ display: 'none' }}
        onPress={() => setMenuOpen(true)}
        icon={<Menu size={24} />}
        aria-label="Open menu"
      />
      <Sheet
        modal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame padding="$4" gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Menu</H3>
            <Button
              size="$3"
              chromeless
              circular
              icon={<X size={24} />}
              onPress={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
          </XStack>
          <Separator />
          <YStack gap="$2">
            {visibleItems.map((item) => (
              <Button
                key={item.href}
                size="$5"
                justifyContent="flex-start"
                onPress={() => handleNavigation(item.href)}
                icon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </YStack>
          {city && (
            <>
              <Separator />
              <Button
                size="$4"
                variant="outlined"
                onPress={() => {
                  setMenuOpen(false)
                  clearCity()
                  router.push('/')
                }}
              >
                Change City
              </Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <Separator />
              <Text size="$2" theme="alt2" textAlign="center">
                Signed in as {user?.email}
              </Text>
            </>
          )}
        </Sheet.Frame>
      </Sheet>
    </>
  )

  return (
    <XStack
      backgroundColor="$background"
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      position="sticky"
      top={0}
      zIndex={1000}
      {...(Platform.OS === 'web' && {
        style: { position: 'sticky' as any },
      })}
    >
      {/* Logo */}
      <Button
        chromeless
        onPress={handleLogoClick}
        paddingHorizontal="$2"
      >
        <H3 fontWeight="700">Connect</H3>
      </Button>

      {/* Navigation */}
      <DesktopNav />
      <MobileNav />
    </XStack>
  )
}
