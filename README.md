# Connect - Universal App (Tamagui Takeout)

> A production-ready universal application built with **Tamagui Takeout** - sharing code between React Native (Expo) and Next.js web.

## Overview

This is a **Tamagui Takeout** starter project - a premium, closed-source template for building cross-platform applications. The monorepo architecture enables maximum code sharing between web and native platforms while maintaining native-quality UX.

**Key Technologies:**
- [Tamagui](https://tamagui.dev) - Universal UI with compile-time optimization
- [Expo](https://expo.dev) (SDK 53) - React Native platform
- [Next.js](https://nextjs.org) (v15) - React web framework
- [Supabase](https://supabase.com) - Backend as a Service (Auth, Database, Storage)
- [tRPC](https://trpc.io) - End-to-end type-safe APIs
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based native routing
- [Solito](https://solito.dev) - Cross-platform navigation

---

## Tech Stack Details

### Tamagui & Takeout

[Tamagui](https://tamagui.dev) is a universal design system that works across React Native and web. It provides:
- **Compile-time optimization** - Styles are extracted at build time for better performance
- **Universal components** - Write once, run on iOS, Android, and Web
- **Theme system** - Built-in dark/light mode with customizable themes
- **Responsive design** - Media queries that work on all platforms

[Takeout](https://tamagui.dev/takeout) is the premium starter kit that includes:
- Pre-built screens (auth, onboarding, profile, settings, feed)
- Universal forms with react-hook-form + Zod validation
- 150+ icon packs and 1500+ Google fonts
- Complete design system with ThemeBuilder
- Supabase integration out of the box

### Supabase - Backend as a Service

[Supabase](https://supabase.com) is an open-source Firebase alternative providing:
- **PostgreSQL Database** - Full relational database with JSONB support
- **Authentication** - Email/password, OAuth (Google, Apple), Magic Links
- **Real-time** - Live database subscriptions and presence
- **Storage** - S3-compatible file storage with RLS
- **Row Level Security (RLS)** - Fine-grained access control
- **Edge Functions** - Serverless functions close to users
- **Auto-generated APIs** - REST and GraphQL from your schema

### tRPC - Type-Safe APIs

[tRPC](https://trpc.io) enables end-to-end type-safe APIs:
- **Zero code generation** - Types flow from server to client automatically
- **Full autocompletion** - IDE support for inputs, outputs, and errors
- **Tiny footprint** - Minimal client-side bundle size
- **React Query integration** - Powerful caching and state management
- Works seamlessly with Next.js API routes

### React Native & Expo

- **React 19** - Latest React with concurrent features
- **React Native 0.79** - Native iOS/Android runtime
- **Expo SDK 53** - Managed platform with rich native APIs
- **Expo Router** - File-based routing for native apps
- **EAS Build** - Cloud builds for iOS and Android

---

## Project Structure

```
connect/
├── apps/
│   ├── expo/              # React Native app (iOS/Android)
│   ├── next/              # Next.js web app
│   ├── storybook/         # Web component documentation
│   └── storybook-rn/      # Native component documentation
├── packages/
│   ├── app/               # Shared business logic & features
│   │   ├── features/      # Feature modules (auth, home, profile, etc.)
│   │   ├── provider/      # App-wide providers
│   │   └── utils/         # Shared utilities
│   ├── ui/                # Custom UI components (@my/ui)
│   ├── api/               # tRPC API router (@my/api)
│   └── fonts-and-icons/   # Font and icon management
├── supabase/
│   ├── migrations/        # Database migrations
│   ├── config.toml        # Local Supabase config
│   └── types.ts           # Generated TypeScript types
├── .env.example           # Environment variables template
├── turbo.json             # Monorepo task orchestration
└── package.json           # Root workspace manifest
```

### Feature Modules

Located in `packages/app/features/`:
- **auth** - Sign in, sign up, OAuth (Google, Apple), onboarding
- **home** - Dashboard with posts, achievements, stats
- **profile** - User profile viewing and editing
- **settings** - General settings, password/email change, avatar upload
- **create** - Content creation flows
- **drawer-menu** - Native navigation drawer

---

## Getting Started

### Prerequisites

- **Node.js** 18.17.0+
- **Yarn** 4.1.0
- **Docker** (for local Supabase)
- **Xcode** 16.2+ (for iOS development)
- **Android Studio** 2024.3+ (for Android development)

### Installation

```bash
# Clone with create-tamagui (requires gh CLI)
yarn create tamagui --template takeout-starter

# Or clone manually and setup
git clone <your-repo>
cd connect
yarn install
yarn setup
```

### Environment Setup

```bash
# Copy example env file
cp .env.example .env
```

Configure your `.env` file:

```bash
# Web
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Native/Expo
EXPO_PUBLIC_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# JWT (min 32 characters)
SUPABASE_AUTH_JWT_SECRET=<your-jwt-secret>

# Google Sign In (optional)
GOOGLE_IOS_CLIENT_ID=<your-ios-client-id>
GOOGLE_WEB_CLIENT_ID=<your-web-client-id>
GOOGLE_SECRET=<your-secret>
```

### Supabase Setup

```bash
# Start local Supabase (requires Docker)
yarn supa start

# Link to remote project
cd supabase && yarn link-project

# Deploy migrations
yarn supa deploy

# Generate TypeScript types
yarn supa g
```

Local Supabase services:
- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Email testing (InBucket)**: http://localhost:54324

---

## Development

### Running the Apps

```bash
# Web (Next.js)
yarn web

# iOS Simulator
yarn ios

# Android Emulator
yarn android

# Native with Expo Go
yarn native
```

> **Note**: When developing native apps with tRPC, keep the web server running for API requests.

For iOS simulator to reach your API:
```bash
yarn web -H $(yarn get-local-ip-mac | head -n 1)
```

### Storybook

```bash
yarn storybook:web      # Web components
yarn storybook:ios      # iOS components
yarn storybook:android  # Android components
```

### Code Generation

```bash
yarn gen component   # Generate a new component
yarn gen screen      # Generate a new screen
yarn gen router      # Generate a tRPC router
```

### Type Checking & Linting

```bash
yarn typecheck       # Run TypeScript checks
yarn lint            # Run ESLint
yarn lint:fix        # Fix linting issues
```

---

## Database Schema

Core tables in Supabase:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (avatar, name, about) |
| `posts` | User-generated content |
| `categories` | Content categorization |
| `achievements` | User achievements/progress |
| `events` | Event management |
| `user_stats` | Analytics (MRR, ARR, views) |
| `projects` | Project tracking |
| `referrals` | User referral system |

All tables use Row Level Security (RLS) for access control.

---

## Authentication

### Supported Methods
- Email/Password with confirmation
- Google Sign In (iOS, Android, Web)
- Apple Sign In (iOS, Web)

### Email Confirmation (Local)

1. Start Supabase: `yarn supa start`
2. Sign up with email
3. Go to http://localhost:54324 (InBucket)
4. Find the confirmation email and click the link

### Route Protection

- **Web**: Middleware at `apps/next/middleware.ts`
- **Native**: AuthProvider at `packages/app/provider/auth/`

---

## Deployment

### Web (Vercel)

- **Root Directory**: `apps/next`
- **Build Command**: Default
- **Output Directory**: Default

### Mobile (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for simulators
yarn eas:build:dev:simulator:ios
yarn eas:build:dev:simulator:android

# Build for store distribution
cd apps/expo && eas build --platform all
```

Update `apps/expo/app.config.js`:
- `owner`: Your Expo username
- `projectId`: Your EAS project ID

### Supabase (Production)

```bash
yarn supa deploy   # Push migrations to remote
```

---

## Adding Dependencies

### JavaScript-only packages
```bash
cd packages/app
yarn add <package>
```

### Native packages
```bash
cd apps/expo
yarn add <package>
```

---

## Key Scripts

| Script | Description |
|--------|-------------|
| `yarn web` | Start Next.js dev server |
| `yarn ios` | Build and run iOS app |
| `yarn android` | Build and run Android app |
| `yarn native` | Start Expo dev server |
| `yarn build` | Build all packages |
| `yarn supa start` | Start local Supabase |
| `yarn supa stop` | Stop local Supabase |
| `yarn supa reset` | Reset local database |
| `yarn supa g` | Generate types from DB |
| `yarn supa deploy` | Push migrations to remote |
| `yarn add:font` | Add a font package |
| `yarn add:icon` | Add an icon package |

---

## Resources

### Official Documentation
- [Tamagui Docs](https://tamagui.dev/docs/intro/introduction)
- [Tamagui Takeout](https://tamagui.dev/takeout)
- [Expo Docs](https://docs.expo.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Solito Docs](https://solito.dev)

### Tutorials
- [Tamagui Takeout Tutorial (notjust.dev)](https://www.youtube.com/watch?v=XbKkKXH-dfc)
- [Tamagui Course by Simon](https://galaxies.dev/course/react-native-tamagui/1-1)

### Community
- [Tamagui Discord](https://discord.gg/tamagui)
- [Expo Discord](https://chat.expo.dev)

---

## Troubleshooting

### "Cannot find node" in Xcode
Remove `.xcode.env.local` from the project root, or set the correct `NODE_BINARY` path.

### API requests hanging on iOS simulator
iOS simulator can't reach localhost. Use your local IP:
```bash
yarn web -H $(yarn get-local-ip-mac)
```

### CocoaPods issues
Use CocoaPods 1.14.3 (avoid 1.15 due to bugs):
```bash
sudo gem install cocoapods -v 1.14.3
```

### Network request failed on sign in
Ensure Supabase is running: `yarn supa start`

---

## License

This project uses the Tamagui Takeout license. **Keep the source code private** as per the license terms.

---

## Supported Versions

| Package | Version |
|---------|---------|
| Node.js | 18.17.0 |
| Yarn | 4.1.0 |
| React | 19.0.0 |
| React Native | 0.79.2 |
| Expo SDK | 53.0.9 |
| Next.js | 15.4.1 |
| Tamagui | 1.138.6 |
| tRPC | 11.4.3 |
| Supabase | 2.48.1 |
| TypeScript | 5.8.3 |
