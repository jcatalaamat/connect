import { StripeOnboardingScreen } from 'app/features/connect/practitioner-dashboard'
import Head from 'next/head'

export default function StripeSetupPage() {
  return (
    <>
      <Head>
        <title>Connect Stripe | Connect</title>
      </Head>
      <StripeOnboardingScreen />
    </>
  )
}
