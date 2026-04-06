import { NextPage } from "next";
import dynamic from "next/dynamic";

import HeroSliderClient from "@/components/client/HeroSliderClient";

// These are safe
const ContinueWatching = dynamic(
  () => import("@/components/sections/Home/ContinueWatching")
);

const HomePageList = dynamic(
  () => import("@/components/sections/Home/List")
);

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-3 md:gap-8">

      {/* Fixed */}
      <HeroSliderClient />

      <ContinueWatching />

      <HomePageList />

    </div>
  );
};

export default HomePage;