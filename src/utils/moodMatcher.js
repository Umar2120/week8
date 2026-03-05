const MOOD_PROFILES = [
  {
    id: "feelgood",
    label: "Feel-Good",
    genres: [35, 10751, 16],
    keywords: ["happy", "fun", "light", "feel good", "uplifting", "smile", "chill", "warm", "cozy", "comfort"],
  },
  {
    id: "adrenaline",
    label: "Adrenaline Rush",
    genres: [28, 53, 80],
    keywords: ["action", "intense", "fast", "adrenaline", "thrill", "explosive", "fight", "edge", "wild"],
  },
  {
    id: "mindbender",
    label: "Mind-Bending",
    genres: [878, 9648, 53],
    keywords: ["mind", "twist", "smart", "brain", "puzzle", "mystery", "sci", "space", "deep", "complex"],
  },
  {
    id: "dark",
    label: "Dark & Gritty",
    genres: [80, 53, 27],
    keywords: ["dark", "gritty", "serious", "crime", "revenge", "noir", "violent", "raw", "brooding"],
  },
  {
    id: "romantic",
    label: "Romantic",
    genres: [10749, 18, 35],
    keywords: ["love", "romance", "date", "romantic", "relationship", "sweet", "heart", "chemistry"],
  },
  {
    id: "epic",
    label: "Epic Adventure",
    genres: [12, 14, 28],
    keywords: ["epic", "adventure", "journey", "fantasy", "world", "legend", "myth", "heroic"],
  },
  {
    id: "emotional",
    label: "Emotional Drama",
    genres: [18, 36, 10752],
    keywords: ["emotional", "drama", "real", "sad", "deep", "human", "powerful", "touching"],
  },
  {
    id: "scary",
    label: "Scary Night",
    genres: [27, 53, 9648],
    keywords: ["horror", "scary", "fear", "ghost", "creepy", "haunted", "nightmare", "terror"],
  },
];

export const GENRE_NAME_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10751: "Family",
  10752: "War",
  36: "History",
};

const QUICK_MOODS = [
  "I want something fun and light",
  "Give me intense action",
  "I want a smart sci-fi thriller",
  "I feel like watching romance",
  "I want something dark and serious",
  "Scare me tonight",
];

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MOOD_AI_PROVIDER = (import.meta.env.VITE_MOOD_AI_PROVIDER || "auto").toLowerCase();

function scoreProfile(input, profile) {
  const text = input.toLowerCase();
  return profile.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
}

function sanitizeGenreIds(ids = []) {
  return ids
    .filter((id) => Number.isFinite(Number(id)) && GENRE_NAME_MAP[Number(id)])
    .map((id) => Number(id))
    .filter((id, index, list) => list.indexOf(id) === index)
    .slice(0, 4);
}

function parseJsonSafely(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeResult(input, payload, provider) {
  const genreIds = sanitizeGenreIds(payload?.genreIds || []);
  if (!genreIds.length) return null;

  const confidence = Number(payload?.confidence);
  const boundedConfidence = Number.isFinite(confidence) ? Math.max(40, Math.min(99, confidence)) : 72;

  return {
    success: true,
    input: (input || "").trim(),
    profileLabel: payload?.profileLabel || "AI Match",
    confidence: boundedConfidence,
    genreIds,
    engine: provider,
  };
}

async function askOpenAI(input) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You map movie mood text to TMDB genre ids. Return strict JSON: {\"profileLabel\": string, \"confidence\": number 0-100, \"genreIds\": number[]}. Use only ids: 28,12,16,35,80,18,14,27,9648,10749,878,53,10751,10752,36.",
        },
        { role: "user", content: input },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const parsed = parseJsonSafely(raw);
  return normalizeResult(input, parsed, "openai");
}

async function askGemini(input) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: input }] }],
        systemInstruction: {
          parts: [
            {
              text: "Map movie mood text to TMDB genre ids. Return strict JSON with fields profileLabel, confidence, genreIds. Allowed ids: 28,12,16,35,80,18,14,27,9648,10749,878,53,10751,10752,36.",
            },
          ],
        },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = parseJsonSafely(raw);
  return normalizeResult(input, parsed, "gemini");
}

export function matchMoodToGenres(input) {
  const cleaned = (input || "").trim();
  if (!cleaned) {
    return {
      success: false,
      message: "Describe your mood in a few words to get AI matches.",
    };
  }

  const scored = MOOD_PROFILES.map((profile) => ({
    ...profile,
    score: scoreProfile(cleaned, profile),
  })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const fallback = MOOD_PROFILES.find((profile) => profile.id === "feelgood");
  const chosen = top.score > 0 ? top : fallback;
  const secondary = scored.find((profile) => profile.id !== chosen.id && profile.score > 0);

  const genreIds = [...chosen.genres, ...(secondary ? secondary.genres : [])].filter(
    (genreId, index, list) => list.indexOf(genreId) === index,
  );

  return {
    success: true,
    input: cleaned,
    profileLabel: chosen.label,
    confidence: Math.min(95, 55 + chosen.score * 12 + (secondary ? 8 : 0)),
    genreIds: genreIds.slice(0, 4),
    engine: "local",
  };
}

export async function matchMoodToGenresAI(input) {
  const cleaned = (input || "").trim();
  if (!cleaned) return matchMoodToGenres(cleaned);

  try {
    if ((MOOD_AI_PROVIDER === "openai" || MOOD_AI_PROVIDER === "auto") && OPENAI_KEY) {
      const result = await askOpenAI(cleaned);
      if (result) return result;
    }

    if ((MOOD_AI_PROVIDER === "gemini" || MOOD_AI_PROVIDER === "auto") && GEMINI_KEY) {
      const result = await askGemini(cleaned);
      if (result) return result;
    }
  } catch {
    // Fall back to local matching when external AI call fails.
  }

  return matchMoodToGenres(cleaned);
}

export const moodSuggestions = QUICK_MOODS;
