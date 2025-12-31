import { AdminSettingsScreen } from 'app/features/connect/admin'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AdminSettingsPage() {
  const router = useRouter()
  const citySlug = router.query.city as string

  if (!citySlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>City Settings | Admin | Connect</title>
      </Head>
      <AdminSettingsScreen citySlug={citySlug} />
    </>
  )
}
