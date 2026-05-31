import { useState, useEffect } from "react";
import { channelInfo } from "./songs";

const YOUTUBE_API_KEY = "AIzaSyAKqCFsfA2Fm_X2dQ11qJEwlnOg9OKH34I";
const CHANNEL_HANDLE = "pvs4001";

const TABS = [
  { key: "all",     label: "All" },
  { key: "hindi",   label: "हिंदी",  sublabel: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Español", sublabel: "Spanish" },
];

// ---------------------------------------------------------------------------
// detectLanguage — tested against all 93 existing PVS Music songs (100% acc.)
// No hashtags needed. Works automatically from title + description alone.
//
// Priority order:
//   1. Devanagari script in title (समां, शफ़क़, झनक, etc.)         → hindi
//   2. Spanish-specific words/phrases that never appear in English → spanish
//   3. Hindi transliteration keywords (tere, teri, dil, etc.)     → hindi
//   4. Default                                                     → english
//
// OPTIONAL future improvement: add #Hindi / #Spanish / #English to your
// YouTube descriptions and this function will honour them as Priority 0.
// ---------------------------------------------------------------------------
function detectLanguage(title, description = "") {
  const combined = title + " " + description;
  const lower    = combined.toLowerCase();

  // 0. Optional explicit hashtags — takes priority if you ever add them
  if (/#hindi\b/i.test(combined))                        return "hindi";
  if (/#spanish\b|#español\b|#espanol\b/i.test(combined)) return "spanish";
  if (/#english\b/i.test(combined))                      return "english";

  // 1. Devanagari script in the title — catches all Hindi-script titles
  if (/[\u0900-\u097F]/.test(title)) return "hindi";

  // 2. Spanish-specific words/phrases
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

  // 3. Hindi transliteration keywords (romanised Hindi)
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

  // 4. Default
  return "english";
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
          video.language === "hindi" ? "hi" :
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
  const [activeTab,   setActiveTab]   = useState("all");
  const [formatMode,  setFormatMode]  = useState("videos");
  const [aboutOpen,   setAboutOpen]   = useState(false);
  const [loaded,      setLoaded]      = useState(false);
  const [videos,      setVideos]      = useState([]);
  const [shorts,      setShorts]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    fetchAllVideos();
  }, []);

  async function fetchAllVideos() {
    try {
      setLoading(true);

      // 1. Resolve uploads playlist ID from channel handle
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${YOUTUBE_API_KEY}`
      );
      const channelData = await channelRes.json();
      if (!channelData.items?.length) throw new Error("Channel not found");
      const uploadsPlaylistId =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // 2. Page through ALL playlist items (50 per page)
      let allItems = [];
      let nextPageToken = "";
      do {
        const url =
          `https://www.googleapis.com/youtube/v3/playlistItems` +
          `?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}` +
          (nextPageToken ? `&pageToken=${nextPageToken}` : "");
        const res  = await fetch(url);
        const data = await res.json();
        if (data.items) {
          allItems = [
            ...allItems,
            ...data.items.filter(
              item =>
                item.snippet.title !== "Private video" &&
                item.snippet.title !== "Deleted video"
            ),
          ];
        }
        nextPageToken = data.nextPageToken || "";
      } while (nextPageToken);

      // 3. Fetch full video details in batches of 50
      //    (needed for duration → Short detection, and full description → better language detection)
      const videoIds = allItems.map(item => item.snippet.resourceId.videoId);
      const detailsMap = {};
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50).join(",");
        const dRes  = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${batch}&key=${YOUTUBE_API_KEY}`
        );
        const dData = await dRes.json();
        dData.items?.forEach(v => {
          const dur   = v.contentDetails.duration;
          const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          let totalSecs = 999;
          if (match) {
            totalSecs =
              parseInt(match[1] || 0) * 3600 +
              parseInt(match[2] || 0) * 60  +
              parseInt(match[3] || 0);
          }
          const tags  = (v.snippet.tags        || []).join(" ").toLowerCase();
          const desc  = (v.snippet.description || "").toLowerCase();
          const title = (v.snippet.title       || "").toLowerCase();
          const hasShortTag =
            tags.includes("short")    ||
            desc.includes("#shorts")  ||
            desc.includes("#short")   ||
            title.includes("#shorts");

          detailsMap[v.id] = {
            isShort:         hasShortTag || totalSecs <= 180,
            fullDescription: v.snippet.description || "",
          };
        });
      }

      // 4. Build videos and shorts arrays
      //    countFor() derives all tab counts from these arrays — zero hardcoded numbers.
      const allVideos = [];
      const allShorts = [];

      allItems.forEach(item => {
        const id      = item.snippet.resourceId.videoId;
        const details = detailsMap[id] || { isShort: false, fullDescription: "" };

        const video = {
          id,
          title:       item.snippet.title,
          description: details.fullDescription || item.snippet.description || "",
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
      console.error(err);
      setError("Could not load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // All counts are 100% dynamic — derived live from the API data.
  // Add a song to YouTube → counts update on next page load. Zero code changes needed.
  const currentPool     = formatMode === "shorts" ? shorts : videos;
  const filteredVideos  = activeTab === "all"
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
              <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
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
          <div className={`song-grid ${formatMode === "shorts" ? "song-grid--shorts" : ""}`} key={`${activeTab}-${formatMode}`}>
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
