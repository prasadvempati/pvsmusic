// Syncs src/songs.js with the public uploads on the YouTube channel.
//
// Runs in GitHub Actions (see .github/workflows/sync-youtube.yml).
// Needs env YT_API_KEY — a YouTube Data API v3 key WITHOUT a website
// restriction (restrict it to "YouTube Data API v3" instead).
//
// Rules:
//  - Songs already in songs.js keep their title and language (your edits win).
//  - New uploads are added newest-first, language detected automatically.
//  - Videos that are deleted or made private are removed.
//  - src/song-overrides.json lets you hide videos or fix a language/title.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { detectLanguage, cleanTitle } from "./classify.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SONGS_FILE = path.join(ROOT, "src/songs.js");
const OVERRIDES_FILE = path.join(ROOT, "src/song-overrides.json");
const HANDLE = process.env.YT_HANDLE || "@pvs4001";
const KEY = process.env.YT_API_KEY;
const API = "https://www.googleapis.com/youtube/v3";

if (!KEY) {
  console.error("YT_API_KEY is not set");
  process.exit(1);
}

async function yt(endpoint, params) {
  const url = new URL(`${API}/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: KEY })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${endpoint} ${res.status}: ${await res.text()}`);
  return res.json();
}

function isoToSeconds(iso = "") {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}

// YouTube answers /shorts/ID with 200 for a Short and redirects otherwise.
async function isShort(id, seconds) {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${id}`, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.status === 200) return true;
    if (res.status >= 300 && res.status < 400) return false;
  } catch {}
  return seconds > 0 && seconds <= 60; // fallback
}

async function loadJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; }
}

async function main() {
  const current = (await import(pathToFileURL(SONGS_FILE).href + `?t=${Date.now()}`)).default;
  const overrides = await loadJson(OVERRIDES_FILE, { hide: [], language: {}, title: {} });
  const hidden = new Set(overrides.hide || []);

  // Existing entries: id -> { title, bucket }
  const known = new Map();
  for (const bucket of ["hindi", "english", "spanish", "shorts"]) {
    for (const s of current[bucket] || []) known.set(s.id, { title: s.title, bucket, lang: s.lang });
  }

  // 1. Channel -> uploads playlist
  const ch = await yt("channels", { part: "contentDetails", forHandle: HANDLE });
  const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error(`Channel ${HANDLE} not found`);

  // 2. All upload IDs
  const ids = [];
  let pageToken = "";
  do {
    const page = await yt("playlistItems", {
      part: "contentDetails", playlistId: uploads, maxResults: 50, ...(pageToken && { pageToken }),
    });
    for (const it of page.items || []) ids.push(it.contentDetails.videoId);
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  // Also re-check songs added by hand that aren't in uploads (e.g. unlisted)
  for (const id of known.keys()) if (!ids.includes(id)) ids.push(id);

  // 3. Details in batches of 50
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = await yt("videos", {
      part: "snippet,contentDetails,status", id: ids.slice(i, i + 50).join(","), maxResults: 50,
    });
    videos.push(...(batch.items || []));
  }

  const out = { hindi: [], english: [], spanish: [], shorts: [] };
  const added = [];
  const live = videos
    .filter((v) => v.status?.privacyStatus === "public" || (known.has(v.id) && v.status?.privacyStatus === "unlisted"))
    .filter((v) => v.snippet?.liveBroadcastContent === "none")
    .filter((v) => !hidden.has(v.id))
    .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));

  for (const v of live) {
    const prev = known.get(v.id);
    const sn = v.snippet;
    let bucket, title, lang;
    if (prev) {
      ({ bucket, title, lang } = prev);
      if (bucket === "shorts" && !lang) lang = detectLanguage({ title });
    } else {
      const seconds = isoToSeconds(v.contentDetails?.duration);
      bucket = (await isShort(v.id, seconds))
        ? "shorts"
        : detectLanguage({
            title: sn.title,
            description: sn.description,
            tags: sn.tags,
            audioLang: sn.defaultAudioLanguage || sn.defaultLanguage,
          });
      title = cleanTitle(sn.title);
      if (bucket === "shorts") {
        lang = detectLanguage({
          title: sn.title,
          description: sn.description,
          tags: sn.tags,
          audioLang: sn.defaultAudioLanguage || sn.defaultLanguage,
        });
      }
      added.push(`${bucket}${lang ? "/" + lang : ""}: ${title} (${v.id})`);
    }
    // Override: "shorts" moves a video to Shorts; a language sets the
    // section for full songs, or the language tab for a Short.
    const ov = overrides.language?.[v.id];
    if (ov === "shorts") bucket = "shorts";
    else if (ov && bucket === "shorts") lang = ov;
    else if (ov) bucket = ov;
    if (bucket === "shorts" && !lang) lang = detectLanguage({ title });
    if (overrides.title?.[v.id]) title = overrides.title[v.id];
    const entry = bucket === "shorts" ? { id: v.id, title, lang } : { id: v.id, title };
    (out[bucket] || out.english).push(entry);
  }

  const removed = [...known.keys()].filter((id) => !live.some((v) => v.id === id));

  // Safety stop: a bad API response must never empty the site.
  if (removed.length > 10 && removed.length > known.size * 0.2 && !process.env.ALLOW_MASS_REMOVE) {
    throw new Error(
      `Refusing to remove ${removed.length} of ${known.size} songs. ` +
      `If this is intended, re-run with ALLOW_MASS_REMOVE=1.`
    );
  }

  const fmt = (arr) =>
    arr
      .map((s) =>
        `  { id: "${s.id}", title: ${JSON.stringify(s.title)}${s.lang ? `, lang: "${s.lang}"` : ""} },`)
      .join("\n");
  const file = `// PVS Music – Song Catalog
// Updated automatically from YouTube by scripts/sync-youtube.mjs.
// To hide a video or fix a language/title, edit src/song-overrides.json.

const hindi = [
${fmt(out.hindi)}
];

const english = [
${fmt(out.english)}
];

const spanish = [
${fmt(out.spanish)}
];

// Shorts (lang = hindi | english | spanish)
const shorts = [
${fmt(out.shorts)}
];

const songs = { hindi, english, spanish, shorts };

export default songs;
`;

  const before = await fs.readFile(SONGS_FILE, "utf8");
  if (before === file) {
    console.log("No changes.");
    return;
  }
  await fs.writeFile(SONGS_FILE, file);
  console.log(`Added ${added.length}:`);
  added.forEach((a) => console.log("  + " + a));
  if (removed.length) console.log(`Removed ${removed.length}: ${removed.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
