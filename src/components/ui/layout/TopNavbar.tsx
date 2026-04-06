"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import UserProfileButton from "../button/UserProfileButton";
import SearchInput from "../input/SearchInput";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import BrandLogo from "../other/BrandLogo";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 800) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  const isHome = pathName === "/";

  if (auth || player) return null;

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className={cn("inset-0 h-min bg-transparent z-50", {
        "bg-background": show && !isHome,
      })}
      style={{
        borderBottom: show && !isHome ? "1px solid rgba(255,215,0,0.08)" : "none",
      }}
    >
      {/* Scrolled backdrop for non-home pages */}
      {!show && (
        <div
          className="border-background bg-background absolute inset-0 h-full w-full border-b"
          style={{ opacity }}
        />
      )}

      {/* Gold glow line at bottom when scrolled on home */}
      {isHome && y > 20 && (
        <div
          className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.3) 30%, rgba(255,215,0,0.5) 50%, rgba(255,215,0,0.3) 70%, transparent 100%)",
            opacity: Math.min(y / 200, 0.8),
          }}
        />
      )}

      <NavbarBrand>
        {show ? (
          <BrandLogo animate={isHome && y < 100} />
        ) : (
          <BackButton href={tv ? "/?content=tv" : "/"} />
        )}
      </NavbarBrand>

      {show && !pathName.startsWith("/search") && (
        <NavbarContent className="hidden w-full max-w-lg gap-2 md:flex" justify="center">
          <NavbarItem className="w-full">
            <Link href="/search" className="w-full">
              <SearchInput
                className="pointer-events-none"
                placeholder="Search movies, shows, actors..."
              />
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        <NavbarItem className="flex gap-1">
          <ThemeSwitchDropdown />
          <FullscreenToggleButton />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
