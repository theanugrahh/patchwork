const assert = require("assert");
const journal = require("./journal.js");

let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log("ok - " + name);
  } catch (e) {
    failed += 1;
    console.error("FAIL - " + name + "\n  " + e.message);
  }
}

test("scoreEntry: English happy", () => {
  const r = journal.scoreEntry("I feel so happy today");
  assert.equal(r.mood, "good");
  assert.ok(r.tags.includes("happy"));
  assert.ok(r.score > 0);
});

test("scoreEntry: mixed phrase", () => {
  const r = journal.scoreEntry("The day went great, I'm very excited");
  assert.equal(r.mood, "very_good");
});

test("scoreEntry: Hindi calm", () => {
  const r = journal.scoreEntry("Mujhe theek hai");
  assert.equal(r.mood, "calm");
});

test("scoreEntry: Hindi stressed", () => {
  const r = journal.scoreEntry("Tension to hai");
  assert.equal(r.mood, "stressed");
});

test("scoreEntry: empty input", () => {
  assert.deepEqual(journal.scoreEntry(null), { mood: null, score: 0, tags: [] });
  assert.deepEqual(journal.scoreEntry(""), { mood: null, score: 0, tags: [] });
});

test("scoreEntry: no match", () => {
  const r = journal.scoreEntry("The sky is blue");
  assert.equal(r.mood, null);
  assert.deepEqual(r.tags, []);
});

test("computeRecap: streak + words", () => {
  const entries = [
    { id: "a", date: "2024-03-10", ts: 1710019200000, text: "happy day", mood: "good", score: 8 },
    { id: "b", date: "2024-03-11", ts: 1710080400000, text: "calm day", mood: "calm", score: 7 },
    { id: "c", date: "2024-03-12", ts: 1710146800000, text: "sad day", mood: "sad", score: 3 },
  ];
  const r = journal.computeRecap(entries);
  assert.equal(r.totalEntries, 3);
  assert.equal(r.daysActive, 3);
  assert.equal(r.streakDays, 3);
  assert.ok(r.averageMood > 2 && r.averageMood < 8, "avg=" + r.averageMood);
  assert.deepEqual(r.topWords[0], ["day", 3]);
});

test("computeRecap: empty", () => {
  const r = journal.computeRecap([]);
  assert.equal(r.totalEntries, 0);
  assert.equal(r.daysActive, 0);
  assert.equal(r.streakDays, 0);
  assert.equal(r.averageMood, 0);
  assert.deepEqual(r.topWords, []);
});

if (failed > 0) process.exit(1);
console.log("All tests passed");
