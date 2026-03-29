# Devverse 🌌

> Visualize GitHub developers as solar systems. Explore solo or build shared galaxies with your team.

**Live Demo:** [devverse-six.vercel.app](https://devverse-six.vercel.app)

---

## What is Devverse?

Devverse turns GitHub profiles into interactive 3D solar systems. Every developer is a glowing star, and every repository is a planet orbiting around them. You can explore any GitHub user solo, or create a shared galaxy where multiple developers orbit together in one universe — in real time.

---

## Features

- **Solo Explorer** — Enter any GitHub username and instantly visualize their repositories as a 3D solar system
- **Shared Galaxies** — Create a named galaxy and invite other GitHub developers to add their solar systems
- **GitHub OAuth Authentication** — Sign in with GitHub to verify your identity before creating or joining a galaxy
- **Real-time Updates** — New solar systems appear in the galaxy the moment a contributor joins, no refresh needed
- **Spaceship Navigation** — Fly through the galaxy using keyboard controls (WASD / arrow keys)
- **Planet Details** — Click any planet to see repo name, language, stars, forks, and a direct GitHub link
- **Owner-only Controls** — Only the creator of a galaxy can delete it
- **Shareable Links** — Copy and share a galaxy link with anyone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 3D Rendering | Three.js + React Three Fiber + Drei |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (WebSockets) |
| Auth | NextAuth.js v4 with GitHub OAuth |
| Deployment | Vercel |

---

## How It Works

This section covers the full system — from a user typing a GitHub username to planets orbiting in 3D space.

---

### 1. GitHub Data Fetching

**File:** `lib/github.js`

When a username is submitted (solo explorer) or when a contributor joins a galaxy, Devverse calls the **GitHub REST API** directly from the server:

```
GET https://api.github.com/users/{username}        → profile data (name, avatar, follower count, etc.)
GET https://api.github.com/users/{username}/repos  → up to 100 public repositories
```

The response includes repo metadata: name, description, language, star count, fork count, and URL. This data is used to both render the 3D scene and populate the repository list below it.

For shared galaxies, GitHub data is fetched **once at contribution time** and stored in the `galaxy_contributors` table in Supabase. This means:
- The galaxy scene loads instantly from cached data (no live GitHub API call per page load)
- The scene stays accurate to the state when the developer joined

---

### 2. Solo Explorer — End to End

1. User types a GitHub username in the Solo Explorer input on the homepage
2. They are navigated to `/galaxy/{username}`
3. The page is a **Next.js server component** — it calls `getGithubData(username)` server-side at render time
4. GitHub profile + repos are returned and passed as props to `GalaxyScene`
5. The `GalaxyScene` renders a full interactive 3D solar system in the browser

No API routes are involved — the data fetch is a direct server-side call to GitHub's API.

---

### 3. The 3D Solar System — How Repos Become Planets

**Files:** `components/GalaxyScene.jsx`, `components/SolarSystem.jsx`, `lib/galaxyUtils.js`

The 3D scene is built with **React Three Fiber** (a React renderer for Three.js) and runs entirely in the browser using WebGL.

#### The Star (Developer)
- The developer is rendered as a glowing **yellow-orange star** at the center
- The star has 6 layers: solid core, chromosphere, 3 corona shells, and an outer halo — each pulsing at different frequencies using `useFrame` (Three.js animation loop)
- A golden tooltip floats above the star showing the GitHub username and repo count

#### The Planets (Repositories)
Each of the developer's repositories (up to 12) becomes a planet. Planet properties are derived directly from repo data:

| Planet Property | Derived From |
|---|---|
| **Orbit radius** | Index position (inner = newer repos) |
| **Size** | Star count — more stars = bigger planet |
| **Orbital speed** | Index — inner planets orbit faster |
| **Color palette** | Programming language (JavaScript = yellow, Python = blue, etc.) |
| **Planet type** | Combination of language + star/fork count: rocky, gas giant, ice, or lava |
| **Ring system** | Present every 4th repo, or if forks > 0 |
| **Axial tilt** | Varies by index for visual variety |

#### Procedural Textures
Planet and star surfaces are generated at runtime using the HTML5 Canvas API (inside `lib/galaxyUtils.js`) — no image files are loaded. Each planet gets a unique texture based on its type and color palette, painted with layered gradients, noise, and craters.

#### Atmospheric Layers
Each planet has a subtle atmospheric halo (inner + outer glow mesh) using `THREE.AdditiveBlending`, giving planets a soft luminous edge.

#### Background Environment
The galaxy background is fully procedural:
- **Galaxy spiral**: 5 spiral arms, each with 420 particles, colored with a blue-violet-pink gradient
- **Nebula clouds**: Soft plane meshes with additive blending create glowing gas clouds
- **Star field**: Two `<Stars>` layers (7,000 + 2,500 stars) at different depths for parallax
- **Comet**: A small sphere with a trailing plane mesh that traverses the scene continuously
- **Fog**: Depth fog fades distant objects for a deep-space feel

#### Spaceship & Navigation
A detailed miniature spaceship (fuselage, nose cone, wings, engine pods, nav lights, thruster sparkles) floats in the scene. Players can navigate using:

| Key | Action |
|---|---|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Strafe left |
| `→` | Strafe right |
| `U` | Move up |
| `D` | Move down |
| Mouse drag | Orbit camera |
| Scroll wheel | Zoom in/out |

The ship banks (tilts) left/right based on horizontal velocity, simulated with lerp smoothing.

#### Interacting with Planets
- **Hover** a planet: it scales up (1.1×) and a glow halo appears
- **Click** a planet: a floating info card appears showing repo name, type badge, stars, forks, language chip, and a "Travel to Repository" button that opens GitHub in a new tab
- **Click away**: the active card closes

---

### 4. Shared Galaxies — End to End

#### Creating a Galaxy

1. User signs in with GitHub OAuth (see Auth section below)
2. Fills in galaxy name (max 60 chars) and optional description (max 200 chars)
3. Form submits to `POST /api/galaxies`
4. Server validates the session, generates a URL slug from the name, and inserts a row into the `galaxies` table with `created_by = session.githubLogin`
5. User is redirected to `/galaxies/{slug}`

#### Joining a Galaxy (Contributing a Solar System)

1. A contributor visits the galaxy page and clicks **"+ Add my solar system"**
2. They are sent to `/galaxies/{slug}/contribute` and prompted to sign in with GitHub if not already
3. On submit, `POST /api/galaxies/{slug}/contribute` is called
4. The server:
   - Verifies the session exists
   - Confirms the submitted username matches `session.githubLogin` (prevents adding someone else's account)
   - Checks the user hasn't already joined this galaxy
   - Fetches their GitHub profile + repos
   - Calculates their **arm position** in the galaxy (see below)
   - Stores everything in `galaxy_contributors`

#### Galaxy Arm Positioning

The shared galaxy arranges contributors across **5 spiral arms**. Each new contributor is assigned:

```
arm_index = totalContributors % 5          // which arm (0–4)
arm_t     = 0.35 + (slot / 20) * 0.65     // distance along the arm (35% to 100%)
```

This distributes contributors evenly around the spiral so no arm becomes crowded. The galaxy supports up to **100 contributors** (5 arms × 20 slots each).

---

### 5. Real-time Updates

**File:** `components/SharedGalaxyView.jsx`

When you view a shared galaxy, `SharedGalaxyView` subscribes to **Supabase Realtime** — a WebSocket connection that listens for database changes:

```js
supabase
  .channel(`galaxy-${galaxyId}`)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "galaxy_contributors",
    filter: `galaxy_id=eq.${galaxyId}`,
  }, (payload) => {
    setContributors((prev) => [...prev, payload.new]);
  })
  .subscribe();
```

When any contributor joins the galaxy from anywhere in the world, their solar system **appears in the 3D scene immediately** for all current viewers — no page refresh needed.

---

### 6. Authentication

**Files:** `lib/authOptions.js`, `app/api/auth/[...nextauth]/route.js`, `app/providers.js`

Authentication uses **NextAuth.js** with the GitHub OAuth provider.

#### Flow

1. User clicks "Sign in with GitHub"
2. GitHub redirects to the OAuth consent screen
3. On approval, GitHub sends an authorization code to `https://your-domain/api/auth/callback/github`
4. NextAuth exchanges the code for an access token and fetches the GitHub profile
5. A **JWT session token** is created with the user's `githubLogin` (their real GitHub username) stored inside it

#### Why `githubLogin` matters

Standard NextAuth sessions only store `name`, `email`, and `image`. Devverse extends the JWT with the actual GitHub login handle:

```js
async jwt({ token, profile }) {
  if (profile) token.githubLogin = profile.login;
  return token;
},
async session({ session, token }) {
  session.githubLogin = token.githubLogin;
  return session;
}
```

This means every API route can call `getServerSession(authOptions)` and get `session.githubLogin` — the authoritative, verified GitHub username — and use it for write operations.

#### Protection on Every Write Route

- `POST /api/galaxies` — requires session, uses `session.githubLogin` as `created_by`
- `POST /api/galaxies/{slug}/contribute` — requires session, validates submitted username === `session.githubLogin`
- `DELETE /api/galaxies/{slug}` — requires session, validates `galaxy.created_by === session.githubLogin`

---

### 7. Database

Devverse uses **Supabase** (hosted PostgreSQL) with two core tables:

#### `galaxies`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Display name of the galaxy |
| `slug` | text | URL-safe identifier (unique) |
| `description` | text | Optional description |
| `created_by` | text | GitHub login of the creator |
| `created_at` | timestamp | Creation time |

#### `galaxy_contributors`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `galaxy_id` | uuid | Foreign key → galaxies |
| `github_username` | text | Contributor's GitHub login |
| `github_data` | jsonb | Cached GitHub profile + repos at join time |
| `arm_index` | int | Which spiral arm (0–4) |
| `arm_t` | float | Distance along the arm (0.35–1.0) |
| `joined_at` | timestamp | When they joined |

#### Two Supabase Clients

| Client | File | Key Used | Purpose |
|---|---|---|---|
| Public client | `lib/supabase.js` | Anon key | Safe for reads — subject to Row Level Security |
| Admin client | `lib/supabaseAdmin.js` | Service role key | Server-only — bypasses RLS for writes |

Writes (insert, delete) use the **admin client** on the server. This is necessary because Supabase's Row Level Security (RLS) would otherwise silently block unauthenticated write attempts.

---

### 8. Security

| Threat | Mitigation |
|---|---|
| Unauthenticated galaxy creation | `POST /api/galaxies` returns 401 if no valid session |
| Adding someone else's GitHub account | API validates `github_username === session.githubLogin` (403 if mismatch) |
| Deleting another user's galaxy | DELETE checks `galaxy.created_by === session.githubLogin` (403 if not owner) |
| Old galaxies with no creator | Null `created_by` handled — delete blocked for safety |
| XSS / clickjacking | Security headers set in `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| Input length abuse | Server-side validation: name ≤ 60 chars, description ≤ 200 chars |

---

### 9. Rendering Architecture

```
Browser Request
      │
      ▼
Next.js Server Component (page.js)
      │  fetches data from GitHub API / Supabase
      ▼
HTML sent to browser with data as props
      │
      ▼
React hydrates in browser
      │
      ▼
React Three Fiber mounts Canvas
      │  WebGL context created
      ▼
Three.js scene: Star + Planets + Background
      │  useFrame runs 60fps animation loop
      ▼
User interacts (hover, click, keyboard, mouse)
```

The 3D scene is a **client component** (`"use client"`) while the data-fetching page wrappers are **server components**. Data flows down as props — no client-side API calls for the initial render.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Harsh3923/devverse.git
cd devverse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
```

**Where to get these values:**

- **Supabase keys** — [supabase.com](https://supabase.com) → Your Project → Settings → API
- **GitHub OAuth** — [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New OAuth App
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`
- **NEXTAUTH_SECRET** — Run `openssl rand -base64 32` to generate a secure secret

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
devverse/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # GitHub OAuth handler (NextAuth)
│   │   ├── galaxies/               # GET all galaxies, POST create galaxy
│   │   │   └── [slug]/
│   │   │       ├── contribute/     # POST add solar system to galaxy
│   │   │       └── route.js        # DELETE galaxy (owner only)
│   │   └── github/[username]/      # GitHub data proxy route
│   ├── components/
│   │   └── Navbar.jsx              # Sticky clay morphism navbar
│   ├── galaxies/
│   │   ├── [slug]/
│   │   │   ├── contribute/         # Add your solar system (auth required)
│   │   │   ├── CopyLinkButton.jsx  # Share link button
│   │   │   ├── DeleteGalaxyButton.jsx  # Owner-only delete
│   │   │   └── page.js             # Galaxy detail view
│   │   ├── new/page.js             # Create galaxy (auth required)
│   │   ├── loading.js              # Shimmer skeleton while loading
│   │   └── page.js                 # Galaxy list / browser
│   ├── galaxy/[username]/
│   │   ├── loading.js              # Shimmer skeleton while loading
│   │   └── page.js                 # Solo explorer view
│   ├── globals.css                 # Clay morphism design system
│   ├── layout.js                   # Root layout with Navbar
│   ├── loading.js                  # Homepage loading skeleton
│   ├── page.js                     # Homepage
│   └── providers.js                # NextAuth SessionProvider wrapper
├── components/
│   ├── GalaxyScene.jsx             # Solo 3D scene (spaceship, comet, background)
│   ├── SharedGalaxyScene.jsx       # Multi-user 3D galaxy scene
│   ├── SharedGalaxyView.jsx        # Real-time Supabase subscription wrapper
│   └── SolarSystem.jsx             # Star + planets renderer
├── lib/
│   ├── authOptions.js              # NextAuth config (GitHub provider + JWT callbacks)
│   ├── galaxyUtils.js              # Procedural textures, planet type/palette logic
│   ├── github.js                   # GitHub REST API fetcher
│   ├── slugify.js                  # URL slug generator
│   ├── supabase.js                 # Supabase public client
│   └── supabaseAdmin.js            # Supabase admin client (server-only, bypasses RLS)
└── public/
    ├── favicon.ico                 # Galaxy emoji favicon
    └── ...                         # App icons (PWA, iOS, Android)
```

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables (same as `.env.local`, with `NEXTAUTH_URL` set to your production domain)
4. Deploy — Vercel auto-deploys on every push to `main`

### After deploying, update your GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → Devverse and update:
- Homepage URL: `https://your-domain.vercel.app`
- Callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only, never expose to client) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `NEXTAUTH_SECRET` | Yes | Random secret for signing session tokens |
| `NEXTAUTH_URL` | Yes | Full URL of your deployed app |

---

## License

MIT
