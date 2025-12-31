import { useState } from 'react'
import {
  YStack,
  XStack,
  H1,
  Text,
  Button,
  Spinner,
  Card,
  Paragraph,
  Avatar,
  Separator,
  TextArea,
  Label,
  Theme,
} from '@my/ui'
import { StatusBadge } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { api } from 'app/utils/api'
import {
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  User,
  Mail,
  Globe,
} from '@tamagui/lucide-icons'

type PractitionerStatus = 'pending' | 'approved' | 'suspended' | 'rejected'

const statusFilters: { value: PractitionerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
]

export function AdminPractitionersScreen({ citySlug }: { citySlug: string }) {
  const router = useRouter()
  const utils = api.useUtils()

  const [statusFilter, setStatusFilter] = useState<PractitionerStatus | 'all'>('pending')
  const [offset, setOffset] = useState(0)
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const limit = 20

  // Get city
  const { data: city } = api.cities.getBySlug.useQuery({ slug: citySlug })

  // Get practitioners
  const { data, isLoading, refetch } = api.admin.listPractitioners.useQuery(
    {
      cityId: city?.id || '',
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit,
      offset,
    },
    { enabled: !!city?.id }
  )

  const practitioners = data?.practitioners ?? []
  const total = data?.total ?? 0
  const hasMore = data?.hasMore ?? false

  // Mutations
  const approveMutation = api.admin.approvePractitioner.useMutation({
    onSuccess: () => {
      utils.admin.listPractitioners.invalidate()
      utils.admin.getCityStats.invalidate()
      setSelectedPractitioner(null)
    },
  })

  const rejectMutation = api.admin.rejectPractitioner.useMutation({
    onSuccess: () => {
      utils.admin.listPractitioners.invalidate()
      utils.admin.getCityStats.invalidate()
      setSelectedPractitioner(null)
      setRejectReason('')
    },
  })

  const suspendMutation = api.admin.suspendPractitioner.useMutation({
    onSuccess: () => {
      utils.admin.listPractitioners.invalidate()
      utils.admin.getCityStats.invalidate()
      setSelectedPractitioner(null)
      setSuspendReason('')
    },
  })

  const reinstateMutation = api.admin.reinstatePractitioner.useMutation({
    onSuccess: () => {
      utils.admin.listPractitioners.invalidate()
      utils.admin.getCityStats.invalidate()
      setSelectedPractitioner(null)
    },
  })

  const handleApprove = (practitionerId: string) => {
    if (!city?.id) return
    approveMutation.mutate({ cityId: city.id, practitionerId })
  }

  const handleReject = (practitionerId: string) => {
    if (!city?.id || !rejectReason.trim()) return
    rejectMutation.mutate({ cityId: city.id, practitionerId, reason: rejectReason.trim() })
  }

  const handleSuspend = (practitionerId: string) => {
    if (!city?.id || !suspendReason.trim()) return
    suspendMutation.mutate({ cityId: city.id, practitionerId, reason: suspendReason.trim() })
  }

  const handleReinstate = (practitionerId: string) => {
    if (!city?.id) return
    reinstateMutation.mutate({ cityId: city.id, practitionerId })
  }

  if (isLoading && offset === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$4" gap="$5">
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <Button
          icon={ArrowLeft}
          circular
          variant="outlined"
          onPress={() => router.push(`/admin/${citySlug}`)}
        />
        <YStack flex={1}>
          <H1 size="$7">Practitioners</H1>
          <Text size="$2" theme="alt2">
            {city?.name}
          </Text>
        </YStack>
      </XStack>

      {/* Status Filters */}
      <XStack gap="$2" flexWrap="wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            size="$3"
            borderRadius="$10"
            theme={statusFilter === filter.value ? 'active' : undefined}
            variant={statusFilter !== filter.value ? 'outlined' : undefined}
            onPress={() => {
              setStatusFilter(filter.value)
              setOffset(0)
            }}
          >
            {filter.label}
          </Button>
        ))}
      </XStack>

      {/* Results Count */}
      <Text size="$2" theme="alt2">
        {total} practitioner{total !== 1 ? 's' : ''}
      </Text>

      {/* Empty State */}
      {practitioners.length === 0 && (
        <Card bordered padding="$6" alignItems="center" gap="$4">
          <User size={48} color="$gray10" />
          <YStack alignItems="center" gap="$2">
            <Text size="$6" fontWeight="600">
              No practitioners found
            </Text>
            <Paragraph textAlign="center" theme="alt2">
              {statusFilter === 'pending'
                ? 'No practitioners awaiting approval'
                : `No ${statusFilter} practitioners`}
            </Paragraph>
          </YStack>
        </Card>
      )}

      {/* Practitioners List */}
      <YStack gap="$4">
        {practitioners.map((practitioner) => {
          const profile = practitioner.profiles as any
          const isSelected = selectedPractitioner === practitioner.id
          const status = practitioner.status as PractitionerStatus

          return (
            <Card key={practitioner.id} bordered padding="$4">
              <YStack gap="$4">
                {/* Header */}
                <XStack gap="$3" alignItems="flex-start">
                  <Avatar circular size="$5">
                    {practitioner.avatar_url ? (
                      <Avatar.Image src={practitioner.avatar_url} />
                    ) : (
                      <Avatar.Fallback backgroundColor="$blue10" jc="center" ai="center">
                        <Text color="white" fontWeight="600">
                          {practitioner.business_name.charAt(0)}
                        </Text>
                      </Avatar.Fallback>
                    )}
                  </Avatar>

                  <YStack flex={1} gap="$1">
                    <Text fontWeight="600" size="$5">
                      {practitioner.business_name}
                    </Text>
                    <Text size="$2" theme="alt2">
                      @{practitioner.slug}
                    </Text>

                    {practitioner.specialties && practitioner.specialties.length > 0 && (
                      <XStack gap="$1" flexWrap="wrap" marginTop="$1">
                        {practitioner.specialties.slice(0, 3).map((specialty) => (
                          <Theme key={specialty} name="blue">
                            <Button size="$1" px="$2" br="$10" disabled opacity={0.7}>
                              {specialty}
                            </Button>
                          </Theme>
                        ))}
                      </XStack>
                    )}
                  </YStack>

                  <StatusBadge status={status} type="practitioner" />
                </XStack>

                {/* Contact Info */}
                <XStack gap="$4" flexWrap="wrap">
                  {practitioner.contact_email && (
                    <XStack alignItems="center" gap="$2">
                      <Mail size={14} color="$gray10" />
                      <Text size="$2">{practitioner.contact_email}</Text>
                    </XStack>
                  )}
                  {practitioner.website_url && (
                    <XStack alignItems="center" gap="$2">
                      <Globe size={14} color="$gray10" />
                      <Text size="$2" color="$blue10">
                        {practitioner.website_url}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* Bio */}
                {practitioner.bio && (
                  <Paragraph size="$3" numberOfLines={2}>
                    {practitioner.bio}
                  </Paragraph>
                )}

                {/* Rejection Reason */}
                {status === 'rejected' && practitioner.rejection_reason && (
                  <Card backgroundColor="$red2" padding="$3">
                    <Text size="$2" color="$red11">
                      Rejection reason: {practitioner.rejection_reason}
                    </Text>
                  </Card>
                )}

                {/* Suspension Reason */}
                {status === 'suspended' && practitioner.rejection_reason && (
                  <Card backgroundColor="$orange2" padding="$3">
                    <Text size="$2" color="$orange11">
                      Suspension reason: {practitioner.rejection_reason}
                    </Text>
                  </Card>
                )}

                {/* Stripe Status */}
                <XStack gap="$2" alignItems="center">
                  <Text size="$2" theme="alt2">
                    Stripe:
                  </Text>
                  <Text
                    size="$2"
                    color={practitioner.stripe_charges_enabled ? '$green10' : '$yellow10'}
                  >
                    {practitioner.stripe_charges_enabled
                      ? 'Ready'
                      : practitioner.stripe_onboarding_complete
                        ? 'Verifying'
                        : 'Not connected'}
                  </Text>
                </XStack>

                <Separator />

                {/* Actions */}
                {!isSelected ? (
                  <XStack gap="$3" flexWrap="wrap">
                    {status === 'pending' && (
                      <>
                        <Button
                          icon={Check}
                          theme="green"
                          size="$3"
                          onPress={() => handleApprove(practitioner.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          icon={X}
                          theme="red"
                          variant="outlined"
                          size="$3"
                          onPress={() => setSelectedPractitioner(practitioner.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {status === 'approved' && (
                      <Button
                        icon={AlertTriangle}
                        theme="orange"
                        variant="outlined"
                        size="$3"
                        onPress={() => {
                          setSelectedPractitioner(practitioner.id)
                          setRejectReason('')
                        }}
                      >
                        Suspend
                      </Button>
                    )}

                    {status === 'suspended' && (
                      <Button
                        icon={RotateCcw}
                        theme="green"
                        size="$3"
                        onPress={() => handleReinstate(practitioner.id)}
                        disabled={reinstateMutation.isPending}
                      >
                        Reinstate
                      </Button>
                    )}

                    {status === 'rejected' && (
                      <Button
                        icon={Check}
                        theme="green"
                        size="$3"
                        onPress={() => handleApprove(practitioner.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                    )}
                  </XStack>
                ) : (
                  <Card backgroundColor="$gray2" padding="$4">
                    <YStack gap="$4">
                      <Label size="$3">
                        {status === 'pending' ? 'Rejection reason' : 'Suspension reason'}
                      </Label>
                      <TextArea
                        size="$3"
                        placeholder="Provide a reason..."
                        value={status === 'pending' ? rejectReason : suspendReason}
                        onChangeText={status === 'pending' ? setRejectReason : setSuspendReason}
                        minHeight={80}
                      />
                      <XStack gap="$3">
                        <Button
                          flex={1}
                          variant="outlined"
                          size="$3"
                          onPress={() => {
                            setSelectedPractitioner(null)
                            setRejectReason('')
                            setSuspendReason('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          flex={1}
                          theme="red"
                          size="$3"
                          onPress={() =>
                            status === 'pending'
                              ? handleReject(practitioner.id)
                              : handleSuspend(practitioner.id)
                          }
                          disabled={
                            (status === 'pending' ? !rejectReason.trim() : !suspendReason.trim()) ||
                            rejectMutation.isPending ||
                            suspendMutation.isPending
                          }
                        >
                          {rejectMutation.isPending || suspendMutation.isPending ? (
                            <Spinner size="small" />
                          ) : status === 'pending' ? (
                            'Reject'
                          ) : (
                            'Suspend'
                          )}
                        </Button>
                      </XStack>
                    </YStack>
                  </Card>
                )}
              </YStack>
            </Card>
          )
        })}
      </YStack>

      {/* Pagination */}
      {(offset > 0 || hasMore) && (
        <XStack gap="$3" justifyContent="center">
          <Button
            size="$3"
            variant="outlined"
            disabled={offset === 0 || isLoading}
            onPress={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            size="$3"
            variant="outlined"
            disabled={!hasMore || isLoading}
            onPress={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </XStack>
      )}
    </YStack>
  )
}
