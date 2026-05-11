// PVS Music Song Catalog
// To add a new song: copy one object, fill in the details, add to the correct language array.
// youtubeId: the part after "watch?v=" in the YouTube URL
// e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ → youtubeId: "dQw4w9WgXcQ"

export const songs = {
  hindi: [
    {
      id: "h1",
      title: "Dil Ki Baat",
      description: "A soulful Bollywood ballad about unspoken emotions",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2024,
    },
    {
      id: "h2",
      title: "Raag Yaman",
      description: "Classical Raaga-based composition in Raag Yaman",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2024,
    },
    {
      id: "h3",
      title: "Teri Yaadein",
      description: "Melodic Hindi song with a cinematic feel",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2025,
    },
  ],
  english: [
    {
      id: "e1",
      title: "Echoes",
      description: "An English original with lush production",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2024,
    },
    {
      id: "e2",
      title: "Midnight Rain",
      description: "Atmospheric English ballad",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2025,
    },
  ],
  spanish: [
    {
      id: "s1",
      title: "Tan Perfecta",
      description: "Un romántico original en español",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2024,
    },
    {
      id: "s2",
      title: "Siempre Vuelvo",
      description: "Canción emotiva sobre el regreso al amor",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2025,
    },
    {
      id: "s3",
      title: "Mar de Estrellas",
      description: "Una balada poética bajo el cielo nocturno",
      youtubeId: "YOUTUBE_ID_HERE",
      year: 2025,
    },
  ],
};

export const channelInfo = {
  youtubeChannelUrl: "https://www.youtube.com/@PVSMusic",
  instagramUrl: "https://www.instagram.com/PVSMusic",
  aboutText:
    "PVS Music is an original music brand creating songs in Hindi, English, and Spanish — blending Bollywood soul, classical Raaga roots, and contemporary global sounds. Every song is an authentic expression, produced with passion and AI-assisted composition through Suno AI.",
};
