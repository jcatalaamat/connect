import { CitySelectorScreen } from 'app/features/connect/city'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Connect - Find Wellness Practitioners</title>
      </Head>
      <CitySelectorScreen />
    </>
  )
}
