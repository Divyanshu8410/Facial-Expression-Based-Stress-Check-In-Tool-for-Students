// ============================================================
// Utils — localStorage helpers, scoring, recommendations
// ============================================================

const STORAGE_KEY = 'stresssense_history';

export function initUtils() {
  window._ssUtils = {
    getHistory,
    saveCheckin,
    clearHistory,
    getScore,
    getCategory,
    getRecommendations,
    getFaceLabel,
  };
}

// ── History ──────────────────────────────────────────────────
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveCheckin(data) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...data,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Scoring ───────────────────────────────────────────────────
// Returns 0-100 wellness stress index (higher = more stress)
export function getScore(q) {
  if (!q) return 0;
  // Stress level (1-10) → 0-40 points
  const stressPoints = ((q.stress - 1) / 9) * 40;
  // Sleep (0=poor→20, 1=fair→10, 2=good→5, 3=great→0)
  const sleepMap = [20, 10, 5, 0];
  const sleepPoints = sleepMap[q.sleep] ?? 10;
  // Workload (0=light→0, 1=moderate→10, 2=heavy→20, 3=overwhelming→30)
  const workloadMap = [0, 10, 20, 30];
  const workloadPoints = workloadMap[q.workload] ?? 10;
  // Emotion (0=awful→10, 1=bad→7, 2=okay→4, 3=good→1, 4=great→0)
  const emotionMap = [10, 7, 4, 1, 0];
  const emotionPoints = emotionMap[q.emotion] ?? 5;

  return Math.round(Math.min(100, stressPoints + sleepPoints + workloadPoints + emotionPoints));
}

export function getCategory(score) {
  const selfReportedStress = score; // We use raw stress (1-10) from questionnaire
  // Categories based on self-reported 1-10 value mapped to score bands
  if (score <= 30) return 'low';
  if (score <= 60) return 'moderate';
  return 'high';
}

// ── Face Label Mapping ────────────────────────────────────────
export function getFaceLabel(blendshapes) {
  if (!blendshapes || blendshapes.length === 0) return null;

  // Build a quick lookup
  const bs = {};
  blendshapes.forEach(s => bs[s.categoryName] = s.score);

  const browTension = ((bs.browInnerUp || 0) + (bs.browDownLeft || 0) + (bs.browDownRight || 0)) / 3;
  const eyeSquint = ((bs.eyeSquintLeft || 0) + (bs.eyeSquintRight || 0)) / 2;
  const smile = ((bs.mouthSmileLeft || 0) + (bs.mouthSmileRight || 0)) / 2;
  const frown = ((bs.mouthFrownLeft || 0) + (bs.mouthFrownRight || 0)) / 2;
  const jawOpen = bs.jawOpen || 0;
  const eyeWide = ((bs.eyeWideLeft || 0) + (bs.eyeWideRight || 0)) / 2;
  const cheekSquint = ((bs.cheekSquintLeft || 0) + (bs.cheekSquintRight || 0)) / 2;

  // Heuristic rules
  if (smile > 0.35 || cheekSquint > 0.4) return { label: 'Positive / Relaxed', emoji: '😊', color: 'var(--accent-green)', badge: 'badge-low' };
  if (browTension > 0.25 && frown > 0.15) return { label: 'Tense-Looking', emoji: '😟', color: 'var(--accent-yellow)', badge: 'badge-moderate' };
  if (eyeSquint > 0.3 && eyeWide < 0.1) return { label: 'Tired-Looking', emoji: '😴', color: '#a78bfa', badge: 'badge-lavender' };
  if (jawOpen > 0.3) return { label: 'Surprised / Alert', emoji: '😮', color: 'var(--accent-blue)', badge: 'badge-blue' };
  return { label: 'Neutral', emoji: '😐', color: 'var(--text-secondary)', badge: 'badge-blue' };
}

// ── Recommendations ────────────────────────────────────────────
const ALL_RECS = [
  { id: 1, icon: '🌬️', title: 'Guided Breathing', desc: 'Try the 4-7-8 breathing exercise to quickly calm your nervous system.', action: 'breathing', actionLabel: 'Start Exercise', bg: 'rgba(45,212,191,0.12)' },
  { id: 2, icon: '🚶', title: 'Short Walk Break', desc: 'A 5-minute walk between study sessions boosts focus and reduces tension.', bg: 'rgba(108,159,255,0.12)' },
  { id: 3, icon: '🧘', title: 'Body Stretch', desc: 'Stand up and do a few gentle stretches — neck rolls, shoulder shrugs, and forward bends.', bg: 'rgba(167,139,250,0.12)' },
  { id: 4, icon: '😴', title: 'Improve Sleep Hygiene', desc: 'Aim for 7–9 hours. Set a consistent bedtime and avoid screens 30 min before sleep.', bg: 'rgba(244,114,182,0.12)' },
  { id: 5, icon: '📅', title: 'Study Planning', desc: 'Break tasks into small, timed chunks using the Pomodoro technique (25 min work + 5 min break).', bg: 'rgba(251,191,36,0.12)' },
  { id: 6, icon: '💧', title: 'Hydrate & Snack', desc: 'Drink a glass of water and have a light, nutritious snack to maintain energy levels.', bg: 'rgba(74,222,128,0.12)' },
  { id: 7, icon: '🎵', title: 'Listen to Calm Music', desc: 'Try lo-fi, nature sounds, or classical music during study to reduce anxiety.', bg: 'rgba(45,212,191,0.12)' },
  { id: 8, icon: '🗣️', title: 'Talk to Someone', desc: 'Share how you're feeling with a trusted friend, mentor, or counselor. You don't have to face stress alone.', bg: 'rgba(167,139,250,0.12)', highlight: true },
  { id: 9, icon: '📓', title: 'Journaling', desc: 'Write down what's on your mind for 5 minutes — it helps process emotions and clear mental clutter.', bg: 'rgba(108,159,255,0.12)' },
  { id: 10, icon: '🌿', title: 'Take a Real Break', desc: 'Step away completely from screens and assignments for at least 15 minutes.', bg: 'rgba(74,222,128,0.12)' },
];

export function getRecommendations(score, q) {
  const recs = [];
  // Always include breathing
  recs.push(ALL_RECS[0]);

  if (q) {
    if (q.sleep <= 1) recs.push(ALL_RECS[3]); // poor sleep
    if (q.workload >= 2) recs.push(ALL_RECS[4]); // heavy workload → planning
    if (q.emotion <= 1) recs.push(ALL_RECS[7]); // bad emotion → talk to someone
    if (q.stress >= 7) recs.push(ALL_RECS[9]); // high stress → real break
  }

  if (score >= 50) recs.push(ALL_RECS[2]); // stretch
  if (score >= 60) recs.push(ALL_RECS[8]); // journal
  recs.push(ALL_RECS[1]); // walk
  recs.push(ALL_RECS[5]); // hydrate

  // Deduplicate and take first 5
  const seen = new Set();
  return recs.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  }).slice(0, 5);
}
