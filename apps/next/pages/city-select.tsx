import { CitySelectorScreen } from 'app/features/connect/city'
import Head from 'next/head'

export default function CitySelectorPage() {
  return (
    <>
      <Head>
        <title>Choose Your City | Connect</title>
      </Head>
      <CitySelectorScreen />
    </>
  )
}
