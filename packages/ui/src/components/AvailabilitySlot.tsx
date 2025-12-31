import { useState } from 'react'
import { Button, type ButtonProps, Paragraph, XStack } from 'tamagui'

export type AvailabilitySlotProps = {
  id: string
  startTime: string
  endTime: string
  isBooked?: boolean
  isSelected?: boolean
  onSelect?: (id: string) => void
  timezone?: string
} & Omit<ButtonProps, 'onPress'>

function formatTime(dateString: string, timezone?: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true,
  })
}

function formatDate(dateString: string, timezone?: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
}

export const AvailabilitySlot = ({
  id,
  startTime,
  endTime,
  isBooked = false,
  isSelected = false,
  onSelect,
  timezone,
  ...props
}: AvailabilitySlotProps) => {
  const [hover, setHover] = useState(false)

  const handlePress = () => {
    if (!isBooked && onSelect) {
      onSelect(id)
    }
  }

  return (
    <Button
      size="$4"
      borderRadius="$3"
      disabled={isBooked}
      opacity={isBooked ? 0.5 : 1}
      backgroundColor={isSelected ? '$blue10' : hover ? '$gray4' : '$gray2'}
      borderWidth={2}
      borderColor={isSelected ? '$blue10' : 'transparent'}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={handlePress}
      {...props}
    >
      <XStack gap="$2" ai="center">
        <Paragraph
          size="$3"
          fontWeight="600"
          color={isSelected ? 'white' : isBooked ? '$gray9' : '$color'}
        >
          {formatDate(startTime, timezone)}
        </Paragraph>
        <Paragraph
          size="$2"
          color={isSelected ? 'white' : isBooked ? '$gray9' : '$gray11'}
        >
          {formatTime(startTime, timezone)} - {formatTime(endTime, timezone)}
        </Paragraph>
      </XStack>
    </Button>
  )
}
