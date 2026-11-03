import { useState, useMemo } from "react";
import songs from "./songs";

const TABS = [
  { key: "all",     label: "All" },
  { key: "hindi",   label: "Hindi" },
  { key: "english", label: "English" },
  { key: "spanish", label: "Spanish" },
];

const allSongs = [...songs.hindi, ...songs.english, ...songs.spanish];

function getDisplaySongs(tab, isShorts) {
  if (isShorts) {
    if (tab === "all") return songs.shorts;
    return songs.shorts.filter((s) => s.lang === tab);
  }
  if (tab === "all") return allSongs;
  return songs[tab] || [];
}

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "views",  label: "Most viewed" },
];

function matches(song, q) {
  return !q || song.title.toLowerCase().includes(q);
}

function applyView(list, q, sort) {
  const filtered = list.filter((s) => matches(s, q));
  if (sort === "views") return [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
  return filtered;
}

function initialSearch() {
  try { return new URLSearchParams(window.location.search).get("search") || ""; }
  catch { return ""; }
}

// Sharpest thumbnails first. Shorts use the vertical 1080x1920 frame (oar2);
// videos use 1280x720 (hq720). If YouTube lacks one it serves a 120x90
// grey placeholder instead of an error, so we check the size and step down.
const THUMB_SIZES = {
  short: ["oar2", "hq720", "hqdefault"],
  video: ["hq720", "sddefault", "hqdefault"],
};

function formatViews(n) {
  if (!n) return "";
  const fmt = (v, unit) => `${v >= 100 ? Math.round(v) : +v.toFixed(1)}${unit}`;
  if (n >= 1e9) return fmt(n / 1e9, "B") + " views";
  if (n >= 1e6) return fmt(n / 1e6, "M") + " views";
  if (n >= 1e3) return fmt(n / 1e3, "K") + " views";
  return `${n} view${n === 1 ? "" : "s"}`;
}

function SongCard({ id, title, isShort, views }) {
  const [hovered, setHovered] = useState(false);
  const sizes = THUMB_SIZES[isShort ? "short" : "video"];
  const [sizeIdx, setSizeIdx] = useState(0);
  const thumb = `https://i.ytimg.com/vi/${id}/${sizes[sizeIdx]}.jpg`;
  const tryNext = () => setSizeIdx((i) => (i < sizes.length - 1 ? i + 1 : i));
  const url   = isShort
    ? `https://www.youtube.com/shorts/${id}`
    : `https://www.youtube.com/watch?v=${id}`;

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
        <img
          className="thumb-img"
          src={thumb}
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120) tryNext(); }}
          onError={tryNext}
        />
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
        <div className="card-meta">
          {views ? <span className="view-count">{formatViews(views)}</span> : null}
          <span className="watch-link">Watch on YouTube →</span>
        </div>
      </div>
    </a>
  );
}

function MainSite() {
  const [activeTab,  setActiveTab]  = useState("all");
  const [showShorts, setShowShorts] = useState(false);

  const [query,      setQuery]      = useState(initialSearch);
  const [sort,       setSort]       = useState("newest");
  const q = query.trim().toLowerCase();

  const displaySongs = useMemo(
    () => applyView(getDisplaySongs(activeTab, showShorts), q, sort),
    [activeTab, showShorts, q, sort]
  );
  const tabCount = (key) => getDisplaySongs(key, showShorts).filter((s) => matches(s, q)).length;

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
            {TABS.map(({ key, label }) => (
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

      <div className="controls-row">
        <label className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search songs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search songs"
          />
        </label>
        <div className="format-toggle" role="group" aria-label="Sort">
          {SORTS.map(({ key, label }) => (
            <button
              key={key}
              className={`toggle-btn${sort === key ? " active" : ""}`}
              onClick={() => setSort(key)}
            >
              {label}
            </button>
          ))}
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
                {q ? `No songs match “${query.trim()}”.` : "No songs found."}
              </p>
            </div>
          ) : (
            displaySongs.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                title={song.title}
                views={song.views}
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

export default function App() {
  return <MainSite />;
}
