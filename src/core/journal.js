const MOOD_WORDS = {
  "very good": ["very_good", 9],
  "very happy": ["very_good", 10],
  "very excited": ["very_good", 10],
  "joyful": ["very_good", 10],
  "proud": ["very_good", 9],
  "fantastic": ["very_good", 9],
  "wonderful": ["very_good", 9],
  "elated": ["very_good", 9],
  "happy": ["good", 8],
  "delighted": ["good", 8],
  "grateful": ["good", 8],
  "loved it": ["good", 8],
  "content": ["good", 8],
  "fun": ["good", 8],
  "calm": ["calm", 7],
  "relaxed": ["calm", 7],
  "peaceful": ["calm", 7],
  "serene": ["calm", 7],
  "easy": ["calm", 7],
  "theek": ["calm", 7],
  "sukh": ["good", 10],
  "aaram": ["calm", 8],
  "mast": ["good", 9],
  "khush": ["good", 9],
  "mast laga": ["good", 8],
  "great": ["good", 7],
  "good": ["good", 7],
  "ok": ["okay", 6],
  "okay": ["okay", 6],
  "fine": ["okay", 6],
  "normal": ["okay", 6],
  "steady": ["okay", 6],
  "average": ["okay", 5],
  "tired": ["low", 2],
  "exhausted": ["low", 2],
  "sleepy": ["low", 2],
  "meh": ["low", 1],
  "bored": ["low", 1],
  "sad": ["sad", 3],
  "unhappy": ["sad", 3],
  "depressed": ["sad", 3],
  "lonely": ["sad", 3],
  "crying": ["sad", 3],
  "down": ["sad", 2],
  "upset": ["sad", 2],
  "stressed": ["stressed", 1],
  "anxious": ["stressed", 1],
  "anxiety": ["stressed", 1],
  "worried": ["stressed", 1],
  "nervous": ["stressed", 1],
  "overwhelmed": ["stressed", 1],
  "tension": ["stressed", 1],
  "chinta": ["stressed", 1],
};

const MOOD_SCORE = {
  very_good: 10,
  good: 8,
  calm: 7,
  okay: 6,
  low: 2,
  sad: 3,
  stressed: 1,
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "it", "to", "of", "in", "on",
  "at", "for", "me", "my", "i", "we", "you", "so", "very", "its", "am",
  "are", "was", "were", "been", "this", "that", "then", "now", "today",
  "as", "with", "not", "no", "yes", "if", "when", "how", "do", "did",
  "does", "from", "by", "about", "into", "like", "just", "only", "some",
  "any", "all", "can", "could", "would", "should", "will", "way", "got",
  "have", "has", "had", "feel", "feeling", "ok", "fine", "nothing",
]);

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(text) {
  if (!text || typeof text !== "string") {
    return { mood: null, score: 0, tags: [] };
  }
  const hay = normalize(text);
  if (!hay) {
    return { mood: null, score: 0, tags: [] };
  }
  const found = [];
  for (const [word, [mood, weight]] of Object.entries(MOOD_WORDS)) {
    if (hay.includes(word)) {
      found.push({ mood, weight, word });
    }
  }
  if (found.length === 0) {
    return { mood: null, score: 0, tags: [] };
  }
  found.sort((a, b) => b.weight - a.weight || a.word.localeCompare(b.word));
  const top = found[0];
  return { mood: top.mood, score: top.weight, tags: found.slice(0, 3).map((f) => f.word) };
}

let seq = 0;

function createEntry(ts, text) {
  const s = scoreEntry(text);
  seq += 1;
  const ms = Number(ts);
  const d = new Date(Number.isFinite(ms) ? ms : Date.now());
  return {
    id: "pw-" + d.getTime().toString(36) + "-" + seq.toString(36),
    ts: d.getTime(),
    date: d.toISOString().slice(0, 10),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    text: typeof text === "string" ? text : "",
    mood: s.mood,
    score: s.score,
    tags: s.tags,
  };
}

function addEntry(entries, entry) {
  const list = Array.isArray(entries) ? entries.slice() : [];
  list.push(entry);
  list.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return list;
}

function removeEntry(entries, id) {
  return (entries || []).filter((e) => !e || e.id !== id);
}

function computeRecap(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const byDate = new Map();
  for (const e of list) {
    const d = e && e.date ? String(e.date) : "";
    if (!d) continue;
    byDate.set(d, (byDate.get(d) || 0) + 1);
  }
  const dates = [...byDate.keys()].sort();

  let streakDays = 0;
  if (dates.length > 0) {
    streakDays = 1;
    for (let i = dates.length - 2; i >= 0; i -= 1) {
      const gap = (new Date(dates[i + 1]) - new Date(dates[i])) / 86400000;
      if (gap === 1) {
        streakDays += 1;
      } else {
        break;
      }
    }
  }

  const totalScore = list.reduce((sum, e) => sum + (e && e.mood ? MOOD_SCORE[e.mood] || 0 : 0), 0);
  const averageMood = list.length > 0 ? Math.round((totalScore / list.length) * 10) / 10 : 0;

  const counts = new Map();
  for (const e of list) {
    for (const w of normalize(e && e.text ? e.text : "").split(" ")) {
      if (!w || STOPWORDS.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  const topWords = [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([w, c]) => [w, c]);

  return {
    totalEntries: list.length,
    daysActive: dates.length,
    streakDays,
    averageMood,
    topWords,
  };
}

function recapToText(r) {
  const lines = [
    "Patchwork weekly recap",
    "Entries: " + r.totalEntries + " · Days active: " + r.daysActive + " · Streak: " + r.streakDays + " day(s)",
  ];
  if (r.averageMood > 0) {
    lines.push("Average mood: " + r.averageMood + "/10");
  }
  if (r.topWords.length > 0) {
    lines.push("Top words: " + r.topWords.map((w) => w[0]).join(", "));
  }
  return lines.join("\n");
}

module.exports = {
  scoreEntry,
  computeRecap,
  createEntry,
  addEntry,
  removeEntry,
  recapToText,
  MOOD_SCORE,
  MOOD_WORDS,
};
