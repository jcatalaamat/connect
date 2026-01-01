import { useState, useEffect } from 'react'
import { ScrollView } from 'react-native'
import { YStack, XStack, H1, H2, Text, Button, Spinner, Input, Select, Adapt, Sheet, Tabs } from '@my/ui'
import { PractitionerCard, OfferingCard } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { useCity } from 'app/provider/city'
import { Search, MapPin, ChevronDown, Check, Calendar, Briefcase, Users } from '@tamagui/lucide-icons'

type TabValue = 'events' | 'services' | 'practitioners'

export function BrowseScreen() {
  const router = useRouter()
  const { city, setCity } = useCity()
  const [activeTab, setActiveTab] = useState<TabValue>('events')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  // Get events for selected city
  const { data: eventsData, isLoading: eventsLoading } = api.offerings.listByCity.useQuery(
    {
      citySlug: city?.slug || '',
      type: 'event',
      category: selectedCategory || undefined,
      limit: 50,
    },
    { enabled: !!city?.slug }
  )

  // Get services (sessions) for selected city
  const { data: servicesData, isLoading: servicesLoading } = api.offerings.listByCity.useQuery(
    {
      citySlug: city?.slug || '',
      type: 'session',
      category: selectedCategory || undefined,
      limit: 50,
    },
    { enabled: !!city?.slug }
  )

  // Get specialties for filtering practitioners
  const { data: specialties } = api.practitioners.getSpecialties.useQuery()

  // Get categories for filtering events/services
  const { data: categories } = api.offerings.getCategories.useQuery()

  // Get practitioners for selected city
  const { data: practitionersData, isLoading: practitionersLoading } = api.practitioners.listByCity.useQuery(
    {
      citySlug: city?.slug || '',
      specialty: selectedSpecialty || undefined,
      limit: 50,
    },
    { enabled: !!city?.slug }
  )

  // Filter offerings by search query
  const filteredEvents = eventsData?.offerings?.filter((o) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      o.title.toLowerCase().includes(query) ||
      o.description?.toLowerCase().includes(query) ||
      (o.practitioners as any)?.business_name?.toLowerCase().includes(query)
    )
  })

  const filteredServices = servicesData?.offerings?.filter((o) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      o.title.toLowerCase().includes(query) ||
      o.description?.toLowerCase().includes(query) ||
      (o.practitioners as any)?.business_name?.toLowerCase().includes(query)
    )
  })

  const filteredPractitioners = practitionersData?.practitioners?.filter((p) => {
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

  const isLoading =
    (activeTab === 'events' && eventsLoading) ||
    (activeTab === 'services' && servicesLoading) ||
    (activeTab === 'practitioners' && practitionersLoading)

  if (!cities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  const searchPlaceholder =
    activeTab === 'events'
      ? 'Search events...'
      : activeTab === 'services'
        ? 'Search services...'
        : 'Search practitioners...'

  return (
    <YStack flex={1}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          {/* Header with City Selector */}
          <YStack gap="$3">
            <H1 size="$8">Browse</H1>

            {/* City Selector */}
            <XStack alignItems="center" gap="$2">
              <MapPin size={18} color="$blue10" />
              <Select value={city?.slug || ''} onValueChange={handleCityChange}>
                <Select.Trigger width={220} iconAfter={ChevronDown}>
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
                          <Select.ItemText>
                            {c.name}, {c.country}
                          </Select.ItemText>
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as TabValue)
              setSearchQuery('')
              setSelectedSpecialty(null)
              setSelectedCategory(null)
            }}
            orientation="horizontal"
            flexDirection="column"
          >
            <Tabs.List
              backgroundColor="$gray2"
              borderRadius="$4"
              padding="$1"
            >
              <Tabs.Tab flex={1} value="events" borderRadius="$3">
                <XStack alignItems="center" gap="$2">
                  <Calendar size={16} />
                  <Text>Events</Text>
                </XStack>
              </Tabs.Tab>
              <Tabs.Tab flex={1} value="services" borderRadius="$3">
                <XStack alignItems="center" gap="$2">
                  <Briefcase size={16} />
                  <Text>Services</Text>
                </XStack>
              </Tabs.Tab>
              <Tabs.Tab flex={1} value="practitioners" borderRadius="$3">
                <XStack alignItems="center" gap="$2">
                  <Users size={16} />
                  <Text>Practitioners</Text>
                </XStack>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Search */}
          <XStack
            alignItems="center"
            backgroundColor="$gray2"
            borderRadius="$3"
            paddingHorizontal="$3"
          >
            <Search size={18} color="$gray10" />
            <Input
              flex={1}
              size="$4"
              borderWidth={0}
              backgroundColor="transparent"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </XStack>

          {/* Category Filters - for events and services tabs */}
          {(activeTab === 'events' || activeTab === 'services') && categories && categories.length > 0 && (
            <XStack gap="$2" flexWrap="wrap">
              <Button
                size="$2"
                borderRadius="$10"
                theme={!selectedCategory ? 'active' : undefined}
                variant={selectedCategory ? 'outlined' : undefined}
                onPress={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="$2"
                  borderRadius="$10"
                  theme={selectedCategory === category ? 'active' : undefined}
                  variant={selectedCategory !== category ? 'outlined' : undefined}
                  onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
                >
                  {category}
                </Button>
              ))}
            </XStack>
          )}

          {/* Specialty Filters - only for practitioners tab */}
          {activeTab === 'practitioners' && specialties && specialties.length > 0 && (
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
            <YStack padding="$8" justifyContent="center" alignItems="center">
              <Spinner size="large" />
            </YStack>
          )}

          {/* Events Tab Content */}
          {activeTab === 'events' && !eventsLoading && (
            <YStack gap="$3">
              {filteredEvents && filteredEvents.length > 0 ? (
                <>
                  <Text size="$2" theme="alt2">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                  </Text>
                  {filteredEvents.map((offering) => (
                    <YStack key={offering.id} gap="$1">
                      <OfferingCard
                        id={offering.id}
                        type={offering.type as 'session' | 'event'}
                        title={offering.title}
                        description={offering.description}
                        priceCents={offering.price_cents}
                        currency={offering.currency}
                        durationMinutes={offering.duration_minutes}
                        capacity={offering.capacity}
                        locationType={offering.location_type as 'in_person' | 'virtual' | 'hybrid'}
                        coverImageUrl={offering.cover_image_url}
                        category={offering.category}
                        onPress={() => router.push(`/book/${offering.id}`)}
                      />
                      <Text size="$1" theme="alt2" paddingLeft="$2">
                        by {(offering.practitioners as any)?.business_name}
                      </Text>
                    </YStack>
                  ))}
                </>
              ) : (
                <YStack padding="$8" justifyContent="center" alignItems="center" gap="$4">
                  <Calendar size={48} color="$gray8" />
                  <Text size="$6" fontWeight="600">
                    No events found
                  </Text>
                  <Text textAlign="center" theme="alt2">
                    {searchQuery || selectedCategory
                      ? 'Try adjusting your search or filters'
                      : 'No events are scheduled in this area yet'}
                  </Text>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="outlined"
                      onPress={() => {
                        setSearchQuery('')
                        setSelectedCategory(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </YStack>
              )}
            </YStack>
          )}

          {/* Services Tab Content */}
          {activeTab === 'services' && !servicesLoading && (
            <YStack gap="$3">
              {filteredServices && filteredServices.length > 0 ? (
                <>
                  <Text size="$2" theme="alt2">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                  </Text>
                  {filteredServices.map((offering) => (
                    <YStack key={offering.id} gap="$1">
                      <OfferingCard
                        id={offering.id}
                        type={offering.type as 'session' | 'event'}
                        title={offering.title}
                        description={offering.description}
                        priceCents={offering.price_cents}
                        currency={offering.currency}
                        durationMinutes={offering.duration_minutes}
                        capacity={offering.capacity}
                        locationType={offering.location_type as 'in_person' | 'virtual' | 'hybrid'}
                        coverImageUrl={offering.cover_image_url}
                        category={offering.category}
                        onPress={() => router.push(`/book/${offering.id}`)}
                      />
                      <Text size="$1" theme="alt2" paddingLeft="$2">
                        by {(offering.practitioners as any)?.business_name}
                      </Text>
                    </YStack>
                  ))}
                </>
              ) : (
                <YStack padding="$8" justifyContent="center" alignItems="center" gap="$4">
                  <Briefcase size={48} color="$gray8" />
                  <Text size="$6" fontWeight="600">
                    No services found
                  </Text>
                  <Text textAlign="center" theme="alt2">
                    {searchQuery || selectedCategory
                      ? 'Try adjusting your search or filters'
                      : 'No services are available in this area yet'}
                  </Text>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="outlined"
                      onPress={() => {
                        setSearchQuery('')
                        setSelectedCategory(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </YStack>
              )}
            </YStack>
          )}

          {/* Practitioners Tab Content */}
          {activeTab === 'practitioners' && !practitionersLoading && (
            <YStack gap="$3">
              {filteredPractitioners && filteredPractitioners.length > 0 ? (
                <>
                  <Text size="$2" theme="alt2">
                    {filteredPractitioners.length} practitioner
                    {filteredPractitioners.length !== 1 ? 's' : ''}
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
                </>
              ) : (
                <YStack padding="$8" justifyContent="center" alignItems="center" gap="$4">
                  <Users size={48} color="$gray8" />
                  <Text size="$6" fontWeight="600">
                    No practitioners found
                  </Text>
                  <Text textAlign="center" theme="alt2">
                    {searchQuery || selectedSpecialty
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
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
