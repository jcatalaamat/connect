import { BookingsScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'

export default function BookingsPage() {
  return (
    <>
      <Head>
        <title>Bookings | Dashboard | Connect</title>
      </Head>
      <BookingsScreen />
    </>
  )
}
