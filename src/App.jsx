import { useState, useEffect, useRef } from "react";
import { channelInfo } from "./songs";

const YOUTUBE_API_KEY = "AIzaSyAKqCFsfA2Fm_X2dQ11qJEwlnOg9OKH34I";
const CHANNEL_HANDLE = "pvs4001";
const FETCH_OPTS = { referrerPolicy: "no-referrer-when-downgrade" };

const TABS = [
  { key: "all",     label: "All" },
  { key: "hindi",   label: "हिंदी",  sublabel: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Español", sublabel: "Spanish" },
];

function detectLanguage(title, description = "") {
  const combined = title + " " + description;
  const lower    = combined.toLowerCase();

  if (/#hindi\b/i.test(combined))                          return "hindi";
  if (/#spanish\b|#español\b|#espanol\b/i.test(combined)) return "spanish";
  if (/#english\b/i.test(combined))                        return "english";

  if (/[\u0900-\u097F]/.test(title)) return "hindi";

  const spanishMarkers = [
    "enamoré","enamore","amor ","corazón","corazon","siempre","vuelvo",
    "estrellas","quiero","contigo","también","tambien","cuando ","donde ",
    "alguien","almas","viento","regresa","llévate","llevate","perfecta",
    "sin ser","cada momento","tu amor","sin permiso","me miras","tu ritmo",
    "por qué","por que","sólo ","solo tuya","dime ","ahí ","ahi ",
    "persiguiéndote","persiguiendote","como la luz","amanecer","calla ",
    "regresar","no eres","tan per","llama tu","alguien como",
    "donde no","donde tú","donde tu","donde sopla","sólo tuya",
    "me llama","se me pega","ahí donde",
  ];
  if (spanishMarkers.some(w => lower.includes(w))) return "spanish";

  const hindiMarkers = [
    "teri ","tere ","meri ","mere ","dil ","pyar","mohabbat","ishq",
    "zindagi","yaad","raat ","aaj ","raag ","raaga","nasha","aadat",
    "rang ","raahein","baarein","aankhon","noor","khwaab","bahaaren",
    "lamhe","lamha","beawaaz","sama ","shafaq","jhanak","paayal",
    "tujhse","tumse","humse","saath","bikhar","chalun",
    "noor se","mujh pe","mujhpe","teri yaad","tere sang",
    "tumse mila","teri aankhon","rang tera","tu hi","tu hi meri",
    "tere lamhon","tere bina","teri yadon","rahe teri","ab main",
    "ye raat","mera hosh","dil mein","beawaz",
  ];
  if (hindiMarkers.some(w => lower.includes(w))) return "hindi";

  return "english";
}

function isShortVideo(snippet) {
  const title = (snippet.title       || "").toLowerCase();
  const desc  = (snippet.description || "").toLowerCase();
  const tags  = (snippet.tags        || []).join(" ").toLowerCase();
  return (
    title.includes("#shorts") || title.includes("#short") ||
    desc.includes("#shorts")  || desc.includes("#short")  ||
    tags.includes("#shorts")  || tags.includes("#short")
  );
}

function injectSongCatalogSchema(videos) {
  const existing = document.getElementById("schema-song-catalog");
  if (existing) existing.remove();
  if (!videos || videos.length === 0) return;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PVS Music – Full Song Catalog",
    "description": "All original songs by PVS Music in Hindi, English, and Spanish",
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicRecording",
        "name": video.title,
        "byArtist": { "@type": "MusicGroup", "name": "PVS Music" },
        "url": `https://www.youtube.com/watch?v=${video.id}`,
        "datePublished": new Date(video.publishedAt).getFullYear().toString(),
        "inLanguage":
          video.language === "hindi"   ? "hi" :
          video.language === "spanish" ? "es" : "en",
      },
    })),
  };
  const script = document.createElement("script");
  script.id = "schema-song-catalog";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(itemList);
  document.head.appendChild(script);
}

function MusicNote({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
    </svg>
  );
}

function SongCard({ video, index, isShort }) {
  const [hovered, setHovered] = useState(false);
  const youtubeUrl = isShort
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div
      className={`song-card ${isShort ? "song-card--short" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="thumbnail-wrap">
        <img src={video.thumbnail} alt={video.title} className="thumb-img" />
        <div className={`play-overlay ${hovered ? "visible" : ""}`}>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
              <path d="M8 5v14l11-7z" />
            </svg>
          </a>
        </div>
        <span className="year-tag">{new Date(video.publishedAt).getFullYear()}</span>
        {isShort && <span className="short-badge">SHORT</span>}
      </div>
      <div className="card-body">
        <h3 className="song-title">{video.title}</h3>
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="watch-link">
          {isShort ? "Watch Short →" : "Watch on YouTube →"}
        </a>
      </div>
    </div>
  );
}

function SubscribeButton() {
  return (
    <a href={channelInfo.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="subscribe-btn">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
      </svg>
      Subscribe on YouTube
    </a>
  );
}

export default function App() {
  const [activeTab,  setActiveTab]  = useState("all");
  const [formatMode, setFormatMode] = useState("videos");
  const [aboutOpen,  setAboutOpen]  = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [videos,     setVideos]     = useState([]);
  const [shorts,     setShorts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Prevents fetchAllVideos running twice in React 18 Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAllVideos();
    }
  }, []);

  async function fetchAllVideos() {
    try {
      setLoading(true);

      // ── Step 1: Get uploads playlist ID ──────────────────────────────────
      const channelRes  = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${YOUTUBE_API_KEY}`,
        FETCH_OPTS
      );
      const channelData = await channelRes.json();
      if (!channelData.items?.length) throw new Error("Channel not found");
      const uploadsPlaylistId =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // ── Step 2: Collect ALL playlist items one page at a time ─────────────
      const rawItems = [];
      let pageToken  = "";

      while (true) {
        const url =
          `https://www.googleapis.com/youtube/v3/playlistItems` +
          `?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}` +
          (pageToken ? `&pageToken=${pageToken}` : "");

        const res  = await fetch(url, FETCH_OPTS);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        (data.items || []).forEach(item => {
          const t = item.snippet.title;
          if (t !== "Private video" && t !== "Deleted video") {
            rawItems.push(item);
          }
        });

        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
      }

      // ── Step 3: Deduplicate by video ID ───────────────────────────────────
      const seen     = new Set();
      const allItems = rawItems.filter(item => {
        const id = item.snippet.resourceId.videoId;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // ── Step 4: Fetch video details in sequential batches of 50 ──────────
      const videoIds   = allItems.map(item => item.snippet.resourceId.videoId);
      const detailsMap = {};

      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50).join(",");
        const dRes  = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${batch}&key=${YOUTUBE_API_KEY}`,
          FETCH_OPTS
        );
        const dData = await dRes.json();
        if (dData.error) throw new Error(dData.error.message);

        (dData.items || []).forEach(v => {
          detailsMap[v.id] = {
            isShort:         isShortVideo(v.snippet),
            fullDescription: v.snippet.description || "",
          };
        });
      }

      // ── Step 5: Build final arrays, update state exactly once ─────────────
      const allVideos = [];
      const allShorts = [];

      allItems.forEach(item => {
        const id      = item.snippet.resourceId.videoId;
        const details = detailsMap[id] || { isShort: false, fullDescription: "" };

        const video = {
          id,
          title:       item.snippet.title,
          description: details.fullDescription,
          thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url,
          publishedAt: item.snippet.publishedAt,
          language:    detectLanguage(item.snippet.title, details.fullDescription),
        };

        if (details.isShort) allShorts.push(video);
        else                  allVideos.push(video);
      });

      setVideos(allVideos);
      setShorts(allShorts);
      injectSongCatalogSchema([...allVideos, ...allShorts]);

    } catch (err) {
      console.error("fetchAllVideos error:", err);
      setError("Could not load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const currentPool    = formatMode === "shorts" ? shorts : videos;
  const filteredVideos = activeTab === "all"
    ? currentPool
    : currentPool.filter(v => v.language === activeTab);

  const countFor = (tab, mode) => {
    const pool = mode === "shorts" ? shorts : videos;
    return tab === "all"
      ? pool.length
      : pool.filter(v => v.language === tab).length;
  };

  return (
    <div className={`site ${loaded ? "loaded" : ""}`}>
      <div className="ambient-bg">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="grain" />
      </div>

      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon"><MusicNote style={{ width: 28, height: 28 }} /></div>
            <div className="brand-text">
              <span className="brand-name">PVS Music</span>
              <span className="brand-tagline">Original Songs · Hindi · English · Español</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="about-toggle" onClick={() => setAboutOpen(!aboutOpen)} aria-expanded={aboutOpen}>About</button>
            <SubscribeButton />
          </div>
        </div>
        <div className={`about-panel ${aboutOpen ? "open" : ""}`}>
          <div className="about-content">
            <p>{channelInfo.aboutText}</p>
            <div className="about-links">
              <a href={channelInfo.youtubeChannelUrl} target="_blank" rel="noopener noreferrer">YouTube @pvs4001</a>
              <a href={channelInfo.instagramUrl}      target="_blank" rel="noopener noreferrer">Instagram @PVSMusic</a>
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-line-1">Music Without</span>
          <span className="hero-line-2">Borders</span>
        </h1>
        <p className="hero-sub">All original music. No covers, no remixes. Pure creative expression in Hindi, English, and Spanish — composed from the ground up.</p>
        {!loading && <p className="video-count">{videos.length} Songs · {shorts.length} Shorts</p>}
      </section>

      <div className="tabs-bar">
        <div className="tabs-row">
          <div className="tabs-inner">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="tab-primary">{tab.label}</span>
                {tab.sublabel && <span className="tab-secondary">{tab.sublabel}</span>}
                {!loading && <span className="tab-count">{countFor(tab.key, formatMode)}</span>}
              </button>
            ))}
          </div>
          <div className="format-toggle">
            <button className={`toggle-btn ${formatMode === "videos" ? "active" : ""}`} onClick={() => setFormatMode("videos")}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
              Videos
            </button>
            <button className={`toggle-btn ${formatMode === "shorts" ? "active" : ""}`} onClick={() => setFormatMode("shorts")}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              Shorts
            </button>
          </div>
        </div>
      </div>

      <main className="song-grid-wrap">
        {loading && (
          <div className="loading-state"><div className="spinner" /><p>Loading your music catalog…</p></div>
        )}
        {error && (
          <div className="empty-state"><MusicNote style={{ width: 48, height: 48 }} /><p>{error}</p></div>
        )}
        {!loading && !error && (
          <div
            className={`song-grid ${formatMode === "shorts" ? "song-grid--shorts" : ""}`}
            key={`${activeTab}-${formatMode}`}
          >
            {filteredVideos.map((video, i) => (
              <SongCard key={video.id} video={video} index={i} isShort={formatMode === "shorts"} />
            ))}
            {filteredVideos.length === 0 && (
              <div className="empty-state">
                <MusicNote style={{ width: 64, height: 64 }} />
                <p>No {formatMode === "shorts" ? "Shorts" : "songs"} in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} PVS Music · All rights reserved</span>
          <SubscribeButton />
        </div>
      </footer>
    </div>
  );
}
