import { Paragraph, XStack, type XStackProps } from 'tamagui'

export type PriceDisplayProps = {
  amountCents: number
  currency: string
  originalAmountCents?: number
  size?: 'sm' | 'md' | 'lg'
  showCurrency?: boolean
} & XStackProps

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

const sizeMap = {
  sm: { main: '$3', original: '$2' },
  md: { main: '$5', original: '$3' },
  lg: { main: '$7', original: '$4' },
} as const

export const PriceDisplay = ({
  amountCents,
  currency,
  originalAmountCents,
  size = 'md',
  showCurrency = false,
  ...props
}: PriceDisplayProps) => {
  const hasDiscount = originalAmountCents && originalAmountCents > amountCents
  const discountPercent = hasDiscount
    ? Math.round((1 - amountCents / originalAmountCents) * 100)
    : 0

  const fontSize = sizeMap[size]

  return (
    <XStack ai="center" gap="$2" {...props}>
      <Paragraph fontWeight="700" fontSize={fontSize.main}>
        {formatPrice(amountCents, currency)}
      </Paragraph>

      {hasDiscount && (
        <>
          <Paragraph
            fontSize={fontSize.original}
            color="$gray9"
            textDecorationLine="line-through"
          >
            {formatPrice(originalAmountCents, currency)}
          </Paragraph>
          <Paragraph
            fontSize={fontSize.original}
            color="$green10"
            fontWeight="600"
          >
            -{discountPercent}%
          </Paragraph>
        </>
      )}

      {showCurrency && (
        <Paragraph fontSize={fontSize.original} color="$gray10">
          {currency.toUpperCase()}
        </Paragraph>
      )}
    </XStack>
  )
}
