import { YStack, XStack, H1, H2, H3, Text, Card, Spinner, Image, Input, Button, Paragraph, Sheet } from '@my/ui'
import { Search, MapPin, Plus, X } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { Platform, ScrollView } from 'react-native'
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
  isCurrentCity,
}: {
  id: string
  name: string
  slug: string
  country: string
  coverImageUrl?: string | null
  description?: string | null
  practitionerCount?: number
  onSelect: () => void
  isCurrentCity?: boolean
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
      borderColor={isCurrentCity ? '$green8' : undefined}
      borderWidth={isCurrentCity ? 2 : 1}
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
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack>
            <H2 size="$8">{name}</H2>
            <Text theme="alt2" size="$4">
              {country}
            </Text>
          </YStack>
          {isCurrentCity && (
            <Button size="$2" theme="green" disabled circular icon={MapPin} />
          )}
        </XStack>
      </Card.Header>
      <Card.Footer padded>
        <YStack gap="$2" width="100%">
          {description && (
            <Text size="$3" flexWrap="wrap" flexShrink={1} numberOfLines={2}>
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

// Request City Sheet component
function RequestCitySheet({
  open,
  onOpenChange,
  initialCityName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCityName?: string
}) {
  const [cityName, setCityName] = useState(initialCityName || '')
  const [country, setCountry] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const requestCityMutation = api.cities.requestCity.useMutation({
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const handleSubmit = () => {
    requestCityMutation.mutate({
      cityName: cityName.trim(),
      country: country.trim(),
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset after animation
    setTimeout(() => {
      setCityName(initialCityName || '')
      setCountry('')
      setSubmitted(false)
      requestCityMutation.reset()
    }, 300)
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[50]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" gap="$4">
        <Sheet.Handle />
        <XStack justifyContent="space-between" alignItems="center">
          <H3>Request a City</H3>
          <Button size="$3" circular icon={X} onPress={handleClose} chromeless />
        </XStack>

        {submitted ? (
          <YStack gap="$4" alignItems="center" paddingVertical="$6">
            <MapPin size={48} color="$green10" />
            <Text size="$5" fontWeight="600" textAlign="center">
              Thanks for your request!
            </Text>
            <Paragraph textAlign="center" theme="alt2">
              We'll review {cityName} and let you know when it's available.
            </Paragraph>
            <Button onPress={handleClose} theme="green">
              Done
            </Button>
          </YStack>
        ) : (
          <YStack gap="$4">
            <Paragraph theme="alt2">
              Don't see your city? Let us know where you'd like to see wellness practitioners.
            </Paragraph>

            <YStack gap="$2">
              <Text size="$2" fontWeight="600">City name</Text>
              <Input
                size="$4"
                placeholder="e.g. Barcelona"
                value={cityName}
                onChangeText={setCityName}
              />
            </YStack>

            <YStack gap="$2">
              <Text size="$2" fontWeight="600">Country</Text>
              <Input
                size="$4"
                placeholder="e.g. Spain"
                value={country}
                onChangeText={setCountry}
              />
            </YStack>

            {requestCityMutation.isError && (
              <Text color="$red10" size="$2">
                Failed to submit request. Please try again.
              </Text>
            )}

            <Button
              theme="green"
              disabled={!cityName.trim() || !country.trim() || requestCityMutation.isPending}
              onPress={handleSubmit}
            >
              {requestCityMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  )
}

export function CitySelectorScreen() {
  const { data: cities, isLoading, error } = api.cities.list.useQuery()
  const { city: currentCity, setCity } = useCity()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [requestSheetOpen, setRequestSheetOpen] = useState(false)

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
          Community Connection
        </H1>
        <Text size="$5" theme="alt2" textAlign="center">
          Book local wellness sessions & events
        </Text>
      </YStack>

      <YStack gap="$3" alignItems="center" width="100%" maxWidth={500} alignSelf="center">
        <Text size="$4" fontWeight="600">
          Choose your city
        </Text>

        <XStack
          width="100%"
          paddingHorizontal="$4"
          alignItems="center"
          gap="$2"
          backgroundColor="$background"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          paddingVertical="$2"
        >
          <Search size={20} color="$gray10" />
          <Input
            flex={1}
            size="$4"
            placeholder="Search cities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            borderWidth={0}
            backgroundColor="transparent"
          />
        </XStack>
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
            isCurrentCity={currentCity?.id === city.id}
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
        <YStack alignItems="center" padding="$8" gap="$4">
          <Text theme="alt2">No cities match "{searchQuery}"</Text>
          <Button
            icon={Plus}
            theme="green"
            onPress={() => setRequestSheetOpen(true)}
          >
            Request this city
          </Button>
        </YStack>
      )}

      {(!cities || cities.length === 0) && !searchQuery && (
        <YStack alignItems="center" padding="$8">
          <Text theme="alt2">No cities available yet</Text>
        </YStack>
      )}

      {/* Request City Button - always visible at bottom */}
      <YStack alignItems="center" paddingVertical="$4">
        <Button
          icon={Plus}
          variant="outlined"
          onPress={() => setRequestSheetOpen(true)}
        >
          Don't see your city? Request it
        </Button>
      </YStack>

      {/* Request City Sheet */}
      <RequestCitySheet
        open={requestSheetOpen}
        onOpenChange={setRequestSheetOpen}
        initialCityName={searchQuery}
      />
    </YStack>
  )
}
