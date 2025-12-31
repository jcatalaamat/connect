import { PractitionerDetailScreen } from 'app/features/connect/practitioners'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function PractitionerDetailPage() {
  const router = useRouter()
  const citySlug = router.query.city as string
  const practitionerSlug = router.query.practitioner as string

  if (!citySlug || !practitionerSlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>Practitioner | Connect</title>
      </Head>
      <PractitionerDetailScreen citySlug={citySlug} practitionerSlug={practitionerSlug} />
    </>
  )
}
