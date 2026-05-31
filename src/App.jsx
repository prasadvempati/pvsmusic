import { useState } from "react";
import songs from "./songs";

const TABS = [
  { key: "all",     label: "All" },
  { key: "hindi",   label: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Spanish" },
];

const allSongs = [...songs.hindi, ...songs.english, ...songs.spanish];

function getTabSongs(tab, isShorts) {
  if (isShorts) return songs.shorts;
  if (tab === "all") return allSongs;
  return songs[tab] || [];
}

function VideoCard({ id, title }) {
  const thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  const url   = `https://www.youtube.com/watch?v=${id}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="video-card"
    >
      <div className="thumb-wrap">
        <img src={thumb} alt={title} loading="lazy" />
        <div className="play-btn">▶</div>
      </div>
      <p className="video-title">{title}</p>
    </a>
  );
}

export default function App() {
  const [activeTab, setActiveTab]   = useState("all");
  const [showShorts, setShowShorts] = useState(false);

  const displaySongs = getTabSongs(activeTab, showShorts);

  const tabCount = (key) =>
    key === "all" ? allSongs.length : (songs[key] || []).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="site-title">🎵 PVS Music</h1>
        <p className="site-sub">Original songs in Hindi, English &amp; Spanish</p>
      </header>

      {/* Videos / Shorts toggle */}
      <div className="toggle-row">
        <button
          className={`toggle-btn ${!showShorts ? "active" : ""}`}
          onClick={() => setShowShorts(false)}
        >
          Videos
        </button>
        <button
          className={`toggle-btn ${showShorts ? "active" : ""}`}
          onClick={() => setShowShorts(true)}
        >
          Shorts {songs.shorts.length > 0 && `(${songs.shorts.length})`}
        </button>
      </div>

      {/* Language tabs — hidden when Shorts is active */}
      {!showShorts && (
        <nav className="tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
              <span className="tab-count">{tabCount(key)}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Grid */}
      <main className="grid">
        {displaySongs.length === 0 ? (
          <p className="empty">
            {showShorts
              ? "Shorts coming soon! Check back after uploading Shorts to YouTube."
              : "No songs found."}
          </p>
        ) : (
          displaySongs.map((song) => (
            <VideoCard key={song.id} id={song.id} title={song.title} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} PVS Music ·{" "}
          <a
            href="https://www.youtube.com/@pvs4001"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube @pvs4001
          </a>
        </p>
      </footer>
    </div>
  );
}
