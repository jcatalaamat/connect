import { YStack, XStack, H1, H2, Text, Button, Spinner, Image } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { Platform } from 'react-native'

interface CityHomeScreenProps {
  citySlug: string
}

export function CityHomeScreen({ citySlug }: CityHomeScreenProps) {
  const {
    data: city,
    isLoading,
    error,
  } = api.cities.getBySlug.useQuery({ slug: citySlug })

  const { clearCity } = useCity()
  const router = useRouter()

  const handleChangeCity = () => {
    clearCity()
    if (Platform.OS === 'web') {
      router.push('/')
    }
  }

  const handleBrowsePractitioners = () => {
    router.push(`/${citySlug}/practitioners`)
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
        <Text marginTop="$4">Loading...</Text>
      </YStack>
    )
  }

  if (error || !city) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <Text color="$red10">City not found</Text>
        <Button onPress={handleChangeCity}>Choose a different city</Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      {/* Hero section */}
      <YStack
        height={300}
        justifyContent="flex-end"
        padding="$6"
        position="relative"
        backgroundColor="$background"
      >
        {city.cover_image_url && (
          <Image
            source={{ uri: city.cover_image_url }}
            alt={city.name}
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            objectFit="cover"
            opacity={0.4}
          />
        )}
        <YStack gap="$2" zIndex={1}>
          <H1 size="$10">{city.name}</H1>
          <Text size="$5" theme="alt2">
            {city.country}
          </Text>
        </YStack>
      </YStack>

      {/* Content */}
      <YStack padding="$4" gap="$6">
        {city.description && (
          <Text size="$4" lineHeight="$5">
            {city.description}
          </Text>
        )}

        {/* Stats */}
        <XStack gap="$4" flexWrap="wrap">
          <YStack
            backgroundColor="$backgroundHover"
            padding="$4"
            borderRadius="$4"
            minWidth={120}
          >
            <Text size="$8" fontWeight="700">
              {city.practitionerCount}
            </Text>
            <Text size="$3" theme="alt2">
              Practitioners
            </Text>
          </YStack>
        </XStack>

        {/* Actions */}
        <YStack gap="$3">
          <Button
            size="$5"
            theme="active"
            onPress={handleBrowsePractitioners}
          >
            Browse Practitioners
          </Button>

          <Button
            size="$4"
            variant="outlined"
            onPress={handleChangeCity}
          >
            Change City
          </Button>
        </YStack>
      </YStack>
    </YStack>
  )
}
