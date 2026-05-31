import { useState } from "react";
import songs from "./songs";
import Admin from "./Admin";

const TABS = [
  { key: "all",     label: "All" },
  { key: "hindi",   label: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Spanish" },
];

const allSongs = [...songs.hindi, ...songs.english, ...songs.spanish];

function getDisplaySongs(tab, isShorts) {
  if (isShorts) return songs.shorts;
  if (tab === "all") return allSongs;
  return songs[tab] || [];
}

function tabCount(key) {
  if (key === "all") return allSongs.length;
  return (songs[key] || []).length;
}

function SongCard({ id, title, isShort }) {
  const [hovered, setHovered] = useState(false);
  const thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  const url   = `https://www.youtube.com/watch?v=${id}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`song-card${isShort ? " song-card--short" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="thumbnail-wrap">
        <img className="thumb-img" src={thumb} alt={title} loading="lazy" />
        <div className={`play-overlay${hovered ? " visible" : ""}`}>
          <div className="play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {isShort && <span className="short-badge">SHORT</span>}
      </div>
      <div className="card-body">
        <p className="song-title">{title}</p>
        <span className="watch-link">Watch on YouTube →</span>
      </div>
    </a>
  );
}

function MainSite() {
  const [activeTab,  setActiveTab]  = useState("all");
  const [showShorts, setShowShorts] = useState(false);

  const displaySongs = getDisplaySongs(activeTab, showShorts);

  return (
    <div className="site loaded">

      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grain" />
      </div>

      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            </div>
            <div>
              <span className="brand-name">PVS Music</span>
              <span className="brand-tagline">Original · Hindi · English · Spanish</span>
            </div>
          </div>
          <div className="header-actions">
            <a
              href="https://www.youtube.com/@pvs4001?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="subscribe-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"/>
              </svg>
              <span>Subscribe</span>
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-line-1">Original Music</span>
          <span className="hero-line-2">No Covers.</span>
        </h1>
        <p className="hero-sub">
          {allSongs.length} original songs in Hindi, English &amp; Spanish —
          Bollywood soul, classical Raaga, and global sounds.
        </p>
      </section>

      <div className="tabs-bar">
        <div className="tabs-row">
          <div className="tabs-inner">
            {!showShorts && TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? " active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                <span className="tab-primary">{label}</span>
                <span className="tab-count">{tabCount(key)}</span>
              </button>
            ))}
          </div>
          <div className="format-toggle">
            <button
              className={`toggle-btn${!showShorts ? " active" : ""}`}
              onClick={() => setShowShorts(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              Videos
            </button>
            <button
              className={`toggle-btn${showShorts ? " active" : ""}`}
              onClick={() => setShowShorts(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              Shorts
            </button>
          </div>
        </div>
      </div>

      <main className="song-grid-wrap">
        <div className={`song-grid${showShorts ? " song-grid--shorts" : ""}`}>
          {displaySongs.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <p>
                {showShorts
                  ? "Shorts coming soon — check back after uploading Shorts to YouTube."
                  : "No songs found."}
              </p>
            </div>
          ) : (
            displaySongs.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                title={song.title}
                isShort={showShorts}
              />
            ))
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} PVS Music — All songs original</span>
          <a
            href="https://www.youtube.com/@pvs4001"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube @pvs4001
          </a>
        </div>
      </footer>

    </div>
  );
}

// Simple client-side router — no react-router needed
export default function App() {
  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <Admin /> : <MainSite />;
}
