import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { greetingRouter } from './greeting'
import { citiesRouter } from './cities'
import { practitionersRouter } from './practitioners'
import { paymentsRouter } from './payments'
import { offeringsRouter } from './offerings'
import { bookingsRouter } from './bookings'
import { adminRouter } from './admin'
import { createTRPCRouter } from '../trpc'

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  cities: citiesRouter,
  practitioners: practitionersRouter,
  payments: paymentsRouter,
  offerings: offeringsRouter,
  bookings: bookingsRouter,
  admin: adminRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
