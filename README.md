# Explora Web - Guide Portal & Landing Pages

Guide portal and public landing pages for the Explora platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **API**: Apollo Client (GraphQL)
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Notifications**: Sonner

## Features

### Guide Portal

- Dashboard with metrics and analytics
- Balance and earnings management
- Tour management (create, edit, delete)
- Interactive map for tour creation
- Agenda and scheduling
- Discount groups management
- Feedback and reviews
- Claims handling
- Orders history
- Settings and profile

### Landing Pages

- Main landing page
- For Guides page
- For Tourists page

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- explora-api running on localhost:3001

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
explora-web/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (landing)/       # Public landing pages
│   ├── (guide)/         # Protected guide portal
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── guide/           # Guide-specific components
│   ├── maps/            # Map components
│   └── charts/          # Chart components
├── lib/
│   └── apollo/          # Apollo Client setup
├── graphql/
│   ├── queries/         # GraphQL queries
│   └── mutations/       # GraphQL mutations
└── middleware.ts        # Auth & route protection
```

## Authentication

Routes under `(guide)/` are protected and require authentication.

## Deployment

Deploy to Vercel:

```bash
vercel
```

## License

Proprietary - Explora Platform
