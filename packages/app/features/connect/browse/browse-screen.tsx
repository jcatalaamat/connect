import { useState, useEffect } from 'react'
import { YStack, XStack, H1, Text, Button, Spinner, Input, Select, Adapt, Sheet } from '@my/ui'
import { PractitionerCard } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { Search, MapPin, ChevronDown, Check } from '@tamagui/lucide-icons'

export function BrowseScreen() {
  const router = useRouter()
  const { city, setCity } = useCity()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  // Get all cities for dropdown
  const { data: cities } = api.cities.list.useQuery()

  // Auto-select first city if none selected
  useEffect(() => {
    if (!city && cities && cities.length > 0) {
      setCity({
        id: cities[0].id,
        slug: cities[0].slug,
        name: cities[0].name,
        country: cities[0].country,
      })
    }
  }, [cities, city, setCity])

  // Get specialties for filtering
  const { data: specialties } = api.practitioners.getSpecialties.useQuery()

  // Get practitioners for selected city
  const { data, isLoading } = api.practitioners.listByCity.useQuery(
    {
      citySlug: city?.slug || '',
      specialty: selectedSpecialty || undefined,
      limit: 50,
    },
    { enabled: !!city?.slug }
  )
  const practitioners = data?.practitioners

  // Filter by search query (client-side for instant feedback)
  const filteredPractitioners = practitioners?.filter((p) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.business_name.toLowerCase().includes(query) ||
      p.bio?.toLowerCase().includes(query) ||
      p.specialties?.some((s) => s.toLowerCase().includes(query))
    )
  })

  const handleCityChange = (citySlug: string) => {
    const selectedCity = cities?.find((c) => c.slug === citySlug)
    if (selectedCity) {
      setCity({
        id: selectedCity.id,
        slug: selectedCity.slug,
        name: selectedCity.name,
        country: selectedCity.country,
      })
    }
  }

  if (!cities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$5">
      {/* Header with City Selector */}
      <YStack gap="$3">
        <H1 size="$8">Browse Practitioners</H1>

        {/* City Selector */}
        <XStack alignItems="center" gap="$2">
          <MapPin size={18} color="$blue10" />
          <Select value={city?.slug || ''} onValueChange={handleCityChange}>
            <Select.Trigger width={200} iconAfter={ChevronDown}>
              <Select.Value placeholder="Select city" />
            </Select.Trigger>

            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom snapPoints={[50]}>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>

            <Select.Content zIndex={200000}>
              <Select.Viewport>
                <Select.Group>
                  <Select.Label>Cities</Select.Label>
                  {cities.map((c, i) => (
                    <Select.Item key={c.id} index={i} value={c.slug}>
                      <Select.ItemText>{c.name}, {c.country}</Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>
        </XStack>
      </YStack>

      {/* Search */}
      <XStack gap="$3">
        <XStack flex={1} alignItems="center" backgroundColor="$gray2" borderRadius="$3" paddingHorizontal="$3">
          <Search size={18} color="$gray10" />
          <Input
            flex={1}
            size="$4"
            borderWidth={0}
            backgroundColor="transparent"
            placeholder="Search practitioners..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </XStack>
      </XStack>

      {/* Specialty Filters */}
      {specialties && specialties.length > 0 && (
        <XStack gap="$2" flexWrap="wrap">
          <Button
            size="$2"
            borderRadius="$10"
            theme={!selectedSpecialty ? 'active' : undefined}
            variant={selectedSpecialty ? 'outlined' : undefined}
            onPress={() => setSelectedSpecialty(null)}
          >
            All
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              size="$2"
              borderRadius="$10"
              theme={selectedSpecialty === specialty ? 'active' : undefined}
              variant={selectedSpecialty !== specialty ? 'outlined' : undefined}
              onPress={() => setSelectedSpecialty(specialty === selectedSpecialty ? null : specialty)}
            >
              {specialty}
            </Button>
          ))}
        </XStack>
      )}

      {/* Loading */}
      {isLoading && (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      )}

      {/* Results */}
      {!isLoading && filteredPractitioners && filteredPractitioners.length === 0 && (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text size="$6" fontWeight="600">No practitioners found</Text>
          <Text textAlign="center" theme="alt2">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'No practitioners are available in this area yet'}
          </Text>
          {(searchQuery || selectedSpecialty) && (
            <Button
              variant="outlined"
              onPress={() => {
                setSearchQuery('')
                setSelectedSpecialty(null)
              }}
            >
              Clear Filters
            </Button>
          )}
        </YStack>
      )}

      {!isLoading && filteredPractitioners && filteredPractitioners.length > 0 && (
        <YStack gap="$3">
          <Text size="$2" theme="alt2">
            {filteredPractitioners.length} practitioner{filteredPractitioners.length !== 1 ? 's' : ''}
          </Text>
          {filteredPractitioners.map((practitioner) => (
            <PractitionerCard
              key={practitioner.id}
              id={practitioner.id}
              businessName={practitioner.business_name}
              slug={practitioner.slug}
              bio={practitioner.bio}
              avatarUrl={practitioner.avatar_url}
              specialties={practitioner.specialties}
              onPress={() => router.push(`/${city?.slug}/${practitioner.slug}`)}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
