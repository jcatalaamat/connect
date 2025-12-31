import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  stripe,
  createConnectAccount,
  createConnectOnboardingLink,
  getConnectAccountStatus,
  createDashboardLink,
} from '../stripe/client'

export const paymentsRouter = createTRPCRouter({
  // Get Stripe Connect onboarding link
  getStripeOnboardingLink: protectedProcedure.mutation(async ({ ctx }) => {
    // Get practitioner profile
    const { data: practitioner, error: practitionerError } = await ctx.supabase
      .from('practitioners')
      .select('id, stripe_account_id, contact_email, business_name')
      .eq('profile_id', ctx.user.id)
      .single()

    if (practitionerError || !practitioner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Practitioner profile not found. Please complete onboarding first.',
      })
    }

    let stripeAccountId = practitioner.stripe_account_id

    // Create Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      const account = await createConnectAccount(
        practitioner.contact_email,
        practitioner.business_name
      )
      stripeAccountId = account.id

      // Save Stripe account ID
      const { error: updateError } = await ctx.supabase
        .from('practitioners')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', practitioner.id)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save Stripe account',
          cause: updateError,
        })
      }
    }

    // Generate onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/practitioner/stripe-callback`
    const refreshUrl = `${baseUrl}/practitioner/stripe-setup`

    const onboardingUrl = await createConnectOnboardingLink(stripeAccountId, returnUrl, refreshUrl)

    return { url: onboardingUrl }
  }),

  // Get Stripe Express dashboard link
  getStripeDashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: practitioner } = await ctx.supabase
      .from('practitioners')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('profile_id', ctx.user.id)
      .single()

    if (!practitioner?.stripe_account_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Stripe account not connected',
      })
    }

    if (!practitioner.stripe_onboarding_complete) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please complete Stripe onboarding first',
      })
    }

    const dashboardUrl = await createDashboardLink(practitioner.stripe_account_id)
    return { url: dashboardUrl }
  }),

  // Get Stripe account status
  getAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    const { data: practitioner } = await ctx.supabase
      .from('practitioners')
      .select(
        'stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled, stripe_payouts_enabled'
      )
      .eq('profile_id', ctx.user.id)
      .single()

    if (!practitioner) {
      return {
        connected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }
    }

    if (!practitioner.stripe_account_id) {
      return {
        connected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }
    }

    // Get fresh status from Stripe
    try {
      const status = await getConnectAccountStatus(practitioner.stripe_account_id)

      // Update local status if changed
      if (
        status.chargesEnabled !== practitioner.stripe_charges_enabled ||
        status.payoutsEnabled !== practitioner.stripe_payouts_enabled ||
        status.detailsSubmitted !== practitioner.stripe_onboarding_complete
      ) {
        await ctx.supabase
          .from('practitioners')
          .update({
            stripe_charges_enabled: status.chargesEnabled,
            stripe_payouts_enabled: status.payoutsEnabled,
            stripe_onboarding_complete: status.detailsSubmitted,
          })
          .eq('profile_id', ctx.user.id)
      }

      return {
        connected: true,
        onboardingComplete: status.detailsSubmitted,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
      }
    } catch (error) {
      console.error('Error fetching Stripe account status:', error)
      return {
        connected: true,
        onboardingComplete: practitioner.stripe_onboarding_complete,
        chargesEnabled: practitioner.stripe_charges_enabled,
        payoutsEnabled: practitioner.stripe_payouts_enabled,
      }
    }
  }),

  // Get earnings summary
  getEarningsSummary: protectedProcedure.query(async ({ ctx }) => {
    // Get practitioner ID
    const { data: practitioner } = await ctx.supabase
      .from('practitioners')
      .select('id')
      .eq('profile_id', ctx.user.id)
      .single()

    if (!practitioner) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
    }

    // Get offerings for this practitioner
    const { data: offerings } = await ctx.supabase
      .from('offerings')
      .select('id')
      .eq('practitioner_id', practitioner.id)

    if (!offerings || offerings.length === 0) {
      return {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        pendingPayouts: 0,
        completedBookings: 0,
      }
    }

    const offeringIds = offerings.map((o) => o.id)

    // Get confirmed bookings
    const { data: bookings } = await ctx.supabase
      .from('bookings')
      .select('practitioner_amount_cents, status, created_at')
      .in('offering_id', offeringIds)
      .in('status', ['confirmed', 'completed'])

    if (!bookings) {
      return {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        pendingPayouts: 0,
        completedBookings: 0,
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalEarnings = bookings.reduce((sum, b) => sum + b.practitioner_amount_cents, 0)
    const thisMonthEarnings = bookings
      .filter((b) => new Date(b.created_at) >= startOfMonth)
      .reduce((sum, b) => sum + b.practitioner_amount_cents, 0)
    const completedBookings = bookings.filter((b) => b.status === 'completed').length

    return {
      totalEarnings: totalEarnings / 100, // Convert to dollars
      thisMonthEarnings: thisMonthEarnings / 100,
      pendingPayouts: 0, // Would need Stripe API to get actual pending
      completedBookings,
    }
  }),
})
