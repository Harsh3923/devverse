"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const hideGalaxyNav = pathname === "/galaxies" || pathname === "/galaxies/new";

  return (
    <nav className="clay-nav sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between sm:px-5 sm:py-3.5">

        {/* Logo */}
        <Link href="/" className="text-lg font-bold gradient-text tracking-tight sm:text-xl" onClick={() => setMenuOpen(false)}>
          Devverse
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          {!hideGalaxyNav && (
            <>
              <Link
                href="/galaxies"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-colors hover:text-white"
                style={{ color: "#94a3b8" }}
              >
                Browse Galaxies
              </Link>
              <Link href="/galaxies/new" className="clay-btn-primary px-4 py-2 text-sm">
                + Create Galaxy
              </Link>
            </>
          )}

          {session ? (
            <div className="flex items-center gap-2.5 ml-1">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.githubLogin}
                  className="w-8 h-8 rounded-full"
                  style={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.5)" }}
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white"
                style={{ color: "#64748b" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="clay-btn-ghost px-4 py-2 text-sm ml-1"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          {session ? (
            <img
              src={session.user?.image}
              alt={session.githubLogin}
              className="w-8 h-8 rounded-full"
              style={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.4)" }}
            />
          ) : (
            <button
              onClick={() => signIn("github")}
              className="clay-btn-ghost px-3 py-2 text-xs"
            >
              Sign in
            </button>
          )}

          {/* Hamburger — 44px tap target */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="clay-btn-ghost flex items-center justify-center ml-1"
            style={{ width: 44, height: 44 }}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="2" y1="2" x2="16" y2="16" />
                  <line x1="16" y1="2" x2="2" y2="16" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5" x2="16" y2="5" />
                  <line x1="2" y1="9" x2="16" y2="9" />
                  <line x1="2" y1="13" x2="16" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="sm:hidden px-4 pb-4 pt-2 flex flex-col gap-2 animate-fade-in"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {!hideGalaxyNav && (
            <>
              <Link
                href="/galaxies"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors hover:text-white"
                style={{ color: "#94a3b8" }}
              >
                🌌 Browse Galaxies
              </Link>
              <Link
                href="/galaxies/new"
                onClick={() => setMenuOpen(false)}
                className="clay-btn-primary px-4 py-3 text-sm text-center"
              >
                + Create Galaxy
              </Link>
            </>
          )}
          {session && (
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="clay-btn-ghost px-4 py-3 text-sm text-center"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
