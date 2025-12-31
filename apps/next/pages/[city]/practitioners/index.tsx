import { PractitionerListScreen } from 'app/features/connect/practitioners'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function PractitionersPage() {
  const router = useRouter()
  const citySlug = router.query.city as string

  if (!citySlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>Practitioners | Connect</title>
      </Head>
      <PractitionerListScreen citySlug={citySlug} />
    </>
  )
}
