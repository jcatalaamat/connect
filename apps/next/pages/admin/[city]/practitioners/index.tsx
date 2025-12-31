import { AdminPractitionersScreen } from 'app/features/connect/admin'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AdminPractitionersPage() {
  const router = useRouter()
  const citySlug = router.query.city as string

  if (!citySlug) {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Practitioners | Admin | Connect</title>
      </Head>
      <AdminPractitionersScreen citySlug={citySlug} />
    </>
  )
}
