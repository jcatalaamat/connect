import { CityHomeScreen } from 'app/features/connect/city'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function CityHomePage() {
  const router = useRouter()
  const citySlug = router.query.city as string

  if (!citySlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>Connect</title>
      </Head>
      <CityHomeScreen citySlug={citySlug} />
    </>
  )
}
