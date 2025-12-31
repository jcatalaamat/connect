import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Middleware to check city admin status
const createCityAdminProcedure = (cityIdPath: 'cityId' | 'input.cityId' = 'cityId') => {
  return protectedProcedure.use(async ({ ctx, next, input }) => {
    const cityId = (input as any)?.cityId

    if (!cityId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'City ID required' })
    }

    const { data: admin } = await ctx.supabase
      .from('city_admins')
      .select('role')
      .eq('profile_id', ctx.user.id)
      .eq('city_id', cityId)
      .single()

    if (!admin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an admin for this city',
      })
    }

    return next({
      ctx: {
        ...ctx,
        cityAdmin: { cityId, role: admin.role },
      },
    })
  })
}

export const adminRouter = createTRPCRouter({
  // Check if current user is admin for any city
  getAdminCities: protectedProcedure.query(async ({ ctx }) => {
    const { data: adminRecords, error } = await ctx.supabase
      .from('city_admins')
      .select(
        `
        city_id,
        role,
        cities (
          id,
          name,
          slug
        )
      `
      )
      .eq('profile_id', ctx.user.id)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch admin cities',
        cause: error,
      })
    }

    return adminRecords ?? []
  }),

  // List practitioners for a city (all statuses)
  listPractitioners: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        status: z
          .enum(['pending', 'approved', 'suspended', 'rejected'])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      let query = ctx.supabase
        .from('practitioners')
        .select(
          `
          id,
          profile_id,
          business_name,
          slug,
          bio,
          specialties,
          contact_email,
          phone,
          website_url,
          instagram_handle,
          avatar_url,
          stripe_onboarding_complete,
          stripe_charges_enabled,
          status,
          approved_at,
          rejection_reason,
          created_at,
          profiles!practitioners_profile_id_fkey (
            id,
            name,
            avatar_url
          )
        `,
          { count: 'exact' }
        )
        .eq('city_id', input.cityId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data: practitioners, error, count } = await query

      if (error) {
        console.error('listPractitioners error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch practitioners: ${error.message}`,
          cause: error,
        })
      }

      return {
        practitioners: practitioners ?? [],
        total: count ?? 0,
        hasMore: (count ?? 0) > input.offset + input.limit,
      }
    }),

  // Approve practitioner
  approvePractitioner: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        practitionerId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Verify practitioner belongs to this city
      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id, city_id, status')
        .eq('id', input.practitionerId)
        .single()

      if (!practitioner || practitioner.city_id !== input.cityId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      if (practitioner.status === 'approved') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Practitioner is already approved',
        })
      }

      const { error } = await ctx.supabase
        .from('practitioners')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: ctx.user.id,
          rejection_reason: null,
        })
        .eq('id', input.practitionerId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve practitioner',
          cause: error,
        })
      }

      // TODO: Send approval email notification

      return { success: true }
    }),

  // Reject practitioner
  rejectPractitioner: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        practitionerId: z.string().uuid(),
        reason: z.string().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Verify practitioner belongs to this city
      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id, city_id')
        .eq('id', input.practitionerId)
        .single()

      if (!practitioner || practitioner.city_id !== input.cityId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      const { error } = await ctx.supabase
        .from('practitioners')
        .update({
          status: 'rejected',
          rejection_reason: input.reason,
        })
        .eq('id', input.practitionerId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject practitioner',
          cause: error,
        })
      }

      // TODO: Send rejection email notification

      return { success: true }
    }),

  // Suspend practitioner
  suspendPractitioner: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        practitionerId: z.string().uuid(),
        reason: z.string().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Verify practitioner belongs to this city
      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id, city_id, status')
        .eq('id', input.practitionerId)
        .single()

      if (!practitioner || practitioner.city_id !== input.cityId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      if (practitioner.status !== 'approved') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only suspend approved practitioners',
        })
      }

      const { error } = await ctx.supabase
        .from('practitioners')
        .update({
          status: 'suspended',
          rejection_reason: input.reason,
        })
        .eq('id', input.practitionerId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to suspend practitioner',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Reinstate suspended practitioner
  reinstatePractitioner: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        practitionerId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const { data: practitioner } = await ctx.supabase
        .from('practitioners')
        .select('id, city_id, status')
        .eq('id', input.practitionerId)
        .single()

      if (!practitioner || practitioner.city_id !== input.cityId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      if (practitioner.status !== 'suspended') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Practitioner is not suspended',
        })
      }

      const { error } = await ctx.supabase
        .from('practitioners')
        .update({
          status: 'approved',
          rejection_reason: null,
        })
        .eq('id', input.practitionerId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reinstate practitioner',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Update city settings (fee percentage)
  updateCitySettings: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        platformFeePercent: z.number().min(5).max(15).optional(),
        description: z.string().max(1000).optional(),
        coverImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const updateData: Record<string, unknown> = {}
      if (input.platformFeePercent !== undefined) {
        updateData.platform_fee_percent = input.platformFeePercent
      }
      if (input.description !== undefined) {
        updateData.description = input.description
      }
      if (input.coverImageUrl !== undefined) {
        updateData.cover_image_url = input.coverImageUrl
      }

      const { error } = await ctx.supabase
        .from('cities')
        .update(updateData)
        .eq('id', input.cityId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update city settings',
          cause: error,
        })
      }

      return { success: true }
    }),

  // Get city statistics
  getCityStats: protectedProcedure
    .input(z.object({ cityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify admin
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Get practitioner counts by status
      const { data: practitioners } = await ctx.supabase
        .from('practitioners')
        .select('status')
        .eq('city_id', input.cityId)

      const practitionerStats = {
        total: practitioners?.length ?? 0,
        pending: practitioners?.filter((p) => p.status === 'pending').length ?? 0,
        approved: practitioners?.filter((p) => p.status === 'approved').length ?? 0,
        suspended: practitioners?.filter((p) => p.status === 'suspended').length ?? 0,
        rejected: practitioners?.filter((p) => p.status === 'rejected').length ?? 0,
      }

      // Get approved practitioner IDs
      const approvedPractitioners = practitioners?.filter((p) => p.status === 'approved') ?? []

      if (approvedPractitioners.length === 0) {
        return {
          practitioners: practitionerStats,
          bookings: {
            total: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
          },
          revenue: {
            totalPlatformFees: 0,
            thisMonthPlatformFees: 0,
          },
        }
      }

      // Get all practitioners in city for booking lookup
      const { data: allPractitioners } = await ctx.supabase
        .from('practitioners')
        .select('id')
        .eq('city_id', input.cityId)

      const practitionerIds = allPractitioners?.map((p) => p.id) ?? []

      // Get offerings for these practitioners
      const { data: offerings } = await ctx.supabase
        .from('offerings')
        .select('id')
        .in('practitioner_id', practitionerIds)

      const offeringIds = offerings?.map((o) => o.id) ?? []

      if (offeringIds.length === 0) {
        return {
          practitioners: practitionerStats,
          bookings: { total: 0, confirmed: 0, completed: 0, cancelled: 0 },
          revenue: { totalPlatformFees: 0, thisMonthPlatformFees: 0 },
        }
      }

      // Get booking stats
      const { data: bookings } = await ctx.supabase
        .from('bookings')
        .select('status, platform_fee_cents, created_at')
        .in('offering_id', offeringIds)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const bookingStats = {
        total: bookings?.length ?? 0,
        confirmed: bookings?.filter((b) => b.status === 'confirmed').length ?? 0,
        completed: bookings?.filter((b) => b.status === 'completed').length ?? 0,
        cancelled: bookings?.filter((b) => b.status === 'cancelled').length ?? 0,
      }

      const confirmedBookings = bookings?.filter((b) =>
        ['confirmed', 'completed'].includes(b.status)
      ) ?? []

      const totalPlatformFees = confirmedBookings.reduce(
        (sum, b) => sum + b.platform_fee_cents,
        0
      )

      const thisMonthBookings = confirmedBookings.filter(
        (b) => new Date(b.created_at) >= startOfMonth
      )

      const thisMonthPlatformFees = thisMonthBookings.reduce(
        (sum, b) => sum + b.platform_fee_cents,
        0
      )

      return {
        practitioners: practitionerStats,
        bookings: bookingStats,
        revenue: {
          totalPlatformFees: totalPlatformFees / 100,
          thisMonthPlatformFees: thisMonthPlatformFees / 100,
        },
      }
    }),
})
