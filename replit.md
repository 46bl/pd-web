# Overview

PlayDirty is a full-stack e-commerce web application for gaming enhancement tools and cheats. The application features a modern React frontend with a sleek dark theme and an Express.js backend API. It includes a welcoming homepage that establishes PlayDirty as a trusted cheat supplier with 24/7 support, along with product browsing, search, and filtering capabilities with a responsive design that works across desktop and mobile devices.

## Recent Changes (September 13, 2025)
- Successfully set up the GitHub import in Replit environment
- Configured development workflow on port 5000 with hot module replacement
- Created new homepage with "Welcome to PlayDirty" hero section
- Added content highlighting PlayDirty as a premium gaming enhancement supplier
- Integrated multiple 24/7 support mentions and trust indicators
- Maintained consistent dark theme and styling throughout
- Set up deployment configuration for production (autoscale)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, modern UI design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Dark theme with red accent colors, custom CSS variables for theming
- **Component Structure**: Modular component architecture with reusable UI components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture with proper error handling and logging
- **Development**: Hot reload with Vite integration for seamless full-stack development
- **Storage**: In-memory storage implementation with interface for future database integration

## Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Schema**: Shared TypeScript schemas between client and server using Zod validation
- **Database**: PostgreSQL with Neon serverless database connection
- **Migrations**: Drizzle Kit for database migrations and schema management

## Development Environment
- **Build System**: Vite for frontend bundling and esbuild for server bundling
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: Consistent code formatting and linting setup
- **Development Server**: Integrated development server with API proxy and hot reload

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

## UI Component Library
- **@radix-ui**: Accessible, unstyled UI primitives for building design system
- **shadcn/ui**: Pre-built component library based on Radix UI
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating component variants

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety across the application
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management tool

## Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Integration with validation libraries
- **zod**: Schema validation for forms and API data

## Additional Libraries
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Carousel/slider component
- **cmdk**: Command palette component for search functionality