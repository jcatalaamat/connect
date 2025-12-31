import { OfferingFormScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function EditOfferingPage() {
  const router = useRouter()
  const offeringId = router.query.id as string

  if (!offeringId) {
    return null
  }

  return (
    <>
      <Head>
        <title>Edit Offering | Dashboard | Connect</title>
      </Head>
      <OfferingFormScreen offeringId={offeringId} />
    </>
  )
}
