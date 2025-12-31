import { useState } from 'react'
import type { useLink } from 'solito/link'
import {
  Button,
  Card,
  type CardProps,
  H5,
  Paragraph,
  XStack,
  YStack,
  Theme,
} from 'tamagui'

export type OfferingCardProps = {
  id: string
  type: 'session' | 'event'
  title: string
  description?: string | null
  priceCents: number
  currency: string
  durationMinutes?: number | null
  capacity?: number | null
  locationType: 'in_person' | 'virtual' | 'hybrid'
  coverImageUrl?: string | null
  isActive?: boolean
  linkProps?: ReturnType<typeof useLink>
  onPress?: () => void
} & CardProps

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export const OfferingCard = ({
  type,
  title,
  description,
  priceCents,
  currency,
  durationMinutes,
  capacity,
  locationType,
  isActive = true,
  linkProps,
  onPress,
  ...props
}: OfferingCardProps) => {
  const [hover, setHover] = useState(false)

  const locationLabel = {
    in_person: 'In Person',
    virtual: 'Virtual',
    hybrid: 'Hybrid',
  }[locationType]

  return (
    <Card
      cursor="pointer"
      gap="$3"
      p="$4"
      borderRadius="$4"
      chromeless={!hover}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={onPress}
      opacity={isActive ? 1 : 0.6}
      {...linkProps}
      {...props}
    >
      <YStack gap="$3">
        <XStack jc="space-between" ai="flex-start">
          <YStack f={1} gap="$1">
            <XStack gap="$2" ai="center">
              <Theme name={type === 'session' ? 'green' : 'purple'}>
                <Button size="$1" px="$2" br="$10" disabled>
                  {type === 'session' ? '1:1 Session' : 'Event'}
                </Button>
              </Theme>
              {!isActive && (
                <Theme name="gray">
                  <Button size="$1" px="$2" br="$10" disabled>
                    Inactive
                  </Button>
                </Theme>
              )}
            </XStack>
            <H5 size="$5" mt="$2">{title}</H5>
          </YStack>

          <YStack ai="flex-end">
            <Paragraph fontWeight="700" fontSize="$6" color="$color">
              {formatPrice(priceCents, currency)}
            </Paragraph>
          </YStack>
        </XStack>

        {description && (
          <Paragraph size="$3" color="$gray11" numberOfLines={2}>
            {description.length > 120 ? `${description.slice(0, 120)}...` : description}
          </Paragraph>
        )}

        <XStack gap="$3" flexWrap="wrap">
          {type === 'session' && durationMinutes && (
            <XStack ai="center" gap="$1">
              <Paragraph size="$2" color="$gray10">Duration:</Paragraph>
              <Paragraph size="$2" fontWeight="600">{formatDuration(durationMinutes)}</Paragraph>
            </XStack>
          )}
          {type === 'event' && capacity && (
            <XStack ai="center" gap="$1">
              <Paragraph size="$2" color="$gray10">Capacity:</Paragraph>
              <Paragraph size="$2" fontWeight="600">{capacity} spots</Paragraph>
            </XStack>
          )}
          <XStack ai="center" gap="$1">
            <Paragraph size="$2" color="$gray10">Location:</Paragraph>
            <Paragraph size="$2" fontWeight="600">{locationLabel}</Paragraph>
          </XStack>
        </XStack>
      </YStack>
    </Card>
  )
}
