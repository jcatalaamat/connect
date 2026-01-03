import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const citiesRouter = createTRPCRouter({
  // List all active cities
  list: publicProcedure.query(async ({ ctx }) => {
    const { data: cities, error } = await ctx.supabase
      .from('cities')
      .select(
        `
        id,
        name,
        slug,
        country,
        timezone,
        cover_image_url,
        description
      `
      )
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cities',
        cause: error,
      })
    }

    return cities
  }),

  // Get city by slug with practitioner count
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: city, error } = await ctx.supabase
        .from('cities')
        .select(
          `
          id,
          name,
          slug,
          country,
          timezone,
          platform_fee_percent,
          cover_image_url,
          description
        `
        )
        .eq('slug', input.slug)
        .eq('is_active', true)
        .single()

      if (error || !city) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `City "${input.slug}" not found`,
        })
      }

      // Get practitioner count
      const { count } = await ctx.supabase
        .from('practitioners')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', city.id)
        .eq('status', 'approved')

      return {
        ...city,
        practitionerCount: count ?? 0,
      }
    }),

  // Get city by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: city, error } = await ctx.supabase
        .from('cities')
        .select(
          `
          id,
          name,
          slug,
          country,
          timezone,
          platform_fee_percent,
          cover_image_url,
          description
        `
        )
        .eq('id', input.id)
        .eq('is_active', true)
        .single()

      if (error || !city) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'City not found',
        })
      }

      return city
    }),

  // Check if user is admin for a city
  isAdmin: protectedProcedure
    .input(z.object({ cityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: admin } = await ctx.supabase
        .from('city_admins')
        .select('id, role')
        .eq('profile_id', ctx.user.id)
        .eq('city_id', input.cityId)
        .single()

      return {
        isAdmin: !!admin,
        role: admin?.role ?? null,
      }
    }),

  // Submit a city request (public - anyone can request)
  requestCity: publicProcedure
    .input(
      z.object({
        cityName: z.string().min(2).max(100),
        country: z.string().min(2).max(100),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user ID if logged in
      const { data: { user } } = await ctx.supabase.auth.getUser()

      const { data: request, error } = await ctx.supabase
        .from('city_requests')
        .insert({
          city_name: input.cityName,
          country: input.country,
          email: input.email,
          profile_id: user?.id ?? null,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit city request',
          cause: error,
        })
      }

      return request
    }),

  // List city requests (admin only)
  listRequests: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of any city
      const { data: adminCheck } = await ctx.supabase
        .from('city_admins')
        .select('id')
        .eq('profile_id', ctx.user.id)
        .limit(1)
        .single()

      if (!adminCheck) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only city admins can view requests',
        })
      }

      let query = ctx.supabase
        .from('city_requests')
        .select(
          `
          id,
          city_name,
          country,
          email,
          status,
          notes,
          created_at,
          reviewed_at,
          profile_id,
          profiles (
            id,
            name,
            email
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data: requests, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch city requests',
          cause: error,
        })
      }

      return {
        requests: requests ?? [],
        total: count ?? 0,
        hasMore: (count ?? 0) > input.offset + input.limit,
      }
    }),

  // Update city request status (admin only)
  updateRequestStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        status: z.enum(['pending', 'approved', 'rejected']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin
      const { data: adminCheck } = await ctx.supabase
        .from('city_admins')
        .select('id')
        .eq('profile_id', ctx.user.id)
        .limit(1)
        .single()

      if (!adminCheck) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only city admins can update requests',
        })
      }

      const { data: request, error } = await ctx.supabase
        .from('city_requests')
        .update({
          status: input.status,
          notes: input.notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: ctx.user.id,
        })
        .eq('id', input.requestId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update city request',
          cause: error,
        })
      }

      return request
    }),
})
