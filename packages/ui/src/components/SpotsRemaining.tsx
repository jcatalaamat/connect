import { Paragraph, XStack, type XStackProps, Theme } from 'tamagui'

export type SpotsRemainingProps = {
  spotsRemaining: number
  totalCapacity?: number
  showProgress?: boolean
} & XStackProps

export const SpotsRemaining = ({
  spotsRemaining,
  totalCapacity,
  showProgress = false,
  ...props
}: SpotsRemainingProps) => {
  const isSoldOut = spotsRemaining === 0
  const isLowStock = spotsRemaining <= 3 && spotsRemaining > 0
  const percentage = totalCapacity ? (spotsRemaining / totalCapacity) * 100 : 100

  let themeName: 'red' | 'orange' | 'green' = 'green'
  if (isSoldOut) themeName = 'red'
  else if (isLowStock) themeName = 'orange'

  return (
    <Theme name={themeName}>
      <XStack ai="center" gap="$2" {...props}>
        {showProgress && totalCapacity && (
          <XStack
            width={60}
            height={4}
            backgroundColor="$gray4"
            borderRadius="$10"
            overflow="hidden"
          >
            <XStack
              width={`${percentage}%`}
              height="100%"
              backgroundColor="$color10"
            />
          </XStack>
        )}
        <Paragraph size="$2" fontWeight="600" color="$color10">
          {isSoldOut
            ? 'Sold Out'
            : isLowStock
            ? `Only ${spotsRemaining} spots left!`
            : `${spotsRemaining} spots available`}
        </Paragraph>
      </XStack>
    </Theme>
  )
}
