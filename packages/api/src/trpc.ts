import type { Database } from '@my/supabase/types'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { TRPCError, initTRPC } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers'
import superJson from 'superjson'

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('the `NEXT_PUBLIC_SUPABASE_URL` env variable is not set.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('the `NEXT_PUBLIC_SUPABASE_ANON_KEY` env variable is not set.')
  }

  // if there's auth cookie it'll be authenticated by this helper
  const cookiesStore = (await cookies()) as unknown as UnsafeUnwrappedCookies

  let supabase = createRouteHandlerClient<Database>({
    cookies: () => cookiesStore as never,
  })
  let userId = (await supabase.auth.getUser()).data.user?.id

  // Native clients pass an access token in the authorization header
  if (opts.req.headers.has('authorization')) {
    const accessToken = opts.req.headers.get('authorization')!.split('Bearer ').pop()

    if (accessToken) {
      // Create a Supabase client with the access token for native clients
      supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              // pass the authorization header through to Supabase
              Authorization: opts.req.headers.get('authorization')!,
            },
          },
        }
      )

      // Use Supabase's getUser to validate the token and get user ID
      // This is more reliable than manual JWT verification
      const { data, error } = await supabase.auth.getUser(accessToken)
      if (data.user) {
        userId = data.user.id
      } else if (error) {
        console.error('Error validating access token:', error.message)
      }
    }
  }

  return {
    requestOrigin: opts.req.headers.get('origin'),

    /**
     * The Supabase user
     * More claims from the JWT or Session can be added here if needed inside tRPC procedures
     */
    user: userId && { id: userId },

    /**
     * The Supabase instance with the authenticated session on it (RLS works)
     *
     * You should import `supabaseAdmin` here in case you want to
     * do anything on behalf of the service role (RLS doesn't work - you're admin)
     */
    supabase,
  }
}

// Avoid exporting the entire t-object since it's not very descriptive.
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superJson,
})

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: { ...ctx.user },
    },
  })
})

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
