import { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  H1,
  H2,
  Text,
  Button,
  Spinner,
  Card,
  Input,
  TextArea,
  Label,
  RadioGroup,
  Separator,
  Switch,
} from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import { ArrowLeft, Save, Trash2 } from '@tamagui/lucide-icons'

type OfferingType = 'session' | 'event'
type LocationType = 'in_person' | 'virtual' | 'hybrid'

type FormData = {
  type: OfferingType
  title: string
  description: string
  priceCents: number
  currency: string
  durationMinutes: number
  capacity: number
  locationType: LocationType
  locationAddress: string
  locationNotes: string
  virtualLink: string
  depositRequired: boolean
  depositPercent: number
  isActive: boolean
}

const defaultFormData: FormData = {
  type: 'session',
  title: '',
  description: '',
  priceCents: 0,
  currency: 'USD',
  durationMinutes: 60,
  capacity: 10,
  locationType: 'in_person',
  locationAddress: '',
  locationNotes: '',
  virtualLink: '',
  depositRequired: false,
  depositPercent: 50,
  isActive: true,
}

export function OfferingFormScreen({ offeringId }: { offeringId?: string }) {
  const router = useRouter()
  const isEditing = !!offeringId

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [priceInput, setPriceInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch existing offering if editing
  const { data: existingOffering, isLoading: loadingOffering } = api.offerings.getById.useQuery(
    { id: offeringId! },
    { enabled: isEditing }
  )

  // Mutations
  const createMutation = api.offerings.create.useMutation({
    onSuccess: (data) => {
      router.push(`/practitioner/dashboard/offerings/${data.id}`)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const updateMutation = api.offerings.update.useMutation({
    onSuccess: () => {
      router.back()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const deleteMutation = api.offerings.delete.useMutation({
    onSuccess: () => {
      router.push('/practitioner/dashboard/offerings')
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingOffering) {
      setFormData({
        type: existingOffering.type as OfferingType,
        title: existingOffering.title,
        description: existingOffering.description || '',
        priceCents: existingOffering.price_cents,
        currency: existingOffering.currency,
        durationMinutes: existingOffering.duration_minutes || 60,
        capacity: existingOffering.capacity || 10,
        locationType: existingOffering.location_type as LocationType,
        locationAddress: existingOffering.location_address || '',
        locationNotes: existingOffering.location_notes || '',
        virtualLink: existingOffering.virtual_link || '',
        depositRequired: existingOffering.deposit_required || false,
        depositPercent: existingOffering.deposit_percent || 50,
        isActive: existingOffering.is_active,
      })
      setPriceInput((existingOffering.price_cents / 100).toString())
    }
  }, [existingOffering])

  const handlePriceChange = (value: string) => {
    setPriceInput(value)
    const cents = Math.round(parseFloat(value || '0') * 100)
    setFormData((prev) => ({ ...prev, priceCents: isNaN(cents) ? 0 : cents }))
  }

  const handleSubmit = () => {
    setError(null)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (formData.priceCents < 0) {
      setError('Price must be 0 or greater')
      return
    }

    if (formData.type === 'session' && formData.durationMinutes < 15) {
      setError('Session duration must be at least 15 minutes')
      return
    }

    if (formData.type === 'event' && formData.capacity < 1) {
      setError('Event capacity must be at least 1')
      return
    }

    const payload = {
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      priceCents: formData.priceCents,
      currency: formData.currency,
      durationMinutes: formData.type === 'session' ? formData.durationMinutes : undefined,
      capacity: formData.type === 'event' ? formData.capacity : undefined,
      locationType: formData.locationType,
      locationAddress: formData.locationAddress || undefined,
      locationNotes: formData.locationNotes || undefined,
      virtualLink: formData.virtualLink || undefined,
      depositRequired: formData.depositRequired,
      depositPercent: formData.depositRequired ? formData.depositPercent : 0,
    }

    if (isEditing) {
      updateMutation.mutate({
        id: offeringId!,
        ...payload,
        isActive: formData.isActive,
      })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this offering? This cannot be undone.')) {
      deleteMutation.mutate({ id: offeringId! })
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  if (isEditing && loadingOffering) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$6">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button icon={ArrowLeft} circular variant="outlined" onPress={() => router.back()} />
        <H1 size="$8">{isEditing ? 'Edit Offering' : 'New Offering'}</H1>
      </XStack>

      {/* Error Display */}
      {error && (
        <Card bordered backgroundColor="$red2" padding="$3">
          <Text color="$red10">{error}</Text>
        </Card>
      )}

      {/* Form */}
      <YStack gap="$5">
        {/* Type Selection (only for new) */}
        {!isEditing && (
          <YStack gap="$3">
            <Label size="$4" fontWeight="600">Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as OfferingType }))}
            >
              <XStack gap="$4">
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value="session" id="session">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="session">1:1 Session</Label>
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value="event" id="event">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="event">Event / Ceremony</Label>
                </XStack>
              </XStack>
            </RadioGroup>
          </YStack>
        )}

        <Separator />

        {/* Basic Info */}
        <H2 size="$5">Basic Information</H2>

        <YStack gap="$2">
          <Label size="$4">Title *</Label>
          <Input
            size="$4"
            placeholder={formData.type === 'session' ? 'e.g., Private Yoga Session' : 'e.g., Full Moon Cacao Ceremony'}
            value={formData.title}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, title: value }))}
          />
        </YStack>

        <YStack gap="$2">
          <Label size="$4">Description</Label>
          <TextArea
            size="$4"
            placeholder="Describe your offering..."
            value={formData.description}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, description: value }))}
            minHeight={120}
          />
        </YStack>

        <XStack gap="$4">
          <YStack gap="$2" flex={1}>
            <Label size="$4">Price ($) *</Label>
            <Input
              size="$4"
              keyboardType="decimal-pad"
              placeholder="0.00"
              value={priceInput}
              onChangeText={handlePriceChange}
            />
          </YStack>

          {formData.type === 'session' && (
            <YStack gap="$2" flex={1}>
              <Label size="$4">Duration (minutes) *</Label>
              <Input
                size="$4"
                keyboardType="number-pad"
                placeholder="60"
                value={formData.durationMinutes.toString()}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, durationMinutes: parseInt(value) || 0 }))
                }
              />
            </YStack>
          )}

          {formData.type === 'event' && (
            <YStack gap="$2" flex={1}>
              <Label size="$4">Capacity *</Label>
              <Input
                size="$4"
                keyboardType="number-pad"
                placeholder="10"
                value={formData.capacity.toString()}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, capacity: parseInt(value) || 0 }))
                }
              />
            </YStack>
          )}
        </XStack>

        <Separator />

        {/* Location */}
        <H2 size="$5">Location</H2>

        <YStack gap="$3">
          <Label size="$4">Location Type</Label>
          <RadioGroup
            value={formData.locationType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, locationType: value as LocationType }))
            }
          >
            <XStack gap="$4" flexWrap="wrap">
              <XStack alignItems="center" gap="$2">
                <RadioGroup.Item value="in_person" id="in_person">
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="in_person">In Person</Label>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <RadioGroup.Item value="virtual" id="virtual">
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="virtual">Virtual</Label>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <RadioGroup.Item value="hybrid" id="hybrid">
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="hybrid">Hybrid</Label>
              </XStack>
            </XStack>
          </RadioGroup>
        </YStack>

        {(formData.locationType === 'in_person' || formData.locationType === 'hybrid') && (
          <>
            <YStack gap="$2">
              <Label size="$4">Address</Label>
              <Input
                size="$4"
                placeholder="Enter the address"
                value={formData.locationAddress}
                onChangeText={(value) => setFormData((prev) => ({ ...prev, locationAddress: value }))}
              />
            </YStack>

            <YStack gap="$2">
              <Label size="$4">Location Notes</Label>
              <Input
                size="$4"
                placeholder="e.g., Look for the blue door, parking available"
                value={formData.locationNotes}
                onChangeText={(value) => setFormData((prev) => ({ ...prev, locationNotes: value }))}
              />
            </YStack>
          </>
        )}

        {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
          <YStack gap="$2">
            <Label size="$4">Virtual Meeting Link</Label>
            <Input
              size="$4"
              placeholder="https://zoom.us/..."
              value={formData.virtualLink}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, virtualLink: value }))}
            />
          </YStack>
        )}

        <Separator />

        {/* Deposit Settings */}
        <H2 size="$5">Payment Settings</H2>

        <XStack alignItems="center" justifyContent="space-between">
          <YStack>
            <Text fontWeight="600">Require Deposit</Text>
            <Text size="$2" theme="alt2">
              Only charge a percentage upfront
            </Text>
          </YStack>
          <Switch
            checked={formData.depositRequired}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, depositRequired: checked }))
            }
          >
            <Switch.Thumb animation="quick" />
          </Switch>
        </XStack>

        {formData.depositRequired && (
          <YStack gap="$2">
            <Label size="$4">Deposit Percentage</Label>
            <Input
              size="$4"
              keyboardType="number-pad"
              placeholder="50"
              value={formData.depositPercent.toString()}
              onChangeText={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  depositPercent: Math.min(100, Math.max(0, parseInt(value) || 0)),
                }))
              }
            />
            <Text size="$2" theme="alt2">
              Customer pays ${((formData.priceCents * formData.depositPercent) / 100 / 100).toFixed(2)} upfront
            </Text>
          </YStack>
        )}

        {/* Active Status (only for editing) */}
        {isEditing && (
          <>
            <Separator />

            <XStack alignItems="center" justifyContent="space-between">
              <YStack>
                <Text fontWeight="600">Active</Text>
                <Text size="$2" theme="alt2">
                  When inactive, this offering won't be visible to customers
                </Text>
              </YStack>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </XStack>
          </>
        )}
      </YStack>

      {/* Actions */}
      <XStack gap="$3" justifyContent="space-between" marginTop="$4">
        {isEditing && (
          <Button
            icon={Trash2}
            theme="red"
            variant="outlined"
            onPress={handleDelete}
            disabled={isMutating}
          >
            Delete
          </Button>
        )}

        <XStack gap="$3" flex={1} justifyContent="flex-end">
          <Button variant="outlined" onPress={() => router.back()} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            icon={Save}
            theme="active"
            onPress={handleSubmit}
            disabled={isMutating}
          >
            {isMutating ? <Spinner size="small" /> : isEditing ? 'Save Changes' : 'Create Offering'}
          </Button>
        </XStack>
      </XStack>
    </YStack>
  )
}
