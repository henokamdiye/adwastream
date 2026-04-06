import {
  Bebas_Neue as FontBebasNeue,
  Syne as FontSyne,
  DM_Sans as FontDMSans,
  Cinzel as FontCinzel,
  Playfair_Display as FontPlayfair,
  Outfit as FontOutfit,
} from "next/font/google";

/* ──────────────────────────────────────
   Logo Font — Cinematic Branding
────────────────────────────────────── */

export const BebasNeue = FontBebasNeue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

/* ──────────────────────────────────────
   Hero Titles — Luxury Cinema Serif
────────────────────────────────────── */

export const Cinzel = FontCinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

/* ──────────────────────────────────────
   Editorial Titles — Elegant Luxury
────────────────────────────────────── */

export const Playfair = FontPlayfair({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

/* ──────────────────────────────────────
   Modern Headings — Premium UI
────────────────────────────────────── */

export const Syne = FontSyne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

/* ──────────────────────────────────────
   UI Text — Modern Luxury Sans
────────────────────────────────────── */

export const Outfit = FontOutfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

/* ──────────────────────────────────────
   Body Text — Clean readability
────────────────────────────────────── */

export const DMSans = FontDMSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

/* ──────────────────────────────────────
   Legacy Compatibility
────────────────────────────────────── */

export const Poppins = Outfit;
export const Saira = Syne;