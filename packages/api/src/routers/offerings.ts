import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Input schemas
const createOfferingInput = z.object({
  type: z.enum(['session', 'event']),
  title: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
  depositRequired: z.boolean().default(false),
  depositPercent: z.number().int().min(0).max(100).default(0),
  // For sessions
  durationMinutes: z.number().int().min(15).max(480).optional(),
  // For events
  capacity: z.number().int().min(1).optional(),
  // Location
  locationType: z.enum(['in_person', 'virtual', 'hybrid']).default('in_person'),
  locationAddress: z.string().max(500).optional(),
  locationNotes: z.string().max(500).optional(),
  virtualLink: z.string().url().optional().or(z.literal('')),
  // Media
  coverImageUrl: z.string().url().optional(),
})

const updateOfferingInput = createOfferingInput.partial().extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
})

const addSlotInput = z.object({
  offeringId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
})

const addEventDateInput = z.object({
  offeringId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacityOverride: z.number().int().min(1).optional(),
})

export const offeringsRouter = createTRPCRouter({
  // Get offerings by practitioner (public)
  listByPractitioner: publicProcedure
    .input(
      z.object({
        practitionerId: z.string().uuid(),
        type: z.enum(['session', 'event']).optional(),
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('offerings')
        .select(
          `
          id,
          type,
          title,
          description,
          price_cents,
          currency,
          duration_minutes,
          capacity,
          location_type,
          location_address,
          cover_image_url,
          is_active
        `
        )
        .eq('practitioner_id', input.practitionerId)
        .order('created_at', { ascending: false })

      if (input.activeOnly) {
        query = query.eq('is_active', true)
      }

      if (input.type) {
        query = query.eq('type', input.type)
      }

      const { data: offerings, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch offerings',
          cause: error,
        })
      }

      return offerings ?? []
    }),

  // Get single offering with availability
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: offering, error } = await ctx.supabase
        .from('offerings')
        .select(
          `
          id,
          practitioner_id,
          type,
          title,
          description,
          price_cents,
          currency,
          deposit_required,
          deposit_percent,
          duration_minutes,
          capacity,
          location_type,
          location_address,
          location_notes,
          virtual_link,
          cover_image_url,
          is_active,
          practitioners (
            id,
            business_name,
            slug,
            avatar_url,
            stripe_charges_enabled,
            city_id,
            cities (
              id,
              name,
              slug,
              platform_fee_percent
            )
          )
        `
        )
        .eq('id', input.id)
        .single()

      if (error || !offering) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offering not found' })
      }

      return offering
    }),

  // Get availability for an offering
  getAvailability: publicProcedure
    .input(
      z.object({
        offeringId: z.string().uuid(),
        fromDate: z.string().datetime().optional(),
        toDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get offering type
      const { data: offering } = await ctx.supabase
        .from('offerings')
        .select('type, capacity')
        .eq('id', input.offeringId)
        .single()

      if (!offering) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offering not found' })
      }

      const now = new Date().toISOString()
      const fromDate = input.fromDate || now

      if (offering.type === 'session') {
        // Get available slots
        let query = ctx.supabase
          .from('availability_slots')
          .select('id, start_time, end_time, is_booked')
          .eq('offering_id', input.offeringId)
          .eq('is_booked', false)
          .gte('start_time', fromDate)
          .order('start_time')

        if (input.toDate) {
          query = query.lte('start_time', input.toDate)
        }

        const { data: slots } = await query
        return { type: 'session' as const, slots: slots ?? [] }
      } else {
        // Get event dates with spots
        let query = ctx.supabase
          .from('event_dates')
          .select('id, start_time, end_time, capacity_override, spots_remaining')
          .eq('offering_id', input.offeringId)
          .gt('spots_remaining', 0)
          .gte('start_time', fromDate)
          .order('start_time')

        if (input.toDate) {
          query = query.lte('start_time', input.toDate)
        }

        const { data: dates } = await query
        return { type: 'event' as const, dates: dates ?? [] }
      }
    }),

  // Create offering (practitioner only)
  create: protectedProcedure.input(createOfferingInput).mutation(async ({ ctx, input }) => {
    // Get practitioner
    const { data: practitioner } = await ctx.supabase
      .from('practitioners')
      .select('id')
      .eq('profile_id', ctx.user.id)
      .single()

    if (!practitioner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Practitioner profile not found',
      })
    }

    // Validate type-specific fields
    if (input.type === 'session' && !input.durationMinutes) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Duration is required for sessions',
      })
    }

    if (input.type === 'event' && !input.capacity) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Capacity is required for events',
      })
    }

    const { data: offering, error } = await ctx.supabase
      .from('offerings')
      .insert({
        practitioner_id: practitioner.id,
        type: input.type,
        title: input.title,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        deposit_required: input.depositRequired,
        deposit_percent: input.depositPercent,
        duration_minutes: input.durationMinutes,
        capacity: input.capacity,
        location_type: input.locationType,
        location_address: input.locationAddress,
        location_notes: input.locationNotes,
        virtual_link: input.virtualLink || null,
        cover_image_url: input.coverImageUrl,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create offering',
        cause: error,
      })
    }

    return offering
  }),

  // Update offering
  update: protectedProcedure.input(updateOfferingInput).mutation(async ({ ctx, input }) => {
    // Verify ownership
    const { data: offering } = await ctx.supabase
      .from('offerings')
      .select('practitioner_id, practitioners!inner(profile_id)')
      .eq('id', input.id)
      .single()

    if (!offering || (offering.practitioners as any).profile_id !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    const updateData: Record<string, unknown> = {}
    if (input.type) updateData.type = input.type
    if (input.title) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.priceCents !== undefined) updateData.price_cents = input.priceCents
    if (input.currency) updateData.currency = input.currency
    if (input.depositRequired !== undefined) updateData.deposit_required = input.depositRequired
    if (input.depositPercent !== undefined) updateData.deposit_percent = input.depositPercent
    if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes
    if (input.capacity !== undefined) updateData.capacity = input.capacity
    if (input.locationType) updateData.location_type = input.locationType
    if (input.locationAddress !== undefined) updateData.location_address = input.locationAddress
    if (input.locationNotes !== undefined) updateData.location_notes = input.locationNotes
    if (input.virtualLink !== undefined) updateData.virtual_link = input.virtualLink || null
    if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data: updated, error } = await ctx.supabase
      .from('offerings')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update offering',
        cause: error,
      })
    }

    return updated
  }),

  // Delete (soft delete - set inactive)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: offering } = await ctx.supabase
        .from('offerings')
        .select('practitioner_id, practitioners!inner(profile_id)')
        .eq('id', input.id)
        .single()

      if (!offering || (offering.practitioners as any).profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const { error } = await ctx.supabase
        .from('offerings')
        .update({ is_active: false })
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete offering',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Add availability slot (for sessions)
  addSlot: protectedProcedure.input(addSlotInput).mutation(async ({ ctx, input }) => {
    // Verify ownership and type
    const { data: offering } = await ctx.supabase
      .from('offerings')
      .select('type, duration_minutes, practitioners!inner(profile_id)')
      .eq('id', input.offeringId)
      .single()

    if (!offering || (offering.practitioners as any).profile_id !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    if (offering.type !== 'session') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Slots are only for session offerings',
      })
    }

    const { data: slot, error } = await ctx.supabase
      .from('availability_slots')
      .insert({
        offering_id: input.offeringId,
        start_time: input.startTime,
        end_time: input.endTime,
        is_booked: false,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add slot',
        cause: error,
      })
    }

    return slot
  }),

  // Add multiple slots at once
  addSlots: protectedProcedure
    .input(
      z.object({
        offeringId: z.string().uuid(),
        slots: z.array(
          z.object({
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: offering } = await ctx.supabase
        .from('offerings')
        .select('type, practitioners!inner(profile_id)')
        .eq('id', input.offeringId)
        .single()

      if (!offering || (offering.practitioners as any).profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      if (offering.type !== 'session') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slots are only for session offerings',
        })
      }

      const slotsToInsert = input.slots.map((slot) => ({
        offering_id: input.offeringId,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_booked: false,
      }))

      const { data: slots, error } = await ctx.supabase
        .from('availability_slots')
        .insert(slotsToInsert)
        .select()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add slots',
          cause: error,
        })
      }

      return slots
    }),

  // Remove slot
  removeSlot: protectedProcedure
    .input(z.object({ slotId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership and not booked
      const { data: slot } = await ctx.supabase
        .from('availability_slots')
        .select(
          `
          is_booked,
          offerings!inner (
            practitioners!inner (
              profile_id
            )
          )
        `
        )
        .eq('id', input.slotId)
        .single()

      if (!slot || (slot.offerings as any).practitioners.profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      if (slot.is_booked) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove a booked slot',
        })
      }

      const { error } = await ctx.supabase
        .from('availability_slots')
        .delete()
        .eq('id', input.slotId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove slot',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Add event date
  addEventDate: protectedProcedure.input(addEventDateInput).mutation(async ({ ctx, input }) => {
    // Verify ownership and type
    const { data: offering } = await ctx.supabase
      .from('offerings')
      .select('type, capacity, practitioners!inner(profile_id)')
      .eq('id', input.offeringId)
      .single()

    if (!offering || (offering.practitioners as any).profile_id !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    if (offering.type !== 'event') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Event dates are only for event offerings',
      })
    }

    const capacity = input.capacityOverride || offering.capacity

    const { data: eventDate, error } = await ctx.supabase
      .from('event_dates')
      .insert({
        offering_id: input.offeringId,
        start_time: input.startTime,
        end_time: input.endTime,
        capacity_override: input.capacityOverride,
        spots_remaining: capacity,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add event date',
        cause: error,
      })
    }

    return eventDate
  }),

  // Remove event date
  removeEventDate: protectedProcedure
    .input(z.object({ eventDateId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: eventDate } = await ctx.supabase
        .from('event_dates')
        .select(
          `
          spots_remaining,
          offerings!inner (
            capacity,
            practitioners!inner (
              profile_id
            )
          )
        `
        )
        .eq('id', input.eventDateId)
        .single()

      if (!eventDate || (eventDate.offerings as any).practitioners.profile_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Check if there are any bookings
      const originalCapacity =
        (eventDate.offerings as any).capacity_override || (eventDate.offerings as any).capacity
      if (eventDate.spots_remaining < originalCapacity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove an event date with existing bookings',
        })
      }

      const { error } = await ctx.supabase
        .from('event_dates')
        .delete()
        .eq('id', input.eventDateId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove event date',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Get practitioner's own offerings
  getMyOfferings: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id')
        .eq('profile_id', ctx.user.id)
        .single()

      if (!practitioner) {
        return []
      }

      let query = ctx.supabase
        .from('offerings')
        .select(
          `
          id,
          type,
          title,
          description,
          price_cents,
          currency,
          duration_minutes,
          capacity,
          location_type,
          cover_image_url,
          is_active,
          created_at
        `
        )
        .eq('practitioner_id', practitioner.id)
        .order('created_at', { ascending: false })

      if (!input.includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data: offerings, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch offerings',
          cause: error,
        })
      }

      return offerings ?? []
    }),
})
