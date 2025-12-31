import { BookingConfirmationScreen } from 'app/features/connect/booking'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ConfirmationPage() {
  const router = useRouter()
  const confirmationCode = router.query.code as string
  const email = router.query.email as string | undefined

  if (!confirmationCode) {
    return null
  }

  return (
    <>
      <Head>
        <title>Booking Confirmed | Connect</title>
      </Head>
      <BookingConfirmationScreen confirmationCode={confirmationCode} email={email} />
    </>
  )
}
