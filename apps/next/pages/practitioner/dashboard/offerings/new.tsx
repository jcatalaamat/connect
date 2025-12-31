import { OfferingFormScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'

export default function NewOfferingPage() {
  return (
    <>
      <Head>
        <title>New Offering | Dashboard | Connect</title>
      </Head>
      <OfferingFormScreen />
    </>
  )
}
