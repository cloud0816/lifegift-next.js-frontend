# LifeGift - Next.js Application

A modern Next.js 14 application built with Tailwind CSS, Shadcn/UI, and Auth0 authentication.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn/UI
- **Authentication**: Auth0
- **State Management**: React Query (TanStack Query) - Ready for implementation
- **Charts**: Recharts or Tremor.so (Ready for implementation)

## Project Structure

```
app/
├── components/          # Shadcn UI components
│   └── ui/             # Reusable UI components
├── layout/             # Layout components
│   └── root-layout.tsx # Main layout with dark mode
├── pages/              # Application pages
│   ├── dashboard/      # Dashboard page
│   ├── signin/         # Sign in page
│   └── signout/        # Sign out page
├── api/                # API routes
│   └── auth/           # Auth0 authentication routes
└── globals.css         # Global styles with dark mode support
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Auth0 environment variables:

Create a `.env.local` file in the root directory:

```env
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### ✅ Completed (First Milestone)

- ✅ Next.js 14 with App Router setup
- ✅ Tailwind CSS configuration
- ✅ Shadcn/UI component library integration
- ✅ Auth0 authentication integration
- ✅ Dark mode support with theme persistence
- ✅ Sign in page
- ✅ Sign out page
- ✅ Dashboard shell (empty page)
- ✅ Responsive layout with header navigation

### 🚧 Ready for Implementation

- React Query (TanStack Query) setup
- Charts integration (Recharts or Tremor.so)
- Additional pages and features

## Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Single Page Application)
3. Configure the following:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
4. Copy your credentials to `.env.local`

## Dark Mode

The application includes dark mode support with:
- System preference detection
- Manual toggle in the header
- Theme persistence in localStorage
- Smooth transitions

## Development

- Components are located in `app/components/ui/`
- Pages are in `app/pages/`
- Layout components are in `app/layout/`
- All Shadcn UI components follow the standard structure

## License

Private project - All rights reserved

