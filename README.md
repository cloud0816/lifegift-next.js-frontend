# LifeGift - Next.js Application

A modern Next.js 14 application built with Tailwind CSS, Shadcn/UI, and OAuth authentication (Google/GitHub) via LifeGift Platform API.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn/UI
- **Authentication**: OAuth 2.0 (Google/GitHub) via LifeGift Platform API
- **API Client**: Custom API client for LifeGift Platform REST API
- **Charts**: Recharts

## Project Structure

```
app/
├── components/          # Shadcn UI components
│   ├── ui/             # Reusable UI components
│   ├── sidebar.tsx     # Sidebar navigation
│   └── logo.tsx        # Logo component
├── layout/             # Layout components
│   └── root-layout.tsx # Main layout with dark mode
├── pages/              # Application pages
│   ├── dashboard/      # Dashboard with metrics
│   ├── clusters/       # Cluster management
│   ├── recommendations/ # Recommendations view and apply
│   ├── waste-report/   # Waste report
│   ├── analytics/      # Analytics page
│   ├── settings/       # Settings page
│   ├── signin/         # Sign in page
│   └── signout/        # Sign out page
├── api/                # API routes
│   └── auth/           # OAuth authentication routes
├── providers/          # React context providers
│   └── auth-provider.tsx # Authentication provider
├── hooks/              # Custom React hooks
└── globals.css         # Global styles with dark mode support
lib/
├── api-client.ts       # API client for LifeGift Platform
└── utils.ts           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- LifeGift Platform API access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# LifeGift Platform API Configuration
# Production: https://api.lifegift.com
# Staging: https://api.staging.lifegift.com
NEXT_PUBLIC_API_BASE_URL=https://api.lifegift.com

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### ✅ Completed

- ✅ Next.js 14 with App Router setup
- ✅ Tailwind CSS configuration
- ✅ Shadcn/UI component library integration
- ✅ OAuth authentication (Google/GitHub) via LifeGift Platform API
- ✅ Dark mode support with theme persistence
- ✅ API client for all LifeGift Platform endpoints
- ✅ Dashboard with metrics summary
- ✅ Clusters management (list, create, delete)
- ✅ Recommendations page (view and apply)
- ✅ Waste report with recommendations
- ✅ Analytics page
- ✅ Responsive layout with sidebar navigation

## API Integration

The application integrates with the LifeGift Platform API:

- **Authentication**: OAuth 2.0 (Google/GitHub) via `/auth/{provider}/login` and `/auth/{provider}/callback`
- **User Management**: `/v1/auth/me`, `/v1/auth/logout`
- **Clusters**: `/v1/clusters` (GET, POST, PATCH, DELETE)
- **Recommendations**: `/v1/recommendations` (GET, POST for bulk-apply)
- **Metrics**: `/v1/metrics/summary` (GET)

All API calls are authenticated using JWT Bearer tokens stored in session cookies.

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

