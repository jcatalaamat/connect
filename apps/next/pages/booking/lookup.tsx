import { BookingLookupScreen } from 'app/features/connect/booking'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function LookupPage() {
  const router = useRouter()
  const initialCode = router.query.code as string | undefined

  return (
    <>
      <Head>
        <title>Find Booking | Connect</title>
      </Head>
      <BookingLookupScreen initialCode={initialCode} />
    </>
  )
}
