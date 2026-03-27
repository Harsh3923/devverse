# DevVerse — Code Galaxy 🌌

> Visualize GitHub developers as solar systems. Explore solo or build shared galaxies with your team.

**Live Demo:** [devverse-six.vercel.app](https://devverse-six.vercel.app)

---

## What is DevVerse?

DevVerse turns GitHub profiles into interactive 3D solar systems. Every developer is a star, and every repository is a planet orbiting around them. You can explore any GitHub user solo, or create a shared galaxy where multiple developers orbit together in one universe.

---

## Features

- **Solo Explorer** — Enter any GitHub username and instantly visualize their repositories as a 3D solar system
- **Shared Galaxies** — Create a named galaxy and invite other GitHub developers to add their solar systems
- **GitHub OAuth Authentication** — Sign in with GitHub to verify your identity before creating or joining a galaxy
- **Owner-only Controls** — Only the creator of a galaxy can delete it
- **Real-time Updates** — New solar systems appear in the galaxy as contributors join
- **Shareable Links** — Copy and share a galaxy link with anyone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 3D Rendering | Three.js + React Three Fiber |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js with GitHub OAuth |
| Deployment | Vercel |

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
│   │   ├── auth/[...nextauth]/   # GitHub OAuth handler
│   │   ├── galaxies/             # Galaxy CRUD API routes
│   │   └── github/[username]/    # GitHub data fetcher
│   ├── galaxies/
│   │   ├── [slug]/               # Galaxy detail + delete
│   │   │   └── contribute/       # Add solar system (auth required)
│   │   └── new/                  # Create galaxy (auth required)
│   ├── galaxy/[username]/        # Solo explorer view
│   └── page.js                   # Home page
├── components/
│   ├── GalaxyScene.jsx           # Solo 3D solar system
│   ├── SharedGalaxyScene.jsx     # Multi-user 3D galaxy
│   └── SharedGalaxyView.jsx      # Real-time galaxy wrapper
└── lib/
    ├── authOptions.js            # NextAuth configuration
    ├── github.js                 # GitHub API helper
    ├── supabase.js               # Supabase client
    ├── supabaseAdmin.js          # Supabase admin client (server-only)
    └── slugify.js                # URL slug generator
```

---

## Authentication Flow

1. User clicks **"Create Galaxy"** or **"Add my solar system"**
2. If not signed in → prompted to **Sign in with GitHub**
3. GitHub OAuth verifies identity → session stores their real GitHub username
4. API routes validate the session server-side before any write operation
5. Users can only add their own GitHub account to a galaxy — not someone else's

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables (same as `.env.local`, with `NEXTAUTH_URL` set to your production domain)
4. Deploy — Vercel auto-deploys on every push to `main`

### After deploying, update your GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → DevVerse and update:
- Homepage URL: `https://your-domain.vercel.app`
- Callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `NEXTAUTH_SECRET` | Yes | Random secret for signing session tokens |
| `NEXTAUTH_URL` | Yes | Full URL of your deployed app |

---

## License

MIT
