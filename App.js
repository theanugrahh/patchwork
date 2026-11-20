import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import {
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioRecorder,
  RecordingPresets,
} from "expo-audio";
import Wave from "./src/Wave";
import WeekWave from "./src/WeekWave";
import { MicIcon, PlayIcon } from "./src/icons";

const journal = require("./src/core/journal");

let metaFileRef = "unset";
let dirRef = "unset";

function getMetaFile() {
  if (metaFileRef === "unset") {
    try {
      metaFileRef = Paths.document
        ? new File(Paths.document, "Patchwork", "entries.json")
        : null;
    } catch (e) {
      metaFileRef = null;
    }
  }
  return metaFileRef;
}

const C = {
  paper: "#F8F4EA",
  surface: "#FFFFFF",
  ink: "#1D1A16",
  muted: "#8C7D68",
  hairline: "rgba(29, 26, 22, 0.07)",
  accent: "#8B4513",
  mutedIcon: "#6B6B6B",
  onAccent: "#FFFFFF",
  errorBg: "#FBE6E1",
  errorText: "#A23717",
};

const MOOD_LABELS = {
  very_good: "very good",
  good: "good",
  calm: "calm",
  okay: "okay",
  low: "low energy",
  sad: "sad",
  stressed: "stressed",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function loadEntries() {
  const file = getMetaFile();
  if (!file) return [];
  let raw = null;
  try {
    raw = await file.text();
  } catch (e) {
    raw = null;
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((e) => e && typeof e.id === "string");
    }
  } catch (e) {
    return [];
  }
  return [];
}

async function saveEntries(list) {
  const file = getMetaFile();
  if (!file) return;
  if (dirRef === "unset") {
    try {
      dirRef = new Directory(Paths.document, "Patchwork");
    } catch (e) {
      dirRef = null;
    }
  }
  if (dirRef) {
    await dirRef.create({ intermediates: true, idempotent: true });
  }
  await file.write(JSON.stringify(list, null, 2));
}

function EntryCard({ entry }) {
  const hasAudio = typeof entry.audioUri === "string" && entry.audioUri.length > 0;
  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTime}>{entry.time}</Text>
        <Text style={styles.entryMood}>{MOOD_LABELS[entry.mood] || "-"}</Text>
      </View>
      <TouchableOpacity style={styles.playBtn} disabled={!hasAudio}>
        <PlayIcon size={15} color={C.mutedIcon} />
      </TouchableOpacity>
      <Text style={styles.entryText}>{entry.text || "Audio saved"}</Text>
    </View>
  );
}

function sanitizeError(e) {
  const raw = e && e.message ? e.message : String(e);
  const cleaned = String(raw)
    .replace(/file:\/\/[^\s)]+/g, "[file]")
    .replace(/\/Users\/[^\s)]+/g, "[path]")
    .replace(/\/var\/folders\/[^\s)]+/g, "[tmp]")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  return cleaned ? "Something went wrong: " + cleaned : "Something went wrong.";
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("today");
  const [today, setToday] = useState(todayKey());
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [error, setError] = useState(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const showErr = useCallback((e) => {
    setError(sanitizeError(e));
  }, []);

  const load = useCallback(async () => {
    try {
      const list = await loadEntries();
      setEntries(list);
      setToday(todayKey());
      setError(null);
    } catch (e) {
      showErr(e);
    }
  }, [showErr]);

  useEffect(() => {
    load();
  }, [load]);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) throw new Error("Microphone permission not granted.");
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setError(null);
    } catch (e) {
      showErr(e);
    }
  };

  const stopAndSave = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
      const uri = recorder.uri || (await recorder.getStatus()).url;
      if (!uri) throw new Error("No audio was saved.");
      const entry = journal.createEntry(Date.now(), "");
      entry.audioUri = uri;
      const list = journal.addEntry(entries, entry);
      await saveEntries(list);
      setEntries(list);
    } catch (e) {
      showErr(e);
      setIsRecording(false);
    }
  };

  const togglePlay = (entry) =>
    setPlayingId((cur) => (cur === entry.id ? null : entry.id));

  const todayEntries = entries.filter((e) => e && e.date === today);

  const recap = journal.computeRecap(entries);
  const recapLines = [];
  if (recap.streakDays > 0) {
    recapLines.push("Streak: " + recap.streakDays + " day" + (recap.streakDays === 1 ? "" : "s"));
  }
  if (recap.totalEntries > 0) {
    recapLines.push("Entries: " + recap.totalEntries);
  }
  if (recap.averageMood > 0) {
    recapLines.push("Average mood: " + recap.averageMood + "/10");
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === "today" && styles.tabActive]}
          onPress={() => setTab("today")}
        >
          <Text style={[styles.tabText, tab === "today" && styles.tabTextActive]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "recap" && styles.tabActive]}
          onPress={() => setTab("recap")}
        >
          <Text style={[styles.tabText, tab === "recap" && styles.tabTextActive]}>
            This week
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "today" ? (
        <ScrollView style={styles.main} contentContainerStyle={styles.mainInner}>
          <View style={styles.hero}>
            <Wave />
            <Text style={styles.heroTitle}>Today</Text>
          </View>
          {todayEntries.length === 0 ? (
            <Text style={styles.hint}>
              Say something — speak a moment about your day
            </Text>
          ) : null}
          {todayEntries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.main} contentContainerStyle={styles.mainInner}>
          <WeekWave entries={entries} />
          <Text style={styles.title}>This week</Text>
          {recapLines.length > 0 ? (
            <Text style={styles.recapText}>{recapLines.join("\n")}</Text>
          ) : null}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.recordBtn}
        onPress={isRecording ? stopAndSave : startRecording}
      >
        <MicIcon size={19} color={C.onAccent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.paper,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderColor: C.accent,
  },
  tabText: {
    fontSize: 15,
    color: C.muted,
  },
  tabTextActive: {
    fontSize: 15,
    color: C.ink,
    fontWeight: "500",
  },
  main: { flex: 1 },
  mainInner: { padding: 16 },
  hero: {
    height: 72,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { fontSize: 26, fontWeight: "500", color: C.ink },
  hint: { fontSize: 14, color: C.muted, marginVertical: 16, alignSelf: "center" },
  entry: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: C.ink,
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryTime: { fontSize: 13, color: C.muted },
  entryMood: { fontSize: 13, color: C.accent },
  entryText: { fontSize: 13, color: C.ink, marginTop: 2 },
  playBtn: { padding: 8, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "500", color: C.ink, marginTop: 16 },
  recapText: { fontSize: 13, color: C.muted, lineHeight: 20, marginTop: 12 },
  recordBtn: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
    height: 72,
    backgroundColor: C.accent,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.ink,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorBox: {
    backgroundColor: C.errorBg,
    padding: 8,
    borderRadius: 8,
    margin: 8,
  },
  errorText: { color: C.errorText, fontSize: 13 },
});
