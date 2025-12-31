import { useState } from 'react'
import type { useLink } from 'solito/link'
import {
  Avatar,
  Button,
  Card,
  type CardProps,
  H5,
  Paragraph,
  XStack,
  YStack,
  Theme,
  type ThemeName,
} from 'tamagui'

export type PractitionerCardProps = {
  id: string
  businessName: string
  slug: string
  bio?: string | null
  avatarUrl?: string | null
  specialties?: string[]
  linkProps?: ReturnType<typeof useLink>
  onPress?: () => void
} & CardProps

export const PractitionerCard = ({
  businessName,
  bio,
  avatarUrl,
  specialties = [],
  linkProps,
  onPress,
  ...props
}: PractitionerCardProps) => {
  const [hover, setHover] = useState(false)

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
      {...linkProps}
      {...props}
    >
      <XStack gap="$4" ai="flex-start">
        <Avatar circular size="$6">
          {avatarUrl ? (
            <Avatar.Image src={avatarUrl} />
          ) : (
            <Avatar.Fallback
              backgroundColor="$blue10"
              jc="center"
              ai="center"
            >
              <Paragraph color="white" fontWeight="600" fontSize="$6">
                {businessName.charAt(0).toUpperCase()}
              </Paragraph>
            </Avatar.Fallback>
          )}
        </Avatar>

        <YStack f={1} gap="$2">
          <H5 size="$5">{businessName}</H5>

          {specialties.length > 0 && (
            <XStack gap="$1" flexWrap="wrap" marginHorizontal="$-1">
              {specialties.slice(0, 3).map((specialty) => (
                <Theme key={specialty} name="blue">
                  <Button size="$1" px="$2" br="$10" disabled opacity={0.8}>
                    {specialty}
                  </Button>
                </Theme>
              ))}
              {specialties.length > 3 && (
                <Button size="$1" px="$2" br="$10" disabled opacity={0.6}>
                  +{specialties.length - 3}
                </Button>
              )}
            </XStack>
          )}

          {bio && (
            <Paragraph size="$3" color="$gray11" numberOfLines={2}>
              {bio.length > 100 ? `${bio.slice(0, 100)}...` : bio}
            </Paragraph>
          )}
        </YStack>
      </XStack>
    </Card>
  )
}
