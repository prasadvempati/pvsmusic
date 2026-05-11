import { useState, useEffect } from "react";
import { channelInfo } from "./songs";

const YOUTUBE_API_KEY = "AIzaSyAKqCFsfA2Fm_X2dQ11qJEwlnOg9OKH34I";
const CHANNEL_HANDLE = "pvs4001";

const TABS = [
  { key: "all", label: "All Songs" },
  { key: "hindi", label: "हिंदी", sublabel: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Español", sublabel: "Spanish" },
];

function detectLanguage(title, description = "") {
  const text = (title + " " + description).toLowerCase();
  const hindiScript = /[\u0900-\u097F]/;
  const hindiWords = ["hindi", "dil", "pyar", "mohabbat", "tere", "mere", "tera", "mera", "aaj", "raat", "zindagi", "yaad", "ishq", "teri", "meri"];
  const spanishWords = ["español", "spanish", "amor", "corazón", "siempre", "mar ", "vida", "noche", "bella", "perfecta", "vuelvo", "estrellas", "quiero", "contigo", "tan ", "para ", "como "];

  if (hindiScript.test(title + description)) return "hindi";
  if (hindiWords.some(w => text.includes(w))) return "hindi";
  if (spanishWords.some(w => text.includes(w))) return "spanish";
  return "english";
}

function MusicNote({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
    </svg>
  );
}

function SongCard({ video, index }) {
  const [hovered, setHovered] = useState(false);
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;
  return (
    <div className="song-card" style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="thumbnail-wrap">
        <img src={video.thumbnail} alt={video.title} className="thumb-img" />
        <div className={`play-overlay ${hovered ? "visible" : ""}`}>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36"><path d="M8 5v14l11-7z" /></svg>
          </a>
        </div>
        <span className="year-tag">{new Date(video.publishedAt).getFullYear()}</span>
      </div>
      <div className="card-body">
        <h3 className="song-title">{video.title}</h3>
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="watch-link">Watch on YouTube →</a>
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
  const [activeTab, setActiveTab] = useState("all");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    fetchAllVideos();
  }, []);

  async function fetchAllVideos() {
    try {
      setLoading(true);
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${YOUTUBE_API_KEY}`
      );
      const channelData = await channelRes.json();
      if (!channelData.items?.length) throw new Error("Channel not found");
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

      let allVideos = [];
      let nextPageToken = "";
      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.items) {
          const batch = data.items
            .filter(item => item.snippet.title !== "Private video" && item.snippet.title !== "Deleted video")
            .map(item => ({
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
              publishedAt: item.snippet.publishedAt,
              language: detectLanguage(item.snippet.title, item.snippet.description),
            }));
          allVideos = [...allVideos, ...batch];
        }
        nextPageToken = data.nextPageToken || "";
      } while (nextPageToken);

      setVideos(allVideos);
    } catch (err) {
      setError("Could not load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const filteredVideos = activeTab === "all" ? videos : videos.filter(v => v.language === activeTab);

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
              <a href={channelInfo.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram @PVSMusic</a>
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
        {!loading && <p className="video-count">{videos.length} Original Songs</p>}
      </section>

      <div className="tabs-bar">
        <div className="tabs-inner">
          {TABS.map((tab) => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <span className="tab-primary">{tab.label}</span>
              {tab.sublabel && <span className="tab-secondary">{tab.sublabel}</span>}
              {!loading && <span className="tab-count">{tab.key === "all" ? videos.length : videos.filter(v => v.language === tab.key).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <main className="song-grid-wrap">
        {loading && <div className="loading-state"><div className="spinner" /><p>Loading your music catalog…</p></div>}
        {error && <div className="empty-state"><MusicNote style={{ width: 48, height: 48 }} /><p>{error}</p></div>}
        {!loading && !error && (
          <div className="song-grid" key={activeTab}>
            {filteredVideos.map((video, i) => <SongCard key={video.id} video={video} index={i} />)}
            {filteredVideos.length === 0 && <div className="empty-state"><MusicNote style={{ width: 64, height: 64 }} /><p>No songs in this category yet.</p></div>}
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
