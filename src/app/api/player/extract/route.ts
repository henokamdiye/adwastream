import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ─── Timeout helper ───────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
    ),
  ]);
}

// ─── Construct source URLs ranked by yt-dlp compatibility ────────────────────
function buildSources(
  id: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): string[] {
  if (type === "movie") {
    return [
      `https://vidsrc.xyz/embed/movie/${id}`,
      `https://vidsrc.icu/embed/movie/${id}`,
      `https://vidsrc.to/embed/movie/${id}`,
      `https://embed.su/embed/movie/${id}`,
      `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`,
    ];
  }
  // TV
  const s = season ?? "1";
  const e = episode ?? "1";
  return [
    `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    `https://embed.su/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.cc/v3/embed/tv/${id}/${s}/${e}?autoPlay=false`,
  ];
}

// ─── Run yt-dlp on a single URL ───────────────────────────────────────────────
async function extractStream(sourceUrl: string): Promise<{
  url: string;
  title?: string;
  ext?: string;
  thumbnail?: string;
  isHls: boolean;
} | null> {
  try {
    const cmd = [
      "yt-dlp",
      "--no-warnings",
      "--no-playlist",
      "--no-simulate",
      "--socket-timeout", "12",
      "--retries", "1",
      "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best[protocol=m3u8_native]/best",
      "--merge-output-format", "mp4",
      "-j",  // dump JSON — does NOT download
      `"${sourceUrl}"`,
    ].join(" ");

    const { stdout } = await execAsync(cmd, { timeout: 25000 });

    const data = JSON.parse(stdout.trim().split("\n").pop()!); // last JSON line

    // Prefer a direct format URL; fall back to manifest
    let streamUrl: string | undefined;
    let ext = "mp4";
    let isHls = false;

    if (data.formats && Array.isArray(data.formats)) {
      // Pick best combined format that has a direct URL
      const combined = data.formats
        .filter((f: any) => f.url && (f.vcodec !== "none" || f.acodec !== "none"))
        .sort((a: any, b: any) => (b.tbr ?? b.abr ?? 0) - (a.tbr ?? a.abr ?? 0));

      // Prefer mp4 direct URL
      const mp4 = combined.find((f: any) => f.ext === "mp4" && f.url && !f.url.includes(".m3u8"));
      // Fallback to m3u8
      const hls = combined.find((f: any) => f.url?.includes(".m3u8") || f.protocol === "m3u8_native");
      // Absolute fallback
      const best = combined[0];

      if (mp4) {
        streamUrl = mp4.url;
        ext = "mp4";
        isHls = false;
      } else if (hls) {
        streamUrl = hls.url;
        ext = "m3u8";
        isHls = true;
      } else if (best?.url) {
        streamUrl = best.url;
        ext = best.ext ?? "mp4";
        isHls = best.url.includes(".m3u8") || best.protocol === "m3u8_native";
      }
    }

    // data.url is the top-level direct URL (for single-format extractors)
    if (!streamUrl && data.url) {
      streamUrl = data.url;
      isHls = data.url.includes(".m3u8");
      ext = isHls ? "m3u8" : "mp4";
    }

    if (!streamUrl) return null;

    return {
      url: streamUrl,
      title: data.title,
      ext,
      thumbnail: data.thumbnail,
      isHls,
    };
  } catch {
    return null;
  }
}

// ─── API handler ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = (searchParams.get("type") ?? "movie") as "movie" | "tv";
  const season = searchParams.get("season") ?? undefined;
  const episode = searchParams.get("episode") ?? undefined;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Check yt-dlp is available
  try {
    await execAsync("yt-dlp --version", { timeout: 5000 });
  } catch {
    return NextResponse.json(
      { error: "yt-dlp not found. Install it: pip install yt-dlp" },
      { status: 503 },
    );
  }

  const sources = buildSources(id, type, season, episode);

  // Try each source with a global timeout — first success wins
  for (const src of sources) {
    try {
      const result = await withTimeout(extractStream(src), 28000);
      if (result?.url) {
        return NextResponse.json({
          success: true,
          source: src,
          ...result,
        });
      }
    } catch {
      // timed out or errored — try next source
    }
  }

  return NextResponse.json(
    { error: "All sources failed extraction. Falling back to embedded player." },
    { status: 422 },
  );
}
