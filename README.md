# Postit V2

A production-grade, full-stack social media application built as a monorepo. Users can create posts, comment, like, and follow other users in a real-time reactive feed. This project was built to demonstrate enterprise-level architecture, professional Git discipline, and end-to-end full-stack ownership.

**Live Demo:** [https://postit-v2-mu.vercel.app](https://postit-v2-mu.vercel.app)
**Backend API:** [https://post-it-production-14d0.up.railway.app/api](https://post-it-production-14d0.up.railway.app/api)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Design System](#design-system)
- [Testing](#testing)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Author](#author)

---

## Overview

Postit V2 is a full-stack rebuild of an existing backend project, migrated into a professional monorepo with a brand-new React and TypeScript frontend. The goal was to produce a codebase that demonstrates real-world engineering practices: clean architecture, atomic commits, protected branches, CI/CD via GitHub pull requests, and a polished user interface built from a defined design language.

The backend was built with Node.js, Express, and MongoDB. The frontend was built from scratch using Vite, React 19, and TypeScript with strict compiler settings. Both are deployed independently — the backend on Railway and the frontend on Vercel.

---

## Architecture

```
postit-v2/
├── backend/          # Node.js + Express REST API
│   ├── controllers/  # Route handler logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── middlewares/  # Auth and ownership guards
│   └── utils/        # Avatar generation helpers
├── frontend/         # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── api/      # Axios client and per-resource modules
│   │   ├── components/  # Reusable UI components
│   │   ├── context/  # Global auth state via React Context
│   │   ├── pages/    # Route-level page components
│   │   ├── test/     # Vitest + React Testing Library suite
│   │   └── types/    # Shared TypeScript interfaces
│   └── vercel.json   # SPA rewrite rule for React Router
└── docs/
    ├── app-flow.md   # Mermaid user journey flowchart
    └── erd.md        # Mermaid entity relationship diagram
```

**Key architectural decisions:**

- The frontend and backend are decoupled — the frontend is a static SPA that communicates with the backend exclusively via REST API. They can be deployed, scaled, and versioned independently.
- All post queries use a MongoDB aggregation pipeline to attach a live comment count and populate the author in a single database round trip, avoiding the N+1 query problem.
- Auth state is persisted to localStorage so sessions survive hard refreshes. The axios client attaches the JWT Bearer token to every outgoing request via a request interceptor.
- Optimistic UI updates are used for likes and comment counts — the interface responds instantly while the network request resolves in the background, with automatic rollback on failure.
- Follow state is derived from the authenticated user's followings array, fetched once on mount and updated locally on toggle, so all post cards for the same author stay in sync without additional requests.

---

## Tech Stack

**Backend**

- Node.js and Express — REST API server
- MongoDB and Mongoose — document database with schema validation
- JSON Web Tokens — stateless authentication
- bcrypt — password hashing
- Railway — backend hosting with automatic deploys from main

**Frontend**

- Vite — build tool and dev server
- React 19 — component-based UI
- TypeScript — strict static typing throughout
- React Router v7 — client-side routing with lazy-loaded routes
- Axios — HTTP client with request interceptor for auth
- Vitest and React Testing Library — unit and component testing
- Vercel — frontend hosting with SPA rewrite support

**Monorepo**

- npm workspaces — dependency hoisting across backend and frontend packages

---

## Features

**Authentication**

- User signup with auto-generated DiceBear avatar based on username
- Login with JWT issued on the backend and persisted client-side
- Protected routes redirect unauthenticated users to login
- Logout clears token and all identity state

**Posts**

- Create, read, and soft-delete posts
- Feed sorted newest first via MongoDB aggregation
- Live comment count attached to each post at query time
- Author populated on every post without a separate request

**Comments**

- Expand and collapse comments per post (lazy-fetched on first expand)
- Create comments inline — new comment appends to local state instantly
- Comment count increments optimistically on creation

**Likes**

- Like and unlike any post with a single toggle
- Like count updates optimistically without a feed refetch
- Heart icon reflects current like state based on authenticated user

**Follow / Unfollow**

- Follow or unfollow any user directly from the feed
- Follow button hidden on posts owned by the logged-in user
- Follow state derived from authenticated user's followings array and kept in sync across all cards for the same author

---

## Project Structure

```
backend/
├── app.js                        # Express app, CORS, middleware registration
├── server.js                     # HTTP server entry point
├── controllers/
│   ├── authController.js         # Signup and login
│   ├── postController.js         # CRUD + aggregation pipeline
│   ├── commentController.js      # CRUD with author population
│   └── userController.js         # Profile, follow, unfollow
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── authRoutes.js
│   ├── postRoutes.js
│   ├── commentRoutes.js
│   └── userRoutes.js
└── middlewares/
    ├── authMiddleware.js          # JWT verification
    └── ownershipMiddleware.js     # Resource ownership guard

frontend/src/
├── api/
│   ├── client.ts                 # Axios instance with auth interceptor
│   ├── comments.ts               # Comment API calls
│   ├── posts.ts                  # Post API calls
│   └── users.ts                  # User API calls
├── components/
│   ├── ErrorBoundary.tsx         # Class component catching render errors
│   ├── PostCard.tsx              # Post card with comments, likes, follow
│   └── ProtectedRoute.tsx        # Auth guard wrapper
├── context/
│   └── AuthContext.tsx           # Global auth state and localStorage sync
├── pages/
│   ├── FeedPage.tsx              # Main feed with post creation
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── test/
│   ├── setup.ts                  # jest-dom matchers
│   └── LoginPage.test.tsx        # Component tests
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
└── config.ts                     # Environment variable validation
```

---

## Getting Started

**Prerequisites**

- Node.js 18 or higher
- A MongoDB Atlas cluster (or local MongoDB instance)
- npm 8 or higher

**Clone the repository**

```bash
git clone https://github.com/Lotacodic/postit-v2.git
cd postit-v2
```

**Install all dependencies**

```bash
npm install
```

This installs dependencies for both workspaces from the root via npm workspaces.

**Configure environment variables**

Create `backend/.env` (see Environment Variables section below).
Create `frontend/.env.local` for local development.

**Run the backend**

```bash
npm run dev:backend
```

**Run the frontend**

```bash
npm run dev:frontend
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## Environment Variables

**backend/.env**

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

**frontend/.env.local** (local development)

```
VITE_API_URL=http://localhost:3000/api
```

**frontend/.env** (production — committed to repository)

```
VITE_API_URL=https://post-it-production-14d0.up.railway.app/api
```

The frontend validates `VITE_API_URL` at startup and throws a descriptive error if it is missing, rather than failing silently at runtime.

---

## API Reference

**Auth**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Create a new account |
| POST | /api/auth/login | No | Login and receive JWT |

**Posts**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | No | Fetch all posts with comment count |
| POST | /api/posts | Yes | Create a post |
| DELETE | /api/posts/:id | Yes + Owner | Soft-delete a post |
| PUT | /api/posts/:id/like | Yes | Toggle like on a post |

**Comments**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/comments/:postId | No | Fetch comments for a post |
| POST | /api/comments/:postId | Yes | Create a comment |
| DELETE | /api/comments/:id | Yes + Owner | Soft-delete a comment |

**Users**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users | No | Fetch all users |
| GET | /api/users/:id | No | Fetch a single user |
| PUT | /api/users/:id | Yes | Update user profile |
| PUT | /api/users/:id/follow | Yes | Follow a user |
| PUT | /api/users/:id/unfollow | Yes | Unfollow a user |

---

## Database Schema

**User**

| Field | Type | Notes |
|-------|------|-------|
| username | String | Unique, 3-20 characters |
| email | String | Unique |
| password | String | bcrypt hashed |
| avatar | String | DiceBear URL generated from username |
| followers | Array | User ID references |
| followings | Array | User ID references |
| isDeleted | Boolean | Soft delete flag |

**Post**

| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref: User |
| postit | String | Post content |
| likes | Array | User ID references |
| file | Array | Attached file paths |
| isDeleted | Boolean | Soft delete flag |

**Comment**

| Field | Type | Notes |
|-------|------|-------|
| postId | ObjectId | Ref: Post |
| userId | ObjectId | Ref: User |
| text | String | Comment content |
| isDeleted | Boolean | Soft delete flag |

---

## Design System

The UI is built from a defined design language established before any code was written.

**Color Palette**

| Token | Value | Usage |
|-------|-------|-------|
| Primary Light | #FAEEDA | Page backgrounds |
| Primary Dark | #BA7517 | Headings, buttons, accents |
| Danger | #dc2626 | Delete actions, error states |
| Neutral | #6b7280 | Secondary text, timestamps |

**Typography Scale**

| Level | Size |
|-------|------|
| Display | 28px |
| Heading | 22px |
| Subheading | 18px |
| Body | 16px |
| Caption | 13px |

**Spacing Scale**

xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

---

## Testing

Tests are written with Vitest and React Testing Library.

```bash
cd frontend
npm test
```

Current test coverage includes LoginPage rendering and controlled input behaviour. The test suite is structured to grow alongside the application — each new page or component added to the project has a corresponding test file in `src/test/`.

---

## Deployment

**Backend — Railway**

The backend deploys automatically from the `main` branch on Railway. The start command is `npm run dev:backend` run from the repository root. Environment variables are configured in the Railway dashboard.

**Frontend — Vercel**

The frontend deploys automatically from the `main` branch on Vercel. The root directory is set to `frontend`, the build command is `npm run build`, and the output directory is `dist`. A rewrite rule in `vercel.json` redirects all routes to `index.html` to support client-side routing. `VITE_API_URL` is configured in the Vercel dashboard.

---

## Git Workflow

This project follows Git Flow with a protected `main` branch.

- `main` — production. Requires a pull request to merge. Force pushes blocked.
- `develop` — integration branch. All features merge here first.
- `feat/*` — feature branches cut from `develop`.
- `fix/*` — bug fix branches cut from `develop`.

All commits follow the Conventional Commits specification:

```
feat(feed): display comment count on post cards
fix(build): use type-only imports and remove unused CreatePostResponse
refactor(feed): use shared Post type instead of local duplicate
```

---

## Author

**Joshua Ngene**

GitHub: [https://github.com/Lotacodic](https://github.com/Lotacodic)
