import { useState, useEffect, useRef } from "react";
import { songs, channelInfo } from "./songs";

const TABS = [
  { key: "hindi", label: "हिंदी", sublabel: "Hindi" },
  { key: "english", label: "English", sublabel: "English" },
  { key: "spanish", label: "Español", sublabel: "Spanish" },
];

function MusicNote({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
    </svg>
  );
}

function SongCard({ song, index }) {
  const [hovered, setHovered] = useState(false);
  const isPlaceholder = song.youtubeId === "YOUTUBE_ID_HERE";

  return (
    <div
      className="song-card"
      style={{
        animationDelay: `${index * 80}ms`,
        "--card-index": index,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="thumbnail-wrap">
        {isPlaceholder ? (
          <div className="thumb-placeholder">
            <MusicNote style={{ width: 48, height: 48, opacity: 0.3 }} />
            <span>Coming Soon</span>
          </div>
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
              alt={song.title}
              className="thumb-img"
            />
            <div className={`play-overlay ${hovered ? "visible" : ""}`}>
              <a
                href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="play-btn"
                aria-label={`Play ${song.title} on YouTube`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </a>
            </div>
          </>
        )}
        <span className="year-tag">{song.year}</span>
      </div>
      <div className="card-body">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-desc">{song.description}</p>
        {!isPlaceholder && (
          <a
            href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="watch-link"
          >
            Watch on YouTube →
          </a>
        )}
      </div>
    </div>
  );
}

function SubscribeButton() {
  return (
    <a
      href={channelInfo.youtubeChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="subscribe-btn"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
      </svg>
      Subscribe on YouTube
    </a>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("hindi");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const currentSongs = songs[activeTab] || [];

  return (
    <div className={`site ${loaded ? "loaded" : ""}`}>
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grain" />
      </div>

      {/* Header */}
      <header className="site-header" ref={headerRef}>
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <MusicNote style={{ width: 28, height: 28 }} />
            </div>
            <div className="brand-text">
              <span className="brand-name">PVS Music</span>
              <span className="brand-tagline">Original Songs · Hindi · English · Español</span>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="about-toggle"
              onClick={() => setAboutOpen(!aboutOpen)}
              aria-expanded={aboutOpen}
            >
              About
            </button>
            <SubscribeButton />
          </div>
        </div>

        {/* About panel */}
        <div className={`about-panel ${aboutOpen ? "open" : ""}`}>
          <div className="about-content">
            <p>{channelInfo.aboutText}</p>
            <div className="about-links">
              <a href={channelInfo.youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
                YouTube @PVSMusic
              </a>
              <a href={channelInfo.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram @PVSMusic
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-line-1">Music Without</span>
          <span className="hero-line-2">Borders</span>
        </h1>
        <p className="hero-sub">Original compositions blending Bollywood soul, classical Raaga, and global sounds.</p>
      </section>

      {/* Language tabs */}
      <div className="tabs-bar">
        <div className="tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-primary">{tab.label}</span>
              {tab.key !== "hindi" && tab.key !== "english" && (
                <span className="tab-secondary">{tab.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Song grid */}
      <main className="song-grid-wrap">
        <div className="song-grid" key={activeTab}>
          {currentSongs.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} />
          ))}
          {currentSongs.length === 0 && (
            <div className="empty-state">
              <MusicNote style={{ width: 64, height: 64 }} />
              <p>Songs coming soon…</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} PVS Music · All rights reserved</span>
          <SubscribeButton />
        </div>
      </footer>
    </div>
  );
}
