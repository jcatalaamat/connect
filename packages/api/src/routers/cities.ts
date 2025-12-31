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
})
