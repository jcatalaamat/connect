import { BookingFormScreen } from 'app/features/connect/booking'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function BookingPage() {
  const router = useRouter()
  const offeringId = router.query.offeringId as string
  const slotId = router.query.slotId as string | undefined
  const eventDateId = router.query.eventDateId as string | undefined

  if (!offeringId) {
    return null
  }

  return (
    <>
      <Head>
        <title>Book | Connect</title>
      </Head>
      <BookingFormScreen
        offeringId={offeringId}
        slotId={slotId}
        eventDateId={eventDateId}
      />
    </>
  )
}
