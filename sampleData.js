// ============================================================
// Sample Data — pre-seeded check-in history for demo
// ============================================================

import { getHistory } from './utils.js';

const SAMPLE_DATA = [
  {
    id: 1001,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    score: 58,
    category: 'moderate',
    stress: 6,
    faceLabel: 'Neutral',
    faceEmoji: '😐',
    sleep: 1,
    workload: 2,
    emotion: 2,
    note: 'Sample check-in',
  },
  {
    id: 1002,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    score: 24,
    category: 'low',
    stress: 3,
    faceLabel: 'Positive / Relaxed',
    faceEmoji: '😊',
    sleep: 3,
    workload: 1,
    emotion: 4,
    note: 'Sample check-in',
  },
  {
    id: 1003,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    score: 72,
    category: 'high',
    stress: 8,
    faceLabel: 'Tense-Looking',
    faceEmoji: '😟',
    sleep: 0,
    workload: 3,
    emotion: 1,
    note: 'Sample check-in',
  },
  {
    id: 1004,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    score: 45,
    category: 'moderate',
    stress: 5,
    faceLabel: 'Tired-Looking',
    faceEmoji: '😴',
    sleep: 1,
    workload: 2,
    emotion: 2,
    note: 'Sample check-in',
  },
  {
    id: 1005,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    score: 30,
    category: 'low',
    stress: 4,
    faceLabel: 'Neutral',
    faceEmoji: '😐',
    sleep: 2,
    workload: 1,
    emotion: 3,
    note: 'Sample check-in',
  },
  {
    id: 1006,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    score: 65,
    category: 'moderate',
    stress: 7,
    faceLabel: 'Tense-Looking',
    faceEmoji: '😟',
    sleep: 0,
    workload: 2,
    emotion: 1,
    note: 'Sample check-in',
  },
  {
    id: 1007,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    score: 18,
    category: 'low',
    stress: 2,
    faceLabel: 'Positive / Relaxed',
    faceEmoji: '😊',
    sleep: 3,
    workload: 0,
    emotion: 4,
    note: 'Sample check-in',
  },
];

export function seedSampleData() {
  const existing = getHistory();
  if (existing.length === 0) {
    localStorage.setItem('stresssense_history', JSON.stringify(SAMPLE_DATA));
  }
}
