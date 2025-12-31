import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return _stripe
}

// For backwards compatibility - lazy getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

// Platform fee calculation
export function calculatePlatformFee(
  amountCents: number,
  feePercent: number
): { platformFeeCents: number; practitionerAmountCents: number } {
  const platformFeeCents = Math.round(amountCents * (feePercent / 100))
  const practitionerAmountCents = amountCents - platformFeeCents
  return { platformFeeCents, practitionerAmountCents }
}

// Generate Stripe Connect onboarding link
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
  return accountLink.url
}

// Create Stripe Connect Express account
export async function createConnectAccount(
  email: string,
  businessName: string,
  country: string = 'US'
): Promise<Stripe.Account> {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    business_type: 'individual',
    business_profile: {
      name: businessName,
    },
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  return account
}

// Get Connect account status
export async function getConnectAccountStatus(
  accountId: string
): Promise<{
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}> {
  const account = await stripe.accounts.retrieve(accountId)
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  }
}

// Create Stripe Express dashboard link
export async function createDashboardLink(accountId: string): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(accountId)
  return loginLink.url
}

// Create checkout session for booking
export async function createCheckoutSession({
  practitionerStripeAccountId,
  amountCents,
  platformFeeCents,
  currency = 'usd',
  customerEmail,
  customerName,
  offeringTitle,
  practitionerName,
  bookingId,
  successUrl,
  cancelUrl,
}: {
  practitionerStripeAccountId: string
  amountCents: number
  platformFeeCents: number
  currency?: string
  customerEmail: string
  customerName: string
  offeringTitle: string
  practitionerName: string
  bookingId: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: offeringTitle,
            description: `Session with ${practitionerName}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: practitionerStripeAccountId,
      },
      metadata: {
        booking_id: bookingId,
      },
    },
    metadata: {
      booking_id: bookingId,
      customer_name: customerName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

// Issue refund
export async function issueRefund(
  paymentIntentId: string,
  amountCents?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents, // undefined = full refund
    reason,
  })
  return refund
}
