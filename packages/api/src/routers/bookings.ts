import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createCheckoutSession, calculatePlatformFee } from '../stripe/client'

// Generate confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'CONN-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const initiateCheckoutInput = z.object({
  offeringId: z.string().uuid(),
  slotId: z.string().uuid().optional(),
  eventDateId: z.string().uuid().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(255),
  customerPhone: z.string().max(50).optional(),
  customerNotes: z.string().max(1000).optional(),
  spots: z.number().int().min(1).default(1),
})

export const bookingsRouter = createTRPCRouter({
  // Initiate checkout - creates booking and returns Stripe checkout URL
  initiateCheckout: publicProcedure.input(initiateCheckoutInput).mutation(async ({ ctx, input }) => {
    // Get offering with practitioner and city info
    const { data: offering, error: offeringError } = await ctx.supabase
      .from('offerings')
      .select(
        `
        id,
        type,
        title,
        price_cents,
        currency,
        capacity,
        practitioners!inner (
          id,
          business_name,
          stripe_account_id,
          stripe_charges_enabled,
          city_id,
          cities!inner (
            platform_fee_percent
          )
        )
      `
      )
      .eq('id', input.offeringId)
      .eq('is_active', true)
      .single()

    if (offeringError || !offering) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Offering not found' })
    }

    const practitioner = offering.practitioners as any
    const city = practitioner.cities as any

    // Check if practitioner can accept payments
    if (!practitioner.stripe_account_id || !practitioner.stripe_charges_enabled) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This practitioner is not set up to accept payments yet',
      })
    }

    // Validate slot/event date based on type
    if (offering.type === 'session') {
      if (!input.slotId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slot ID is required for session bookings',
        })
      }

      // Check slot availability
      const { data: slot } = await ctx.supabase
        .from('availability_slots')
        .select('id, is_booked')
        .eq('id', input.slotId)
        .eq('offering_id', input.offeringId)
        .single()

      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Slot not found' })
      }

      if (slot.is_booked) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This slot is no longer available',
        })
      }
    } else {
      if (!input.eventDateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Event date ID is required for event bookings',
        })
      }

      // Check event date availability
      const { data: eventDate } = await ctx.supabase
        .from('event_dates')
        .select('id, spots_remaining')
        .eq('id', input.eventDateId)
        .eq('offering_id', input.offeringId)
        .single()

      if (!eventDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event date not found' })
      }

      if (eventDate.spots_remaining < input.spots) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Only ${eventDate.spots_remaining} spots remaining`,
        })
      }
    }

    // Calculate amounts
    const totalAmountCents = offering.price_cents * input.spots
    const { platformFeeCents, practitionerAmountCents } = calculatePlatformFee(
      totalAmountCents,
      city.platform_fee_percent
    )

    // Generate confirmation code
    let confirmationCode = generateConfirmationCode()
    // Ensure uniqueness (retry if exists)
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await ctx.supabase
        .from('bookings')
        .select('id')
        .eq('confirmation_code', confirmationCode)
        .single()

      if (!existing) break
      confirmationCode = generateConfirmationCode()
      attempts++
    }

    // Create booking in pending state
    const { data: booking, error: bookingError } = await ctx.supabase
      .from('bookings')
      .insert({
        offering_id: input.offeringId,
        availability_slot_id: input.slotId || null,
        event_date_id: input.eventDateId || null,
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_notes: input.customerNotes,
        status: 'pending',
        spots_booked: input.spots,
        amount_cents: totalAmountCents,
        platform_fee_cents: platformFeeCents,
        practitioner_amount_cents: practitionerAmountCents,
        currency: offering.currency,
        confirmation_code: confirmationCode,
      })
      .select()
      .single()

    if (bookingError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create booking',
        cause: bookingError,
      })
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    try {
      const checkoutSession = await createCheckoutSession({
        practitionerStripeAccountId: practitioner.stripe_account_id,
        amountCents: totalAmountCents,
        platformFeeCents,
        currency: offering.currency.toLowerCase(),
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        offeringTitle: offering.title,
        practitionerName: practitioner.business_name,
        bookingId: booking.id,
        successUrl: `${baseUrl}/booking/confirmation/${confirmationCode}`,
        cancelUrl: `${baseUrl}/book/${input.offeringId}?cancelled=true`,
      })

      // Update booking with checkout session ID
      await ctx.supabase
        .from('bookings')
        .update({ stripe_checkout_session_id: checkoutSession.id })
        .eq('id', booking.id)

      return {
        checkoutUrl: checkoutSession.url,
        confirmationCode,
        bookingId: booking.id,
      }
    } catch (stripeError) {
      // Clean up booking if Stripe fails
      await ctx.supabase.from('bookings').delete().eq('id', booking.id)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session',
        cause: stripeError,
      })
    }
  }),

  // Get booking by confirmation code (public lookup)
  getByConfirmation: publicProcedure
    .input(
      z.object({
        confirmationCode: z.string(),
        email: z.string().email(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: booking, error } = await ctx.supabase
        .from('bookings')
        .select(
          `
          id,
          confirmation_code,
          customer_name,
          customer_email,
          status,
          spots_booked,
          amount_cents,
          currency,
          customer_notes,
          created_at,
          offerings!inner (
            id,
            title,
            type,
            duration_minutes,
            location_type,
            location_address,
            location_notes,
            virtual_link,
            practitioners!inner (
              business_name,
              contact_email,
              phone
            )
          ),
          availability_slots (
            start_time,
            end_time
          ),
          event_dates (
            start_time,
            end_time
          )
        `
        )
        .eq('confirmation_code', input.confirmationCode.toUpperCase())
        .eq('customer_email', input.email.toLowerCase())
        .single()

      if (error || !booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found. Please check your confirmation code and email.',
        })
      }

      return booking
    }),

  // Check booking status (for polling)
  checkStatus: publicProcedure
    .input(z.object({ bookingId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: booking } = await ctx.supabase
        .from('bookings')
        .select('status, confirmation_code')
        .eq('id', input.bookingId)
        .single()

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
      }

      return booking
    }),

  // List bookings for practitioner
  listForPractitioner: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'confirmed', 'cancelled', 'refunded', 'completed', 'no_show']).optional(),
        fromDate: z.string().datetime().optional(),
        toDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get practitioner
      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id')
        .eq('profile_id', ctx.user.id)
        .single()

      if (!practitioner) {
        return { bookings: [], total: 0, hasMore: false }
      }

      // Get offerings for this practitioner
      const { data: offerings } = await ctx.supabase
        .from('offerings')
        .select('id')
        .eq('practitioner_id', practitioner.id)

      if (!offerings || offerings.length === 0) {
        return { bookings: [], total: 0, hasMore: false }
      }

      const offeringIds = offerings.map((o) => o.id)

      let query = ctx.supabase
        .from('bookings')
        .select(
          `
          id,
          confirmation_code,
          customer_name,
          customer_email,
          customer_phone,
          status,
          spots_booked,
          amount_cents,
          practitioner_amount_cents,
          currency,
          customer_notes,
          internal_notes,
          created_at,
          offerings!inner (
            id,
            title,
            type
          ),
          availability_slots (
            start_time,
            end_time
          ),
          event_dates (
            start_time,
            end_time
          )
        `,
          { count: 'exact' }
        )
        .in('offering_id', offeringIds)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data: bookings, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bookings',
          cause: error,
        })
      }

      return {
        bookings: bookings ?? [],
        total: count ?? 0,
        hasMore: (count ?? 0) > input.offset + input.limit,
      }
    }),

  // Update booking status (practitioner)
  updateStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        status: z.enum(['completed', 'no_show']),
        internalNotes: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: booking } = await ctx.supabase
        .from('bookings')
        .select(
          `
          id,
          status,
          offerings!inner (
            practitioners!inner (
              profile_id
            )
          )
        `
        )
        .eq('id', input.bookingId)
        .single()

      if (!booking || (booking.offerings as any).practitioners.profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      if (booking.status !== 'confirmed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update confirmed bookings',
        })
      }

      const { error } = await ctx.supabase
        .from('bookings')
        .update({
          status: input.status,
          internal_notes: input.internalNotes,
        })
        .eq('id', input.bookingId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update booking',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Cancel booking (practitioner)
  cancel: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        reason: z.string().max(500).optional(),
        issueRefund: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: booking } = await ctx.supabase
        .from('bookings')
        .select(
          `
          id,
          status,
          availability_slot_id,
          event_date_id,
          spots_booked,
          stripe_payment_intent_id,
          offerings!inner (
            practitioners!inner (
              profile_id
            )
          )
        `
        )
        .eq('id', input.bookingId)
        .single()

      if (!booking || (booking.offerings as any).practitioners.profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking cannot be cancelled',
        })
      }

      // Update booking
      const { error: updateError } = await ctx.supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: 'practitioner',
          cancellation_reason: input.reason,
        })
        .eq('id', input.bookingId)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel booking',
          cause: updateError,
        })
      }

      // Release availability
      if (booking.availability_slot_id) {
        await ctx.supabase
          .from('availability_slots')
          .update({ is_booked: false, booking_id: null })
          .eq('id', booking.availability_slot_id)
      } else if (booking.event_date_id) {
        const { data: eventDate } = await ctx.supabase
          .from('event_dates')
          .select('spots_remaining')
          .eq('id', booking.event_date_id)
          .single()

        if (eventDate) {
          await ctx.supabase
            .from('event_dates')
            .update({ spots_remaining: eventDate.spots_remaining + booking.spots_booked })
            .eq('id', booking.event_date_id)
        }
      }

      // TODO: Issue refund if requested and payment was made
      // This would require the issueRefund function from stripe/client

      return { success: true }
    }),

  // Get upcoming bookings count for dashboard
  getUpcomingCount: protectedProcedure.query(async ({ ctx }) => {
    const { data: practitioner } = await ctx.supabase
      .from('practitioners')
      .select('id')
      .eq('profile_id', ctx.user.id)
      .single()

    if (!practitioner) {
      return { count: 0 }
    }

    const { data: offerings } = await ctx.supabase
      .from('offerings')
      .select('id')
      .eq('practitioner_id', practitioner.id)

    if (!offerings || offerings.length === 0) {
      return { count: 0 }
    }

    const offeringIds = offerings.map((o) => o.id)

    const { count } = await ctx.supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('offering_id', offeringIds)
      .eq('status', 'confirmed')

    return { count: count ?? 0 }
  }),
})
