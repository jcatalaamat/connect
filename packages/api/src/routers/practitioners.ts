import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Wellness specialties
export const SPECIALTIES = [
  'Yoga',
  'Meditation',
  'Breathwork',
  'Sound Healing',
  'Reiki',
  'Massage',
  'Cacao Ceremony',
  'Temazcal',
  'Holistic Therapy',
  'Energy Work',
] as const

// Input schemas
const createPractitionerInput = z.object({
  cityId: z.string().uuid(),
  businessName: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  bio: z.string().max(2000).optional(),
  specialties: z.array(z.string()).min(1).max(5),
  contactEmail: z.string().email(),
  phone: z.string().max(50).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramHandle: z.string().max(100).optional(),
})

const updatePractitionerInput = z.object({
  businessName: z.string().min(2).max(255).optional(),
  bio: z.string().max(2000).optional(),
  specialties: z.array(z.string()).min(1).max(5).optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramHandle: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
})

export const practitionersRouter = createTRPCRouter({
  // Get specialties list
  getSpecialties: publicProcedure.query(() => {
    return SPECIALTIES
  }),

  // List approved practitioners by city
  listByCity: publicProcedure
    .input(
      z.object({
        cityId: z.string().uuid().optional(),
        citySlug: z.string().optional(),
        specialty: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let cityId = input.cityId

      // Get city ID from slug if needed
      if (!cityId && input.citySlug) {
        const { data: city } = await ctx.supabase
          .from('cities')
          .select('id')
          .eq('slug', input.citySlug)
          .single()

        if (!city) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'City not found' })
        }
        cityId = city.id
      }

      if (!cityId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'City ID or slug required' })
      }

      let query = ctx.supabase
        .from('practitioners')
        .select(
          `
          id,
          business_name,
          slug,
          bio,
          specialties,
          avatar_url,
          cover_image_url,
          contact_email,
          instagram_handle,
          website_url
        `,
          { count: 'exact' }
        )
        .eq('city_id', cityId)
        .eq('status', 'approved')
        .order('business_name')
        .range(input.offset, input.offset + input.limit - 1)

      // Filter by specialty if provided
      if (input.specialty) {
        query = query.contains('specialties', [input.specialty])
      }

      const { data: practitioners, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch practitioners',
          cause: error,
        })
      }

      return {
        practitioners: practitioners ?? [],
        total: count ?? 0,
        hasMore: (count ?? 0) > input.offset + input.limit,
      }
    }),

  // Get practitioner by slug (public)
  getBySlug: publicProcedure
    .input(
      z.object({
        citySlug: z.string(),
        practitionerSlug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get city first
      const { data: city } = await ctx.supabase
        .from('cities')
        .select('id')
        .eq('slug', input.citySlug)
        .single()

      if (!city) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'City not found' })
      }

      // Get practitioner
      const { data: practitioner, error } = await ctx.supabase
        .from('practitioners')
        .select(
          `
          id,
          business_name,
          slug,
          bio,
          specialties,
          avatar_url,
          cover_image_url,
          contact_email,
          phone,
          website_url,
          instagram_handle,
          stripe_charges_enabled
        `
        )
        .eq('city_id', city.id)
        .eq('slug', input.practitionerSlug)
        .eq('status', 'approved')
        .single()

      if (error || !practitioner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      // Get offerings count
      const { count: offeringsCount } = await ctx.supabase
        .from('offerings')
        .select('*', { count: 'exact', head: true })
        .eq('practitioner_id', practitioner.id)
        .eq('is_active', true)

      return {
        ...practitioner,
        offeringsCount: offeringsCount ?? 0,
        canAcceptPayments: practitioner.stripe_charges_enabled,
      }
    }),

  // Get practitioner by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: practitioner, error } = await ctx.supabase
        .from('practitioners')
        .select(
          `
          id,
          business_name,
          slug,
          bio,
          specialties,
          avatar_url,
          cover_image_url,
          contact_email,
          phone,
          website_url,
          instagram_handle,
          city_id,
          cities (
            id,
            name,
            slug
          )
        `
        )
        .eq('id', input.id)
        .eq('status', 'approved')
        .single()

      if (error || !practitioner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Practitioner not found' })
      }

      return practitioner
    }),

  // Get current user's practitioner profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data: practitioner, error } = await ctx.supabase
      .from('practitioners')
      .select(
        `
        id,
        profile_id,
        city_id,
        business_name,
        slug,
        bio,
        specialties,
        avatar_url,
        cover_image_url,
        contact_email,
        phone,
        website_url,
        instagram_handle,
        stripe_account_id,
        stripe_onboarding_complete,
        stripe_charges_enabled,
        stripe_payouts_enabled,
        status,
        approved_at,
        rejection_reason,
        created_at,
        cities (
          id,
          name,
          slug,
          platform_fee_percent
        )
      `
      )
      .eq('profile_id', ctx.user.id)
      .single()

    if (error) {
      // Not an error if they don't have a profile yet
      if (error.code === 'PGRST116') {
        return null
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch profile',
        cause: error,
      })
    }

    return practitioner
  }),

  // Create practitioner profile
  create: protectedProcedure.input(createPractitionerInput).mutation(async ({ ctx, input }) => {
    // Check if user already has a practitioner profile
    const { data: existing } = await ctx.supabase
      .from('practitioners')
      .select('id')
      .eq('profile_id', ctx.user.id)
      .single()

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You already have a practitioner profile',
      })
    }

    // Check if slug is available in this city
    const { data: slugExists } = await ctx.supabase
      .from('practitioners')
      .select('id')
      .eq('city_id', input.cityId)
      .eq('slug', input.slug)
      .single()

    if (slugExists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This URL slug is already taken in this city',
      })
    }

    // Create practitioner profile
    const { data: practitioner, error } = await ctx.supabase
      .from('practitioners')
      .insert({
        profile_id: ctx.user.id,
        city_id: input.cityId,
        business_name: input.businessName,
        slug: input.slug,
        bio: input.bio,
        specialties: input.specialties,
        contact_email: input.contactEmail,
        phone: input.phone,
        website_url: input.websiteUrl || null,
        instagram_handle: input.instagramHandle,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create practitioner profile',
        cause: error,
      })
    }

    return practitioner
  }),

  // Update practitioner profile
  update: protectedProcedure.input(updatePractitionerInput).mutation(async ({ ctx, input }) => {
    // Get current practitioner
    const { data: current } = await ctx.supabase
      .from('practitioners')
      .select('id, status')
      .eq('profile_id', ctx.user.id)
      .single()

    if (!current) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Practitioner profile not found',
      })
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (input.businessName) updateData.business_name = input.businessName
    if (input.bio !== undefined) updateData.bio = input.bio
    if (input.specialties) updateData.specialties = input.specialties
    if (input.contactEmail) updateData.contact_email = input.contactEmail
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl || null
    if (input.instagramHandle !== undefined) updateData.instagram_handle = input.instagramHandle
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl
    if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl

    const { data: practitioner, error } = await ctx.supabase
      .from('practitioners')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update practitioner profile',
        cause: error,
      })
    }

    return practitioner
  }),

  // Check if slug is available
  checkSlugAvailability: protectedProcedure
    .input(
      z.object({
        cityId: z.string().uuid(),
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('practitioners')
        .select('id')
        .eq('city_id', input.cityId)
        .eq('slug', input.slug)
        .single()

      return { available: !data }
    }),
})
