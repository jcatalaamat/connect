import { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  H1,
  Text,
  Button,
  Spinner,
  Card,
  Input,
  TextArea,
  Label,
  Slider,
} from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { ArrowLeft, Save, Percent } from '@tamagui/lucide-icons'

export function AdminSettingsScreen({ citySlug }: { citySlug: string }) {
  const router = useRouter()
  const utils = api.useUtils()

  const [platformFeePercent, setPlatformFeePercent] = useState(10)
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get city
  const { data: city, isLoading } = api.cities.getBySlug.useQuery({ slug: citySlug })

  // Populate form
  useEffect(() => {
    if (city) {
      setPlatformFeePercent(city.platform_fee_percent || 10)
      setDescription(city.description || '')
      setCoverImageUrl(city.cover_image_url || '')
    }
  }, [city])

  // Update mutation
  const updateMutation = api.admin.updateCitySettings.useMutation({
    onSuccess: () => {
      utils.cities.getBySlug.invalidate({ slug: citySlug })
      setHasChanges(false)
      setError(null)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSave = () => {
    if (!city?.id) return

    updateMutation.mutate({
      cityId: city.id,
      platformFeePercent,
      description: description || undefined,
      coverImageUrl: coverImageUrl || undefined,
    })
  }

  const handleChange = () => {
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!city) {
    return (
      <YStack flex={1} padding="$4" gap="$4">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <Text>City not found</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button
          icon={ArrowLeft}
          circular
          variant="outlined"
          onPress={() => router.push(`/admin/${citySlug}`)}
        />
        <YStack flex={1}>
          <H1 size="$7">Settings</H1>
          <Text size="$2" theme="alt2">
            {city.name}
          </Text>
        </YStack>
      </XStack>

      {/* Error */}
      {error && (
        <Card bordered backgroundColor="$red2" padding="$3">
          <Text color="$red10">{error}</Text>
        </Card>
      )}

      {/* Platform Fee */}
      <Card bordered padding="$4">
        <YStack gap="$4">
          <XStack alignItems="center" gap="$2">
            <Percent size={20} color="$purple10" />
            <Text fontWeight="600" size="$5">
              Platform Fee
            </Text>
          </XStack>

          <Text theme="alt2">
            Percentage taken from each booking. Range: 5% - 15%
          </Text>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text size="$2" theme="alt2">
                Current: {platformFeePercent}%
              </Text>
              <Text size="$6" fontWeight="700">
                {platformFeePercent}%
              </Text>
            </XStack>

            <Slider
              value={[platformFeePercent]}
              min={5}
              max={15}
              step={0.5}
              onValueChange={(value) => {
                setPlatformFeePercent(value[0])
                handleChange()
              }}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb index={0} circular />
            </Slider>

            <XStack justifyContent="space-between">
              <Text size="$1" theme="alt2">
                5%
              </Text>
              <Text size="$1" theme="alt2">
                10%
              </Text>
              <Text size="$1" theme="alt2">
                15%
              </Text>
            </XStack>
          </YStack>

          <Card backgroundColor="$gray2" padding="$3">
            <Text size="$2">
              Example: For a $100 booking, you'll receive ${platformFeePercent.toFixed(2)} and the
              practitioner receives ${(100 - platformFeePercent).toFixed(2)}
            </Text>
          </Card>
        </YStack>
      </Card>

      {/* City Info */}
      <Card bordered padding="$4">
        <YStack gap="$4">
          <Text fontWeight="600" size="$5">
            City Information
          </Text>

          <YStack gap="$2">
            <Label size="$4">Name</Label>
            <Input size="$4" value={city.name} disabled />
            <Text size="$2" theme="alt2">
              City name cannot be changed
            </Text>
          </YStack>

          <YStack gap="$2">
            <Label size="$4">Slug</Label>
            <Input size="$4" value={city.slug} disabled />
            <Text size="$2" theme="alt2">
              URL path: /
              {city.slug}
            </Text>
          </YStack>

          <YStack gap="$2">
            <Label size="$4">Timezone</Label>
            <Input size="$4" value={city.timezone || 'Not set'} disabled />
          </YStack>

          <YStack gap="$2">
            <Label size="$4">Description</Label>
            <TextArea
              size="$4"
              placeholder="Describe your city..."
              value={description}
              onChangeText={(value) => {
                setDescription(value)
                handleChange()
              }}
              minHeight={100}
            />
          </YStack>

          <YStack gap="$2">
            <Label size="$4">Cover Image URL</Label>
            <Input
              size="$4"
              placeholder="https://..."
              value={coverImageUrl}
              onChangeText={(value) => {
                setCoverImageUrl(value)
                handleChange()
              }}
            />
            {coverImageUrl && (
              <Card overflow="hidden" borderRadius="$3">
                <img
                  src={coverImageUrl}
                  alt="City cover"
                  style={{ width: '100%', height: 150, objectFit: 'cover' }}
                />
              </Card>
            )}
          </YStack>
        </YStack>
      </Card>

      {/* Save Button */}
      <Button
        size="$5"
        theme="active"
        icon={Save}
        onPress={handleSave}
        disabled={!hasChanges || updateMutation.isPending}
      >
        {updateMutation.isPending ? <Spinner size="small" /> : 'Save Changes'}
      </Button>
    </YStack>
  )
}
