"use client";

import React from "react";
import NavbarMenuItems from "../other/NavbarMenuItems";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Ultra‑luxury Sidebar
 * - Matches the hero: metallic gold accents, glass surfaces, subtle glow.
 * - Prevents the circular "A" from overlapping the wordmark by placing the wordmark below
 *   and providing an expanded floating wordmark on hover (desktop only).
 * - Accessible: keyboard focus styles, aria labels, clear hit targets.
 * - Responsive: hidden on small screens, fixed compact rail on desktop.
 */

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const shouldShowSidebar = hrefs.includes(pathName);

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {shouldShowSidebar && (
        <>
          {/* Spacer to prevent main content from hiding behind fixed sidebar */}
          <div className="hidden md:block w-24 shrink-0" />

          <aside
            className="hidden md:flex fixed left-0 top-0 h-screen w-24 flex-col items-center py-6 z-50 transition-all duration-700"
            aria-label="Primary sidebar"
          >
            {/* Top area: circular mark + compact wordmark below */}
            <div className="relative z-20 flex flex-col items-center gap-2 w-full">
              <Link
                href="/"
                className="group/logo flex flex-col items-center justify-center select-none outline-none"
                aria-label="Go to Adwastream home"
              >
                {/* Circular mark */}
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-black/55 border border-white/6 overflow-hidden transition-transform duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/30"
                  tabIndex={0}
                >
                  <span
                    className="font-display text-3xl font-extrabold gold-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)] transition-transform duration-300 group-hover/logo:scale-105"
                    aria-hidden
                  >
                    A
                  </span>

                  {/* subtle gold ring (appears on hover/focus) */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none gold-ring opacity-0 transition-opacity duration-400 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100"
                  />
                </div>

                {/* Compact wordmark placed below the circular mark to avoid overlap */}
                <div className="mt-1 text-center">
                  <span
                    className="text-[10px] font-semibold tracking-widest text-[#D4AF37] opacity-95"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    ADWASTREAM
                  </span>
                </div>
              </Link>

              {/* Floating expanded wordmark (desktop only) — appears to the right on hover/focus */}
              <div
                className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/logo:opacity-100 group-focus-within/logo:opacity-100 transition-all duration-300"
                aria-hidden
              >
                <div
                  className="rounded-lg px-4 py-2 bg-black/60 border border-white/6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transform: "translateX(-6px)",
                  }}
                >
                  {/* SVG wordmark for crispness */}
                  <svg width="140" height="28" viewBox="0 0 420 84" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <defs>
                      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#FFF2CD" />
                        <stop offset="0.5" stopColor="#D4AF37" />
                        <stop offset="1" stopColor="#8A5A19" />
                      </linearGradient>
                    </defs>
                    <text x="0" y="60" fontFamily="Syne, Arial, sans-serif" fontWeight="800" fontSize="56" fill="url(#g)">
                      ADWASTREAM
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation Items Container */}
            <nav className="relative z-10 flex flex-1 w-full flex-col items-center justify-center gap-8 mt-6" aria-label="Primary">
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="w-full flex flex-col items-center gap-6">
                  {/* NavbarMenuItems should render vertical icons/links */}
                  <NavbarMenuItems size="sm" isVertical withIcon variant="light" />
                </div>
              </div>
            </nav>

            {/* Bottom Luxury Profile/Settings Indicator */}
            <div className="relative z-10 mt-auto mb-6 flex items-center justify-center">
              <button
                className="group relative flex h-12 w-12 items-center justify-center rounded-full glass-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/30 transition-all duration-300"
                aria-label="Profile and settings"
                title="Profile"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-gold-400 animate-pulse-gold shadow-[0_0_10px_var(--gold-color)]" />
                <span className="absolute -inset-1 rounded-full gold-ring opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-0 min-h-screen">
        {children}
      </main>

      {/* Component-scoped styles to match the hero look */}
      <style jsx>{`
        :root {
          --gold-100: #fff2cd;
          --gold-300: #d4af37;
          --gold-500: #8a5a19;
          --gold-color: rgba(212, 175, 55, 0.9);
        }

        /* glass dark background used on sidebar elements */
        .glass-dark {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* gold text gradient for the A and other accents */
        .gold-text {
          background-image: linear-gradient(180deg, var(--gold-100) 0%, var(--gold-300) 50%, var(--gold-500) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ring that appears on hover/focus */
        .gold-ring {
          box-shadow: 0 0 18px 6px rgba(212, 175, 55, 0.06), inset 0 0 0 1px rgba(212, 175, 55, 0.06);
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.06), rgba(255, 242, 205, 0.02));
        }

        /* small pulse animation for bottom indicator */
        @keyframes pulse-gold {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.35);
          }
          70% {
            transform: scale(1.18);
            box-shadow: 0 0 18px 6px rgba(212, 175, 55, 0.12);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
          }
        }

        .animate-pulse-gold {
          animation: pulse-gold 2.6s infinite ease-in-out;
        }

        /* helper color token for shadow */
        .bg-gold-400 {
          background-color: var(--gold-300);
        }

        /* focus-visible for keyboard users */
        .group:focus-visible .gold-ring,
        .group:focus-visible .gold-text {
          opacity: 1;
        }

        /* ensure the floating wordmark is hidden on small screens */
        @media (max-width: 1023px) {
          .group-hover\\/logo\\:opacity-100,
          .group-focus-within\\/logo\\:opacity-100 {
            opacity: 0 !important;
          }
        }

        /* subtle entrance for the floating wordmark */
        .group-hover\\/logo\\:opacity-100,
        .group-focus-within\\/logo\\:opacity-100 {
          transform: translateX(0);
        }

        /* small responsive tweak: slightly reduce top padding on smaller desktops */
        @media (min-width: 768px) and (max-width: 1024px) {
          aside {
            padding-top: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;