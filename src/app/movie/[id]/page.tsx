"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { Cast } from "tmdb-ts/dist/types/credits";
import { Image } from "tmdb-ts";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import AdSidebar from "@/components/ui/ads/AdSidebar";
import AdBanner from "@/components/ui/ads/AdBanner";

const PhotosSection   = dynamic(() => import("@/components/ui/other/PhotosSection"));
const BackdropSection = dynamic(() => import("@/components/sections/Movie/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));
const CastsSection    = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection  = dynamic(() => import("@/components/sections/Movie/Detail/Related"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const { data: movie, isPending, error } = useQuery({
    queryFn: () => tmdb.movies.details(id, ["images","videos","credits","keywords","recommendations","similar","reviews","watch/providers"]),
    queryKey: ["movie-detail", id],
  });

  if (isPending) return <Spinner size="lg" className="absolute-center" variant="simple" />;
  if (error) return null;

  return (
    /* Outer wrapper: main content + sidebar */
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        {/* Backdrop spans full width above both columns */}
        <BackdropSection movie={movie} />

        <div className="flex gap-8 pt-6">
          {/* ── Main content column ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            <OverviewSection movie={movie} />
            <CastsSection casts={movie.credits.cast as Cast[]} />
            {/* Mid-page leaderboard ad */}
            <AdBanner variant="leaderboard" slot={`movie-${id}-mid`} className="my-2" />
            <PhotosSection images={movie.images.backdrops as Image[]} />
            <RelatedSection movie={movie} />
          </div>

          {/* ── Sidebar ad (desktop only) ── */}
          <AdSidebar />
        </div>
      </Suspense>
    </div>
  );
};

export default MovieDetailPage;
