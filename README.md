# 🎬 clips

**AI-powered YouTube clip downloader agent.**

Paste a YouTube URL + timestamps (exactly the way you described them to me) and it downloads the clips for you.

Works **100% free**. No paid services required.

---

## What it does

You give it either:

**Option A – Natural language (the format you originally used)**
```text
https://www.youtube.com/watch?v=ZO5aU97fwA4

1. The "Burning Man" Rant (Timestamp: 00:02:35 to 00:03:15)
2. The McDonald's "McFish" Order (00:48:43 to 00:49:55)
3. Shoveling Snow for a World Champion (01:17:32 to 01:18:25)
```

**Option B – Clean JSON**
```json
{
  "url": "https://www.youtube.com/watch?v=ZO5aU97fwA4",
  "clips": [
    { "name": "Burning_Man_Rant", "start": "2:35", "end": "3:15" },
    { "name": "McDonalds_McFish", "start": "48:43", "end": "49:55" },
    { "name": "Shoveling_Snow_Braddock", "start": "1:17:32", "end": "1:18:25" }
  ]
}
```

It then uses `yt-dlp` to cut each section and saves clean video files.

---

## Requirements (all free)

1. **Node.js 18+** → https://nodejs.org (LTS)
2. **yt-dlp** → https://github.com/yt-dlp/yt-dlp/releases  
   - Windows: just download `yt-dlp.exe` and put it in the same folder (or in PATH)
   - macOS: `brew install yt-dlp`
   - Linux: `pip install -U yt-dlp` or your package manager

That’s it. No API keys, no accounts, no paid anything.

---

## Install

```bash
git clone https://github.com/IloveChanel/clips.git
cd clips
npm install
```

On Windows, also download `yt-dlp.exe` from the releases page and drop it in the `clips` folder.

---

## Usage

### 1. Natural language job (recommended)

Save your list as a `.txt` file (see `examples/natural.txt`), then:

```bash
node bin/clips.js run examples/natural.txt
```

or

```bash
npm start -- run examples/natural.txt
```

### 2. JSON job

```bash
node bin/clips.js run examples/job.json
```

### 3. Quick one-off clip

```bash
node bin/clips.js quick "https://www.youtube.com/watch?v=ZO5aU97fwA4" 2:35 3:15 Burning_Man_Rant
```

### Options

- `-o, --output <dir>`   Output folder (default: `./output`)
- `-q, --quality <h>`    Max height (default: `720`)

Example:
```bash
node bin/clips.js run examples/job.json -o ./my-clips -q 1080
```

---

## Can this run for free in the cloud?

**Yes.** Here are the free options ranked from easiest → most “always-on”:

| Option | Free? | Notes |
|--------|-------|-------|
| **Your own PC** | ✅ Fully free | Best quality & speed. Just run the commands above. |
| **GitHub Codespaces** | ✅ Free tier | Open the repo in Codespaces and run it there. |
| **Railway.app** | ✅ Free $5 credit/month | Can host a simple web UI later if you want. |
| **Render.com** | ✅ Free tier | Good for a web frontend + backend. |
| **Fly.io** | ✅ Free allowance | Excellent for containers. |
| **Cloudflare Workers** | ✅ Free | Great for a frontend + API, but **not ideal for the actual downloading** (Workers have time & size limits). You would still run the heavy yt-dlp part on one of the services above or locally. |

**Recommendation right now:**  
Just run it **locally**. It’s free, fast, and you already have the folder `D:\clips`. Later if you want a nice web page where you paste the text and click “Download”, we can add a free frontend on Cloudflare Pages + a free backend on Railway/Render.

---

## Project structure

```
clips/
├── bin/clips.js          # CLI entry point
├── src/
│   ├── cli.js            # Commander CLI
│   ├── agent.js          # The actual downloader agent
│   └── parser.js         # Turns your natural text into structured jobs
├── examples/
│   ├── job.json
│   └── natural.txt
├── package.json
└── README.md
```

---

## Next steps (if you want)

- Web UI so you can paste the text in a browser
- Discord / Telegram bot version
- Automatic naming + thumbnail extraction
- Cloudflare Pages frontend + free backend

Just say the word and I’ll add it.

---

Made for you by Grok · Fully free · No accounts needed
