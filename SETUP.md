# AdwaStream — Setup Guide

## Prerequisites

### 1. Node.js & npm
```bash
node -v   # >= 18
npm install
```

### 2. yt-dlp (required for ad-free streaming)
yt-dlp must be installed and available in your system `PATH`.

**macOS / Linux:**
```bash
pip install yt-dlp
# or
brew install yt-dlp
# or direct binary:
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod +x /usr/local/bin/yt-dlp
```

**Windows:**
```powershell
winget install yt-dlp
# or via pip:
pip install yt-dlp
```

**Verify:**
```bash
yt-dlp --version
```

### 3. ffmpeg (recommended — needed for merging video+audio tracks)
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
winget install ffmpeg
```

---

## Environment Variables
Copy `.env.local.example` → `.env.local` and fill in:
```env
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=your_tmdb_token
# ... other vars from .env.example
```

---

## How Ad-Free Streaming Works

```
User opens player
       │
       ▼
GET /api/player/extract?id=&type=
       │
       ▼
  yt-dlp probes sources in order:
  1. vidsrc.xyz  → try
  2. vidsrc.icu  → try
  3. vidsrc.to   → try
  4. embed.su    → try
  5. vidsrc.cc   → try
       │
       ▼ (first success)
  Returns { url, isHls, ext }
       │
  ┌────┴───────────────────────┐
  │   isHls?                   │
  │   YES → HLS.js player      │
  │   NO  → native <video>     │
  └────────────────────────────┘
       │ (all fail? 422)
       ▼
  Fallback: embedded iframe
  (AdsWarning modal shown)
```

Extraction typically takes **5–25 seconds** depending on source availability.
If yt-dlp is not installed, the player transparently falls back to the iframe embeds.

---

## Development
```bash
npm run dev
```

## Production
```bash
npm run build
npm start
```
