import { useState } from 'react'
import {
  YStack,
  XStack,
  H1,
  H2,
  Text,
  Button,
  Spinner,
  Input,
  TextArea,
  Label,
  Select,
  Checkbox,
  Adapt,
  Sheet,
} from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { Check, ChevronDown } from '@tamagui/lucide-icons'

const SPECIALTIES = [
  'Yoga',
  'Meditation',
  'Breathwork',
  'Sound Healing',
  'Reiki',
  'Massage',
  'Cacao Ceremony',
  'Temazcal',
  'Holistic Therapy',
  'Energy Work',
]

export function PractitionerOnboardingScreen() {
  const router = useRouter()
  const utils = api.useUtils()

  // Form state
  const [cityId, setCityId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [error, setError] = useState('')

  // Queries
  const { data: cities, isLoading: citiesLoading } = api.cities.list.useQuery()
  const { data: existingProfile, isLoading: profileLoading } =
    api.practitioners.getMyProfile.useQuery()

  // Mutations
  const createMutation = api.practitioners.create.useMutation({
    onSuccess: () => {
      utils.practitioners.getMyProfile.invalidate()
      router.push('/practitioner/stripe-setup')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  // Auto-generate slug from business name
  const handleBusinessNameChange = (name: string) => {
    setBusinessName(name)
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
    setSlug(generatedSlug)
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : prev.length < 5
          ? [...prev, specialty]
          : prev
    )
  }

  const handleSubmit = () => {
    setError('')

    if (!cityId) {
      setError('Please select a city')
      return
    }
    if (!businessName.trim()) {
      setError('Please enter your business name')
      return
    }
    if (!slug.trim()) {
      setError('Please enter a URL slug')
      return
    }
    if (selectedSpecialties.length === 0) {
      setError('Please select at least one specialty')
      return
    }
    if (!contactEmail.trim()) {
      setError('Please enter your contact email')
      return
    }

    createMutation.mutate({
      cityId,
      businessName: businessName.trim(),
      slug: slug.trim(),
      bio: bio.trim() || undefined,
      specialties: selectedSpecialties,
      contactEmail: contactEmail.trim(),
      phone: phone.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      instagramHandle: instagramHandle.trim() || undefined,
    })
  }

  if (profileLoading || citiesLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  // Redirect if already has profile
  if (existingProfile) {
    router.push('/practitioner/dashboard')
    return null
  }

  return (
    <YStack flex={1} padding="$4" gap="$6" maxWidth={600} marginHorizontal="auto">
      <YStack gap="$2">
        <H1 size="$8">Become a Practitioner</H1>
        <Text theme="alt2">
          Create your profile to start offering sessions and events on Connect.
        </Text>
      </YStack>

      {error && (
        <YStack backgroundColor="$red2" padding="$3" borderRadius="$3">
          <Text color="$red10">{error}</Text>
        </YStack>
      )}

      {/* City Selection */}
      <YStack gap="$2">
        <Label htmlFor="city">City *</Label>
        <Select value={cityId} onValueChange={setCityId}>
          <Select.Trigger width="100%" iconAfter={ChevronDown}>
            <Select.Value placeholder="Select your city" />
          </Select.Trigger>

          <Adapt when="sm" platform="touch">
            <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay />
            </Sheet>
          </Adapt>

          <Select.Content>
            <Select.Viewport>
              {cities?.map((city, index) => (
                <Select.Item key={city.id} value={city.id} index={index}>
                  <Select.ItemText>
                    {city.name}, {city.country}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </YStack>

      {/* Business Name */}
      <YStack gap="$2">
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={businessName}
          onChangeText={handleBusinessNameChange}
          placeholder="Your business or practitioner name"
        />
      </YStack>

      {/* URL Slug */}
      <YStack gap="$2">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          value={slug}
          onChangeText={setSlug}
          placeholder="your-name"
          autoCapitalize="none"
        />
        <Text size="$2" theme="alt2">
          Your profile will be at: connect.app/city/{slug || 'your-slug'}
        </Text>
      </YStack>

      {/* Bio */}
      <YStack gap="$2">
        <Label htmlFor="bio">Bio</Label>
        <TextArea
          id="bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell people about yourself and your practice..."
          numberOfLines={4}
        />
      </YStack>

      {/* Specialties */}
      <YStack gap="$2">
        <Label>Specialties * (select up to 5)</Label>
        <XStack flexWrap="wrap" gap="$2">
          {SPECIALTIES.map((specialty) => (
            <Button
              key={specialty}
              size="$3"
              theme={selectedSpecialties.includes(specialty) ? 'active' : undefined}
              variant={selectedSpecialties.includes(specialty) ? undefined : 'outlined'}
              onPress={() => toggleSpecialty(specialty)}
            >
              {specialty}
            </Button>
          ))}
        </XStack>
      </YStack>

      {/* Contact Email */}
      <YStack gap="$2">
        <Label htmlFor="email">Contact Email *</Label>
        <Input
          id="email"
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </YStack>

      {/* Phone */}
      <YStack gap="$2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555 123 4567"
          keyboardType="phone-pad"
        />
      </YStack>

      {/* Website */}
      <YStack gap="$2">
        <Label htmlFor="website">Website (optional)</Label>
        <Input
          id="website"
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
          placeholder="https://yourwebsite.com"
          autoCapitalize="none"
        />
      </YStack>

      {/* Instagram */}
      <YStack gap="$2">
        <Label htmlFor="instagram">Instagram (optional)</Label>
        <Input
          id="instagram"
          value={instagramHandle}
          onChangeText={setInstagramHandle}
          placeholder="@yourhandle"
          autoCapitalize="none"
        />
      </YStack>

      {/* Submit */}
      <Button
        size="$5"
        theme="active"
        onPress={handleSubmit}
        disabled={createMutation.isPending}
        marginTop="$4"
      >
        {createMutation.isPending ? <Spinner /> : 'Create Profile & Continue'}
      </Button>

      <Text size="$2" theme="alt2" textAlign="center">
        Your profile will be reviewed by a city admin before becoming public.
      </Text>
    </YStack>
  )
}
