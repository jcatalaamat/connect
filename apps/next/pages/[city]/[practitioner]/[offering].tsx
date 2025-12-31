import { OfferingDetailScreen } from 'app/features/connect/offerings'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function OfferingPage() {
  const router = useRouter()
  const offeringId = router.query.offering as string

  if (!offeringId) {
    return null
  }

  return (
    <>
      <Head>
        <title>Offering | Connect</title>
      </Head>
      <OfferingDetailScreen offeringId={offeringId} />
    </>
  )
}
