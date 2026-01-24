# JP/KR Resident Community Board

## Overview

An anonymous community forum for US residents in Japan and Korea to share posts and comments. Users can create posts categorized by topic (travel, health, food, others), view community feeds, and engage through comments. The platform supports dual communities (Japan/Korea) with a toggle feature, and displays partial IP addresses for anonymity while maintaining some accountability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Japanese-inspired color theme (traditional colors like Gofun-iro, Kachi-iro, Akabeni)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in shared routes with Zod schemas for type-safe request/response validation
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared types, `shared/models/auth.ts` for auth tables
- **Tables**: users, sessions (auth), posts, comments (content)
- **Migrations**: Drizzle Kit with `db:push` command

### Shared Code Pattern
- **Location**: `shared/` directory contains schema definitions and API route contracts
- **Route Definitions**: `shared/routes.ts` defines API endpoints with Zod input/output schemas
- **Type Safety**: drizzle-zod generates Zod schemas from database tables

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Custom build script using esbuild for server, Vite for client
- **Output**: Server bundle to `dist/index.cjs`, client assets to `dist/public`

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations
- connect-pg-simple for session storage

### Authentication
- Replit Auth (OpenID Connect provider)
- Required environment variables: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Key npm Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `passport`: Authentication middleware
- `zod`: Runtime type validation
- `date-fns`: Date formatting for posts and comments
- `wouter`: Client-side routing
- Radix UI primitives: Accessible component foundations