import { Button, type ButtonProps, Theme, type ThemeName } from 'tamagui'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed' | 'no_show'
type PractitionerStatus = 'pending' | 'approved' | 'suspended' | 'rejected'

export type StatusBadgeProps = {
  status: BookingStatus | PractitionerStatus
  type?: 'booking' | 'practitioner'
  size?: 'sm' | 'md'
} & Omit<ButtonProps, 'size'>

const bookingStatusConfig: Record<BookingStatus, { theme: ThemeName; label: string }> = {
  pending: { theme: 'yellow', label: 'Pending' },
  confirmed: { theme: 'green', label: 'Confirmed' },
  cancelled: { theme: 'red', label: 'Cancelled' },
  refunded: { theme: 'gray', label: 'Refunded' },
  completed: { theme: 'blue', label: 'Completed' },
  no_show: { theme: 'orange', label: 'No Show' },
}

const practitionerStatusConfig: Record<PractitionerStatus, { theme: ThemeName; label: string }> = {
  pending: { theme: 'yellow', label: 'Pending Approval' },
  approved: { theme: 'green', label: 'Approved' },
  suspended: { theme: 'orange', label: 'Suspended' },
  rejected: { theme: 'red', label: 'Rejected' },
}

export const StatusBadge = ({
  status,
  type = 'booking',
  size = 'md',
  ...props
}: StatusBadgeProps) => {
  const config =
    type === 'booking'
      ? bookingStatusConfig[status as BookingStatus]
      : practitionerStatusConfig[status as PractitionerStatus]

  const buttonSize = size === 'sm' ? '$1' : '$2'
  const px = size === 'sm' ? '$2' : '$3'

  return (
    <Theme name={config.theme}>
      <Button size={buttonSize} px={px} br="$10" disabled {...props}>
        {config.label}
      </Button>
    </Theme>
  )
}
