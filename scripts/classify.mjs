// Language detection and title cleanup for new YouTube uploads.

const DEVANAGARI = /[ऀ-ॿ]/;
const SPANISH_CHARS = /[ñáéíóú¿¡]/i;

const ES_WORDS = new Set(`el la los las un una de del que y en mi mis tu tus te me se lo
  sin por con para cuando donde dónde como cómo amor corazón eres soy estás está alma
  vida noche luz cielo beso besos quiero siento contigo conmigo nunca siempre otra vez
  vuelve regresa ritmo tan ahí sólo solo tuya tuyo mío mía nadie alguien llama dime
  mundo sueño destino tarde silencio final baila báilame latido canción`.split(/\s+/));

const EN_WORDS = new Set(`the you your i i'm me my mine love heart of in on to and is
  are be it this that what when where with without all only one just always never
  still feel fall night eyes into away stay know like found everything moment
  someday forever prayer smile heart whispers wind`.split(/\s+/));

const HINDI_HINTS = /\b(hindi|bollywood|raag|raga|ghazal|hindi song)\b/i;
const SPANISH_HINTS = /\b(spanish|español|espanol|latin|latino|bachata|reggaeton|canción)\b/i;
const ENGLISH_HINTS = /\b(english song|english)\b/i;

function score(text) {
  const words = text.toLowerCase().replace(/[^\p{L}\s']/gu, " ").split(/\s+/).filter(Boolean);
  let es = 0, en = 0;
  for (const w of words) {
    if (ES_WORDS.has(w)) es++;
    if (EN_WORDS.has(w)) en++;
  }
  if (SPANISH_CHARS.test(text)) es += 2;
  return { es, en };
}

export function detectLanguage({ title = "", description = "", tags = [], audioLang = "" }) {
  const lang = (audioLang || "").toLowerCase();
  if (lang.startsWith("hi")) return "hindi";
  if (lang.startsWith("es")) return "spanish";

  if (DEVANAGARI.test(title)) return "hindi";

  const hints = `${description} ${tags.join(" ")}`;
  // Lyrics in Devanagari in the description are a strong Hindi signal
  if ((description.match(/[ऀ-ॿ]/g) || []).length > 20) return "hindi";
  if (HINDI_HINTS.test(hints) && !SPANISH_HINTS.test(hints)) return "hindi";
  if (SPANISH_HINTS.test(hints) && !ENGLISH_HINTS.test(hints)) return "spanish";

  // Title counts double, description (often lyrics) breaks ties
  const t = score(title);
  const d = score(description.slice(0, 1500));
  const es = t.es * 2 + d.es;
  const en = t.en * 2 + d.en;
  if (es > en) return "spanish";
  if (lang.startsWith("en") || en > 0) return "english";
  return "english";
}

export function cleanTitle(raw = "") {
  let t = raw
    .replace(/#[\p{L}\p{N}_]+/gu, "")                       // hashtags
    .replace(/[\(\[][^\)\]]*(official|video|audio|lyric|song|music|pvs)[^\)\]]*[\)\]]/gi, "")
    .split(/\s[|•｜]\s?|\s[-–—]\s(?=.*(pvs|song|music|official|hindi|english|spanish))/i)[0]
    .replace(/\s{2,}/g, " ")
    .trim();
  return t || raw.trim();
}
