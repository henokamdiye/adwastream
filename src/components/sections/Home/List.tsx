"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";
import AdBanner from "@/components/ui/ads/AdBanner";

const MovieHomeList  = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));

/**
 * Inserts an AdBanner every N content rows.
 * Currently every 3rd row gets a leaderboard banner.
 */
const AD_EVERY = 3;

const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );
  const list = content === "movie" ? movies : tvShows;

  return (
    <div className="flex flex-col gap-12">
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex min-h-32 flex-col gap-12">
        <Suspense
          fallback={
            <Spinner
              size="lg"
              variant="simple"
              className="absolute-center"
              color={content === "movie" ? "primary" : "warning"}
            />
          }
        >
          {list.map((item, idx) => (
            <div key={item.name} className="flex flex-col gap-12">
              {content === "movie" ? (
                <MovieHomeList {...(item as any)} />
              ) : (
                <TvShowHomeList {...(item as any)} />
              )}

              {/* Inline ad banner every AD_EVERY rows — subtle, non-blocking */}
              {(idx + 1) % AD_EVERY === 0 && idx < list.length - 1 && (
                <AdBanner variant="leaderboard" slot={`home-row-${idx}`} />
              )}
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;
