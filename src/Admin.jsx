import { useState, useEffect } from "react";
import songs from "./songs";

const ADMIN_PASSWORD = "pvs2026"; // Change this to your own password
const GITHUB_OWNER   = "prasadvempati";
const GITHUB_REPO    = "pvsmusic";
const GITHUB_FILE    = "src/songs.js";
const GITHUB_BRANCH  = "main";

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractYouTubeId(input) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

function buildSongsFile(current, newSong) {
  // Clone current songs
  const hindi   = [...current.hindi];
  const english = [...current.english];
  const spanish = [...current.spanish];
  const shorts  = [...current.shorts];

  if (newSong.type === "short") {
    shorts.unshift({ id: newSong.id, title: newSong.title });
  } else if (newSong.language === "hindi") {
    hindi.unshift({ id: newSong.id, title: newSong.title });
  } else if (newSong.language === "english") {
    english.unshift({ id: newSong.id, title: newSong.title });
  } else if (newSong.language === "spanish") {
    spanish.unshift({ id: newSong.id, title: newSong.title });
  }

  const fmt = (arr) =>
    arr.map((s) => `  { id: "${s.id}", title: "${s.title.replace(/"/g, '\\"')}" },`).join("\n");

  return `// PVS Music – Song Catalog
// To add a new song: use the Admin page at /admin
// YouTube ID is the part after ?v= in the URL.

const hindi = [
${fmt(hindi)}
];

const english = [
${fmt(english)}
];

const spanish = [
${fmt(spanish)}
];

// Shorts — vertical videos ≤60 seconds
const shorts = [
${fmt(shorts)}
];

const songs = { hindi, english, spanish, shorts };

export default songs;
`;
}

// ── Admin App ─────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed,      setAuthed]      = useState(false);
  const [password,    setPassword]    = useState("");
  const [pwError,     setPwError]     = useState("");

  const [url,         setUrl]         = useState("");
  const [title,       setTitle]       = useState("");
  const [language,    setLanguage]    = useState("english");
  const [type,        setType]        = useState("video");
  const [token,       setToken]       = useState(() => localStorage.getItem("gh_token") || "");
  const [previewId,   setPreviewId]   = useState("");
  const [status,      setStatus]      = useState(null); // null | "loading" | "success" | "error"
  const [statusMsg,   setStatusMsg]   = useState("");

  // Auto-extract ID when URL is pasted
  useEffect(() => {
    const id = extractYouTubeId(url.trim());
    setPreviewId(id || "");
  }, [url]);

  // ── Login ──
  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Wrong password. Try again.");
    }
  }

  // ── Save token ──
  function handleTokenSave() {
    localStorage.setItem("gh_token", token);
    setStatusMsg("Token saved!");
    setStatus("success");
    setTimeout(() => setStatus(null), 2000);
  }

  // ── Add Song ──
  async function handleAddSong(e) {
    e.preventDefault();
    if (!previewId) return setStatusMsg("Invalid YouTube URL or ID"), setStatus("error");
    if (!title.trim()) return setStatusMsg("Please enter a song title"), setStatus("error");
    if (!token.trim()) return setStatusMsg("GitHub token is required"), setStatus("error");

    setStatus("loading");
    setStatusMsg("Fetching current songs.js from GitHub…");

    try {
      // 1. Get current file + SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
      );
      if (!getRes.ok) throw new Error(`GitHub fetch failed: ${getRes.status} ${getRes.statusText}`);
      const fileData = await getRes.json();
      const sha = fileData.sha;

      setStatusMsg("Building updated songs.js…");

      // 2. Build new file content
      const newSong = { id: previewId, title: title.trim(), language, type };
      const newContent = buildSongsFile(songs, newSong);
      const encoded = btoa(unescape(encodeURIComponent(newContent)));

      // 3. Push to GitHub
      setStatusMsg("Pushing to GitHub…");
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Add song: ${title.trim()}`,
            content: encoded,
            sha,
            branch: GITHUB_BRANCH,
          }),
        }
      );
      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || `GitHub push failed: ${putRes.status}`);
      }

      setStatus("success");
      setStatusMsg(`✅ "${title.trim()}" added! Vercel is redeploying — live in ~60 seconds.`);
      setUrl("");
      setTitle("");
      setPreviewId("");
    } catch (err) {
      setStatus("error");
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  }

  // ── Login Screen ──
  if (!authed) {
    return (
      <div style={s.page}>
        <div style={s.loginBox}>
          <div style={s.loginIcon}>🎵</div>
          <h1 style={s.loginTitle}>PVS Music Admin</h1>
          <form onSubmit={handleLogin} style={s.form}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              autoFocus
            />
            {pwError && <p style={s.errorMsg}>{pwError}</p>}
            <button type="submit" style={s.primaryBtn}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Screen ──
  return (
    <div style={s.page}>
      <div style={s.adminBox}>

        {/* Header */}
        <div style={s.adminHeader}>
          <h1 style={s.adminTitle}>🎵 PVS Music Admin</h1>
          <a href="/" style={s.backLink}>← Back to site</a>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: "Hindi",   count: songs.hindi.length },
            { label: "English", count: songs.english.length },
            { label: "Spanish", count: songs.spanish.length },
            { label: "Shorts",  count: songs.shorts.length },
          ].map(({ label, count }) => (
            <div key={label} style={s.statCard}>
              <span style={s.statCount}>{count}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* GitHub Token */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>GitHub Token</h2>
          <p style={s.sectionDesc}>Required to push changes. Stored locally in your browser only.</p>
          <div style={s.row}>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{ ...s.input, flex: 1 }}
            />
            <button onClick={handleTokenSave} style={s.secondaryBtn}>Save</button>
          </div>
        </div>

        {/* Add Song Form */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Add New Song</h2>
          <form onSubmit={handleAddSong} style={s.form}>

            {/* URL */}
            <label style={s.label}>YouTube URL or Video ID</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=ABC123 or ABC123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={s.input}
            />

            {/* Preview */}
            {previewId && (
              <div style={s.preview}>
                <img
                  src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                  alt="thumbnail"
                  style={s.previewThumb}
                />
                <div>
                  <p style={s.previewId}>ID: <code>{previewId}</code></p>
                  <p style={s.previewOk}>✅ Valid YouTube ID detected</p>
                </div>
              </div>
            )}

            {/* Title */}
            <label style={s.label}>Song Title</label>
            <input
              type="text"
              placeholder="e.g. समां नया  or  When You Look at Me"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={s.input}
            />

            {/* Type */}
            <label style={s.label}>Type</label>
            <div style={s.toggleRow}>
              {["video", "short"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={type === t ? s.toggleActive : s.toggleInactive}
                >
                  {t === "video" ? "🎬 Video" : "📱 Short"}
                </button>
              ))}
            </div>

            {/* Language — only for videos */}
            {type === "video" && (
              <>
                <label style={s.label}>Language</label>
                <div style={s.toggleRow}>
                  {["hindi", "english", "spanish"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
                      style={language === l ? s.toggleActive : s.toggleInactive}
                    >
                      {l === "hindi" ? "🇮🇳 Hindi" : l === "english" ? "🇺🇸 English" : "🇪🇸 Spanish"}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={status === "loading" ? s.disabledBtn : s.primaryBtn}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Publishing…" : "➕ Add Song & Deploy"}
            </button>

          </form>

          {/* Status */}
          {status && status !== "loading" && (
            <div style={status === "success" ? s.successBox : s.errorBox}>
              {statusMsg}
            </div>
          )}
          {status === "loading" && (
            <div style={s.infoBox}>{statusMsg}</div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page:           { minHeight: "100vh", background: "#0a0a0c", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px", fontFamily: "'DM Sans', sans-serif", color: "#f0ece4" },
  loginBox:       { background: "#161619", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 400, textAlign: "center" },
  loginIcon:      { fontSize: 48, marginBottom: 16 },
  loginTitle:     { fontSize: "1.6rem", fontWeight: 700, color: "#e4c06e", marginBottom: 32 },
  adminBox:       { width: "100%", maxWidth: 640 },
  adminHeader:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  adminTitle:     { fontSize: "1.5rem", fontWeight: 700, color: "#e4c06e" },
  backLink:       { fontSize: "0.85rem", color: "#7a7570", textDecoration: "none" },
  statsRow:       { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 },
  statCard:       { background: "#161619", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, padding: "16px 12px", textAlign: "center" },
  statCount:      { display: "block", fontSize: "1.8rem", fontWeight: 700, color: "#c9a84c" },
  statLabel:      { display: "block", fontSize: "0.75rem", color: "#7a7570", marginTop: 4 },
  section:        { background: "#161619", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: 28, marginBottom: 24 },
  sectionTitle:   { fontSize: "1.1rem", fontWeight: 600, color: "#e4c06e", marginBottom: 8 },
  sectionDesc:    { fontSize: "0.82rem", color: "#7a7570", marginBottom: 16 },
  form:           { display: "flex", flexDirection: "column", gap: 16 },
  label:          { fontSize: "0.85rem", fontWeight: 500, color: "#7a7570" },
  input:          { background: "#0a0a0c", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, padding: "12px 16px", color: "#f0ece4", fontSize: "0.95rem", outline: "none", width: "100%" },
  row:            { display: "flex", gap: 10 },
  toggleRow:      { display: "flex", gap: 10, flexWrap: "wrap" },
  toggleActive:   { padding: "10px 20px", borderRadius: 999, background: "#c9a84c", color: "#0a0a0c", fontWeight: 600, fontSize: "0.88rem", border: "none", cursor: "pointer" },
  toggleInactive: { padding: "10px 20px", borderRadius: 999, background: "transparent", color: "#7a7570", fontWeight: 500, fontSize: "0.88rem", border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer" },
  primaryBtn:     { padding: "14px 24px", borderRadius: 999, background: "#c9a84c", color: "#0a0a0c", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", marginTop: 8 },
  secondaryBtn:   { padding: "12px 20px", borderRadius: 10, background: "transparent", color: "#c9a84c", fontWeight: 600, fontSize: "0.88rem", border: "1px solid rgba(201,168,76,0.4)", cursor: "pointer", whiteSpace: "nowrap" },
  disabledBtn:    { padding: "14px 24px", borderRadius: 999, background: "#4a4845", color: "#7a7570", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "not-allowed", marginTop: 8 },
  preview:        { display: "flex", gap: 16, alignItems: "center", background: "#0a0a0c", borderRadius: 10, padding: 12, border: "1px solid rgba(201,168,76,0.15)" },
  previewThumb:   { width: 120, borderRadius: 8, flexShrink: 0 },
  previewId:      { fontSize: "0.82rem", color: "#7a7570", marginBottom: 6 },
  previewOk:      { fontSize: "0.82rem", color: "#34c759" },
  successBox:     { marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.3)", color: "#34c759", fontSize: "0.88rem" },
  errorBox:       { marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "#ff3b30", fontSize: "0.88rem" },
  infoBox:        { marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c", fontSize: "0.88rem" },
  errorMsg:       { color: "#ff3b30", fontSize: "0.85rem", margin: "4px 0" },
};
