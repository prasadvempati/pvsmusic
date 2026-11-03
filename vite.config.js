import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "https://www.pvsmusic.com";
const LANG_CODE = { hindi: "hi", english: "en", spanish: "es" };
const LANG_NAME = { hindi: "Hindi", english: "English", spanish: "Spanish" };

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Bakes the current song catalog into index.html at build time, so search
// engines (which don't run the React app) see every song, the right song
// count, and structured data. React replaces the static list on load.
function songCatalogSeo() {
  let songs;
  return {
    name: "song-catalog-seo",
    async buildStart() {
      const file = pathToFileURL(path.resolve("src/songs.js")).href;
      songs = (await import(`${file}?t=${Date.now()}`)).default;
    },
    transformIndexHtml(html) {
      const full = ["hindi", "english", "spanish"].flatMap((lang) =>
        songs[lang].map((s) => ({ ...s, lang }))
      );
      const items = full.map((s, i) => {
        const item = {
          "@type": "MusicRecording",
          name: s.title,
          byArtist: { "@type": "MusicGroup", name: "PVS Music" },
          url: `https://www.youtube.com/watch?v=${s.id}`,
          image: `https://i.ytimg.com/vi/${s.id}/hq720.jpg`,
          inLanguage: LANG_CODE[s.lang],
        };
        if (s.views) {
          item.interactionStatistic = {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WatchAction",
            userInteractionCount: s.views,
          };
        }
        return { "@type": "ListItem", position: i + 1, item };
      });
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "PVS Music – Full Song Catalog",
        description: "All original songs by PVS Music in Hindi, English, and Spanish",
        numberOfItems: full.length,
        itemListElement: items,
      };
      const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`;

      const section = (lang) => `
      <section>
        <h2>${LANG_NAME[lang]} songs</h2>
        <ul>${songs[lang]
          .map((s) => `<li><a href="https://www.youtube.com/watch?v=${s.id}">${esc(s.title)}</a></li>`)
          .join("")}</ul>
      </section>`;
      const shorts = `
      <section>
        <h2>Shorts</h2>
        <ul>${songs.shorts
          .map((s) => `<li><a href="https://www.youtube.com/shorts/${s.id}">${esc(s.title)}</a></li>`)
          .join("")}</ul>
      </section>`;
      const list = `
      <div class="prerender">
        <h1>PVS Music – Original Music. No Covers.</h1>
        <p>${full.length} original songs in Hindi, English &amp; Spanish — Bollywood soul, classical Raaga, and global sounds.</p>
        ${["hindi", "english", "spanish"].map(section).join("")}
        ${shorts}
      </div>`;

      return html
        .replaceAll("%SONG_COUNT%", String(full.length))
        .replace("<!--SONG_CATALOG_JSONLD-->", ld)
        .replace("<!--SONG_LIST_HTML-->", list);
    },
    // Keep sitemap lastmod current so Google re-crawls after new uploads.
    writeBundle(opts) {
      const out = path.join(opts.dir || "dist", "sitemap.xml");
      if (!fs.existsSync(out)) return;
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(out, fs.readFileSync(out, "utf8").replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`));
    },
  };
}

export default defineConfig({
  plugins: [react(), songCatalogSeo()],
});
