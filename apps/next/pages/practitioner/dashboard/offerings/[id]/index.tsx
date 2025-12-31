import { OfferingDetailScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function OfferingDetailPage() {
  const router = useRouter()
  const offeringId = router.query.id as string

  if (!offeringId) {
    return null
  }

  return (
    <>
      <Head>
        <title>Offering Details | Dashboard | Connect</title>
      </Head>
      <OfferingDetailScreen offeringId={offeringId} />
    </>
  )
}
