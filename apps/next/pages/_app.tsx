import '../public/web.css'
import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'
import { ColorScheme, NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { Provider } from 'app/provider'
import { AuthProviderProps } from 'app/provider/auth'
import { AppLayout } from 'app/features/layout'
import { api } from 'app/utils/api'
import { NextPage } from 'next'
import Head from 'next/head'
import 'raf/polyfill'
import { ReactElement, ReactNode } from 'react'
import type { SolitoAppProps } from 'solito'

if (process.env.NODE_ENV === 'production') {
  require('../public/tamagui.css')
}

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
  hideHeader?: boolean
}

function MyApp({
  Component,
  pageProps,
}: SolitoAppProps<{ initialSession: AuthProviderProps['initialSession'] }>) {
  // reference: https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts
  const getLayout = Component.getLayout || ((page) => page)
  const hideHeader = (Component as NextPageWithLayout).hideHeader ?? false
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_theme, setTheme] = useRootTheme()

  return (
    <>
      <Head>
        <title>Connect - Find Wellness Practitioners</title>
        <meta name="description" content="Book local wellness sessions & events" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="stylesheet" href="/tamagui.css" />
      </Head>
      <NextThemeProvider
        onChangeTheme={(next) => {
          setTheme(next as ColorScheme)
        }}
      >
        <Provider initialSession={pageProps.initialSession}>
          <AppLayout hideHeader={hideHeader}>
            {getLayout(<Component {...pageProps} />)}
          </AppLayout>
        </Provider>
      </NextThemeProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
