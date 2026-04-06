"use client";

import dynamic from "next/dynamic";

const HeroSlider = dynamic(
  () => import("@/components/sections/Home/HeroSlider"),
  { ssr: false }
);

export default function HeroSliderClient() {
  return <HeroSlider />;
}