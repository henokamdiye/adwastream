import { NextRequest, NextResponse } from "next/server";

// ── Types matching @movie-web/providers output ────────────────────────────────
export interface StreamOutput {
  success: true;
  provider: string;
  streams: Array<{
    type: "hls" | "mp4" | "dash";
    url: string;
    quality?: string;
  }>;
  captions: Array<{
    language: string;
    url: string;
    type: string;
  }>;
}

export interface StreamError {
  success: false;
  error: string;
}

// ── Safely import providers (might not be installed yet) ─────────────────────
async function loadProviders() {
  try {
    const mod = await import("@movie-web/providers");
    return mod;
  } catch {
    return null;
  }
}

// ── Helper: fetch TMDB season/episode tmdbIds for TV shows ───────────────────
async function fetchTmdbIds(
  tmdbId: string,
  season: string,
  episode: string,
): Promise<{ seasonTmdbId?: number; episodeTmdbId?: number; episodeTitle?: string }> {
  const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
  if (!token) return {};

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?language=en-US`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return {};
    const data = await res.json();
    const ep = data.episodes?.find((e: any) => e.episode_number === parseInt(episode));
    return {
      seasonTmdbId: data.id,
      episodeTmdbId: ep?.id,
      episodeTitle: ep?.name,
    };
  } catch {
    return {};
  }
}

// ── Main route handler ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId    = searchParams.get("tmdbId") ?? searchParams.get("id");
  const type      = (searchParams.get("type") ?? "movie") as "movie" | "tv";
  const season    = searchParams.get("season") ?? "1";
  const episode   = searchParams.get("episode") ?? "1";
  const title     = searchParams.get("title") ?? "";
  const year      = searchParams.get("year") ?? new Date().getFullYear().toString();
  const imdbId    = searchParams.get("imdbId") ?? undefined;

  if (!tmdbId) {
    return NextResponse.json<StreamError>({ success: false, error: "tmdbId is required" }, { status: 400 });
  }

  // Load the provider library
  const mod = await loadProviders();
  if (!mod) {
    return NextResponse.json<StreamError>(
      { success: false, error: "Provider library not available. Run: npm install" },
      { status: 503 },
    );
  }

  const { makeProviders, makeStandardFetcher, targets } = mod as any;

  const providers = makeProviders({
    fetcher: makeStandardFetcher(fetch),
    target: targets.NATIVE ?? "native",
    consistentIpForRequests: false,
  });

  // Build the media object
  let media: any;

  if (type === "movie") {
    media = {
      type: "movie",
      title: title || "Unknown",
      releaseYear: parseInt(year),
      tmdbId,
      ...(imdbId ? { imdbId } : {}),
    };
  } else {
    // Fetch season/episode tmdbIds from TMDB for richer scraping
    const { seasonTmdbId, episodeTmdbId, episodeTitle } = await fetchTmdbIds(tmdbId, season, episode);

    media = {
      type: "show",
      title: title || "Unknown",
      releaseYear: parseInt(year),
      tmdbId,
      ...(imdbId ? { imdbId } : {}),
      season: {
        number: parseInt(season),
        tmdbId: String(seasonTmdbId ?? ""),
      },
      episode: {
        number: parseInt(episode),
        tmdbId: String(episodeTmdbId ?? ""),
        title: episodeTitle ?? "",
      },
    };
  }

  try {
    const result = await Promise.race([
      providers.runAll({ media }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)),
    ]);

    if (!result || !result.stream) {
      return NextResponse.json<StreamError>(
        { success: false, error: "No streams found from any provider" },
        { status: 422 },
      );
    }

    const stream = result.stream;

    // Normalise the stream output
    const streams: StreamOutput["streams"] = [];

    // HLS playlist
    if (stream.playlist) {
      streams.push({ type: "hls", url: stream.playlist, quality: "auto" });
    }

    // Direct MP4 / other qualities
    if (stream.qualities) {
      for (const [quality, info] of Object.entries(stream.qualities as Record<string, any>)) {
        if (info?.url) {
          streams.push({ type: info.type === "hls" ? "hls" : "mp4", url: info.url, quality });
        }
      }
    }

    // Captions
    const captions: StreamOutput["captions"] = (stream.captions ?? []).map((c: any) => ({
      language: c.language,
      url: c.url,
      type: c.type ?? "vtt",
    }));

    if (streams.length === 0) {
      return NextResponse.json<StreamError>(
        { success: false, error: "Stream found but no playable URLs extracted" },
        { status: 422 },
      );
    }

    return NextResponse.json<StreamOutput>({
      success: true,
      provider: result.sourceId ?? "unknown",
      streams,
      captions,
    });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown scrape error";
    const isTimeout = msg.includes("Timeout");
    return NextResponse.json<StreamError>(
      { success: false, error: isTimeout ? "Scraping timed out — try the embedded player" : msg },
      { status: isTimeout ? 408 : 422 },
    );
  }
}
