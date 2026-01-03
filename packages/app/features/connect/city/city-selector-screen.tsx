import { YStack, XStack, H1, H2, Text, Card, Spinner, Image, Input } from '@my/ui'
import { Search } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useState, useMemo } from 'react'

// City card component
function CityCard({
  id,
  name,
  slug,
  country,
  coverImageUrl,
  description,
  practitionerCount,
  onSelect,
}: {
  id: string
  name: string
  slug: string
  country: string
  coverImageUrl?: string | null
  description?: string | null
  practitionerCount?: number
  onSelect: () => void
}) {
  return (
    <Card
      elevate
      bordered
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1 }}
      pressStyle={{ scale: 0.96 }}
      onPress={onSelect}
      cursor="pointer"
      width={320}
      minHeight={180}
      overflow="hidden"
    >
      {coverImageUrl && (
        <Card.Background>
          <Image
            source={{ uri: coverImageUrl }}
            alt={name}
            width="100%"
            height={200}
            objectFit="cover"
            opacity={0.3}
          />
        </Card.Background>
      )}
      <Card.Header padded>
        <H2 size="$8">{name}</H2>
        <Text theme="alt2" size="$4">
          {country}
        </Text>
      </Card.Header>
      <Card.Footer padded>
        <YStack gap="$2" width="100%">
          {description && (
            <Text size="$3" flexWrap="wrap" flexShrink={1}>
              {description}
            </Text>
          )}
          {practitionerCount !== undefined && practitionerCount > 0 && (
            <Text size="$2" theme="alt1">
              {practitionerCount} practitioner{practitionerCount !== 1 ? 's' : ''}
            </Text>
          )}
        </YStack>
      </Card.Footer>
    </Card>
  )
}

export function CitySelectorScreen() {
  const { data: cities, isLoading, error } = api.cities.list.useQuery()
  const { setCity } = useCity()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!cities) return []
    if (!searchQuery.trim()) return cities

    const query = searchQuery.toLowerCase().trim()
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query)
    )
  }, [cities, searchQuery])

  // Show search when there are many cities
  const showSearch = cities && cities.length > 6

  const handleSelectCity = (city: { id: string; slug: string; name: string; country: string }) => {
    setCity(city)
    // On web, also navigate to the city URL for SEO
    if (Platform.OS === 'web') {
      router.push(`/${city.slug}`)
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
        <Text marginTop="$4">Loading cities...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$3">
        <Text color="$red10" fontWeight="600">Failed to load cities</Text>
        <Text size="$2" theme="alt2" textAlign="center">
          {error.message}
        </Text>
        <Text size="$2" theme="alt2" textAlign="center">
          Make sure the Next.js server is running (yarn next:dev)
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$6">
      <YStack gap="$2" alignItems="center" paddingTop="$8">
        <H1 size="$9" textAlign="center">
          Connect
        </H1>
        <Text size="$5" theme="alt2" textAlign="center">
          Book local wellness sessions & events
        </Text>
      </YStack>

      <YStack gap="$3" alignItems="center" width="100%" maxWidth={500} alignSelf="center">
        <Text size="$4" fontWeight="600">
          Choose your city
        </Text>

        {showSearch && (
          <XStack
            width="100%"
            paddingHorizontal="$4"
            alignItems="center"
            gap="$2"
          >
            <Input
              flex={1}
              size="$4"
              placeholder="Search cities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Search size={20} color="$gray10" />
          </XStack>
        )}
      </YStack>

      <XStack
        flexWrap="wrap"
        justifyContent="center"
        gap="$4"
        paddingHorizontal="$4"
      >
        {filteredCities.map((city) => (
          <CityCard
            key={city.id}
            id={city.id}
            name={city.name}
            slug={city.slug}
            country={city.country}
            coverImageUrl={city.cover_image_url}
            description={city.description}
            onSelect={() => handleSelectCity({
              id: city.id,
              slug: city.slug,
              name: city.name,
              country: city.country,
            })}
          />
        ))}
      </XStack>

      {filteredCities.length === 0 && searchQuery && (
        <YStack alignItems="center" padding="$8">
          <Text theme="alt2">No cities match "{searchQuery}"</Text>
        </YStack>
      )}

      {(!cities || cities.length === 0) && !searchQuery && (
        <YStack alignItems="center" padding="$8">
          <Text theme="alt2">No cities available yet</Text>
        </YStack>
      )}
    </YStack>
  )
}
