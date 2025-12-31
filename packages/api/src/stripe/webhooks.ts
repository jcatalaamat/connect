import type Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Create admin client for webhook operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for webhook handler')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (!bookingId) {
        console.error('No booking_id in checkout session metadata')
        return
      }

      // Update booking status to confirmed
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
          confirmation_sent_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (bookingError) {
        console.error('Error updating booking:', bookingError)
        throw bookingError
      }

      // Get booking details to update availability
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('availability_slot_id, event_date_id, spots_booked')
        .eq('id', bookingId)
        .single()

      if (fetchError) {
        console.error('Error fetching booking:', fetchError)
        throw fetchError
      }

      // Update slot or event date availability
      if (booking.availability_slot_id) {
        await supabase
          .from('availability_slots')
          .update({ is_booked: true, booking_id: bookingId })
          .eq('id', booking.availability_slot_id)
      } else if (booking.event_date_id) {
        // Decrement spots_remaining
        const { data: eventDate } = await supabase
          .from('event_dates')
          .select('spots_remaining')
          .eq('id', booking.event_date_id)
          .single()

        if (eventDate) {
          await supabase
            .from('event_dates')
            .update({
              spots_remaining: Math.max(0, eventDate.spots_remaining - booking.spots_booked),
            })
            .eq('id', booking.event_date_id)
        }
      }

      // Log transaction
      await supabase.from('transactions').insert({
        booking_id: bookingId,
        type: 'charge',
        amount_cents: session.amount_total || 0,
        currency: session.currency || 'usd',
        stripe_object_id: session.payment_intent as string,
        stripe_object_type: 'payment_intent',
        status: 'succeeded',
        metadata: { session_id: session.id },
      })

      // TODO: Send confirmation email via Supabase Edge Function or SMTP
      console.log(`Booking ${bookingId} confirmed. Send email to ${session.customer_email}`)

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (bookingId) {
        // Mark booking as cancelled due to expired checkout
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: 'system',
            cancellation_reason: 'Checkout session expired',
          })
          .eq('id', bookingId)
          .eq('status', 'pending')
      }

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata?.booking_id

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: 'system',
            cancellation_reason: 'Payment failed',
          })
          .eq('id', bookingId)
          .eq('status', 'pending')

        // Log failed transaction
        await supabase.from('transactions').insert({
          booking_id: bookingId,
          type: 'charge',
          amount_cents: paymentIntent.amount,
          currency: paymentIntent.currency,
          stripe_object_id: paymentIntent.id,
          stripe_object_type: 'payment_intent',
          status: 'failed',
          metadata: { error: paymentIntent.last_payment_error?.message },
        })
      }

      break
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account

      // Update practitioner's Stripe status
      await supabase
        .from('practitioners')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_onboarding_complete: account.details_submitted,
        })
        .eq('stripe_account_id', account.id)

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      // Find booking by payment intent
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (booking) {
        // Check if fully refunded
        const refundedAmount = charge.amount_refunded

        await supabase
          .from('bookings')
          .update({
            status: charge.refunded ? 'refunded' : 'confirmed',
            refund_amount_cents: refundedAmount,
          })
          .eq('id', booking.id)

        // Log refund transaction
        await supabase.from('transactions').insert({
          booking_id: booking.id,
          type: 'refund',
          amount_cents: refundedAmount,
          currency: charge.currency,
          stripe_object_id: charge.id,
          stripe_object_type: 'charge',
          status: 'succeeded',
        })
      }

      break
    }

    case 'transfer.created': {
      const transfer = event.data.object as Stripe.Transfer
      const bookingId = transfer.metadata?.booking_id

      if (bookingId) {
        // Update booking with transfer ID
        await supabase
          .from('bookings')
          .update({ stripe_transfer_id: transfer.id })
          .eq('id', bookingId)

        // Log transfer transaction
        await supabase.from('transactions').insert({
          booking_id: bookingId,
          type: 'transfer',
          amount_cents: transfer.amount,
          currency: transfer.currency,
          stripe_object_id: transfer.id,
          stripe_object_type: 'transfer',
          status: 'succeeded',
          metadata: { destination: transfer.destination },
        })
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}
