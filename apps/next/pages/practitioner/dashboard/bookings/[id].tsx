import { BookingDetailScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function BookingDetailPage() {
  const router = useRouter()
  const bookingId = router.query.id as string

  if (!bookingId) {
    return null
  }

  return (
    <>
      <Head>
        <title>Booking Details | Dashboard | Connect</title>
      </Head>
      <BookingDetailScreen bookingId={bookingId} />
    </>
  )
}
