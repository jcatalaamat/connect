import { useState } from 'react'
import { YStack, XStack, H1, Text, Button, Spinner, Input, Paragraph } from '@my/ui'
import { PractitionerCard } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Search, Filter, MapPin } from '@tamagui/lucide-icons'

export function PractitionerListScreen({ citySlug }: { citySlug: string }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  // Get city info
  const { data: city } = api.cities.getBySlug.useQuery({ slug: citySlug })

  // Get specialties for filtering
  const { data: specialties } = api.practitioners.getSpecialties.useQuery()

  // Get practitioners
  const { data, isLoading } = api.practitioners.listByCity.useQuery(
    {
      citySlug,
      specialty: selectedSpecialty || undefined,
      limit: 50,
    },
    { enabled: !!citySlug }
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

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$5">
      {/* Header */}
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2">
          <MapPin size={20} color="$blue10" />
          <Text size="$3" color="$blue10" fontWeight="600">
            {city?.name || citySlug}
          </Text>
        </XStack>
        <H1 size="$8">Practitioners</H1>
        <Paragraph theme="alt2">
          Discover wellness practitioners in {city?.name || 'your area'}
        </Paragraph>
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

      {/* Results */}
      {filteredPractitioners && filteredPractitioners.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text size="$6" fontWeight="600">No practitioners found</Text>
          <Paragraph textAlign="center" theme="alt2">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'No practitioners are available in this area yet'}
          </Paragraph>
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
      ) : (
        <YStack gap="$3">
          <Text size="$2" theme="alt2">
            {filteredPractitioners?.length} practitioner{filteredPractitioners?.length !== 1 ? 's' : ''}
          </Text>
          {filteredPractitioners?.map((practitioner) => (
            <PractitionerCard
              key={practitioner.id}
              id={practitioner.id}
              businessName={practitioner.business_name}
              slug={practitioner.slug}
              bio={practitioner.bio}
              avatarUrl={practitioner.avatar_url}
              specialties={practitioner.specialties}
              onPress={() => router.push(`/${citySlug}/${practitioner.slug}`)}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
