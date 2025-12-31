import { AdminDashboardScreen } from 'app/features/connect/admin'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AdminDashboardPage() {
  const router = useRouter()
  const citySlug = router.query.city as string

  if (!citySlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Connect</title>
      </Head>
      <AdminDashboardScreen citySlug={citySlug} />
    </>
  )
}
