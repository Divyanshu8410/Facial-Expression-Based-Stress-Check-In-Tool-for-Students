// ============================================================
// Home / Dashboard Page
// ============================================================

import { getHistory } from '../modules/utils.js';

const WELLNESS_TIPS = [
  { icon: '🌅', tip: 'Start your morning with 5 minutes of deep breathing to set a calm tone for the day.' },
  { icon: '💧', tip: 'Drink a glass of water before every study session — hydration boosts focus by up to 20%.' },
  { icon: '🚶', tip: 'A brisk 10-minute walk between classes improves mood and reduces cortisol levels.' },
  { icon: '📱', tip: 'Try a digital sunset — put your phone away 30 minutes before bed for better sleep.' },
  { icon: '🧘', tip: 'Even 3 minutes of mindfulness meditation can measurably lower your stress response.' },
  { icon: '📓', tip: 'Write down 3 things you\'re grateful for tonight. Gratitude journaling rewires your brain.' },
  { icon: '🎵', tip: 'Lo-fi music or nature sounds while studying can reduce anxiety and improve concentration.' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getDayTip() {
  const day = new Date().getDay();
  return WELLNESS_TIPS[day % WELLNESS_TIPS.length];
}

export function renderHome() {
  const history = getHistory();
  const latest = history[0];
  const totalCheckins = history.length;
  const avgScore = history.length
    ? Math.round(history.slice(0, 7).reduce((a, b) => a + (b.score || 0), 0) / Math.min(history.length, 7))
    : null;

  const tip = getDayTip();
  const greeting = getGreeting();

  const categoryColor = {
    low: 'var(--accent-green)',
    moderate: 'var(--accent-yellow)',
    high: '#f87171',
  };

  const latestCard = latest ? `
    <div class="card card-sm flex items-center gap-16" style="border-color:${categoryColor[latest.category] || 'var(--border-color)'}22;background:linear-gradient(145deg,rgba(30,35,64,0.9),rgba(24,29,54,0.9))">
      <div style="font-size:36px">${latest.faceEmoji || '😐'}</div>
      <div style="flex:1">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px">Last check-in · ${formatRelativeTime(latest.timestamp)}</div>
        <div style="font-size:15px;font-weight:600;color:var(--text-primary)">Stress Score: ${latest.stress || '?'}/10</div>
        <div style="font-size:13px;color:var(--text-secondary)">${latest.faceLabel || 'No face data'} · <span style="color:${categoryColor[latest.category]}">${capitalize(latest.category)} stress</span></div>
      </div>
      <span class="badge badge-${latest.category}">${capitalize(latest.category)}</span>
    </div>` : `
    <div class="card card-sm text-center" style="padding:24px">
      <div style="font-size:32px;margin-bottom:8px">👋</div>
      <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">No check-ins yet</div>
      <div style="font-size:13px;color:var(--text-muted)">Start your first check-in today!</div>
    </div>`;

  return `
  <div class="fade-in">

    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-bg-orb hero-bg-orb-1"></div>
      <div class="hero-bg-orb hero-bg-orb-2"></div>
      <div style="position:relative;z-index:1">
        <div class="hero-greeting">${greeting} 👋</div>
        <h1 class="hero-title">How are you feeling<br>today?</h1>
        <p class="hero-desc">Take a 2-minute wellness check-in to reflect on your stress levels and discover personalized relaxation strategies. Your data stays private on your device.</p>
        <div class="flex gap-12 flex-wrap">
          <button class="btn btn-primary btn-lg" id="start-checkin-btn" aria-label="Start daily check-in">
            ✅ Start Today's Check-In
          </button>
          <button class="btn btn-outline" id="go-breathing-btn" aria-label="Open breathing exercise">
            🌬️ Breathing Exercise
          </button>
        </div>
      </div>
    </div>

    <!-- Stress awareness notice -->
    <div class="alert-banner alert-info mb-24">
      <span>💡</span>
      <span><strong>Wellness Reminder:</strong> This tool is for personal reflection only — not a medical diagnostic. If you're experiencing persistent distress, please reach out to a counselor or trusted adult.</span>
    </div>

    <!-- Stats Row -->
    <div class="grid-4 stats-grid mb-24">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(108,159,255,0.15)">📊</div>
        <div>
          <div class="stat-value text-accent">${totalCheckins}</div>
          <div class="stat-label">Total Check-Ins</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(45,212,191,0.15)">📅</div>
        <div>
          <div class="stat-value text-teal">${getStreakDays(history)}</div>
          <div class="stat-label">Day Streak</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(251,191,36,0.15)">📉</div>
        <div>
          <div class="stat-value" style="color:var(--accent-yellow)">${avgScore !== null ? avgScore : '—'}</div>
          <div class="stat-label">7-Day Avg Score</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(167,139,250,0.15)">🧘</div>
        <div>
          <div class="stat-value" style="color:var(--accent-lavender)">${getPositiveDays(history)}</div>
          <div class="stat-label">Positive Days</div>
        </div>
      </div>
    </div>

    <div class="grid-2 mb-24">
      <!-- Latest Check-In -->
      <div>
        <div class="section-title">📋 Latest Check-In</div>
        ${latestCard}
        <button class="btn btn-ghost btn-sm mt-16 w-full" id="go-history-btn">
          📈 View Full History
        </button>
      </div>

      <!-- Wellness Tip -->
      <div>
        <div class="section-title">💡 Today's Wellness Tip</div>
        <div class="tip-card">
          <span style="font-size:32px">${tip.icon}</span>
          <div>
            <div style="font-size:14px;line-height:1.65;color:var(--text-primary)">${tip.tip}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section-title">🧘 Quick Breathing Reset</div>
        <div class="card card-sm" style="background:linear-gradient(135deg,rgba(45,212,191,0.1),rgba(108,159,255,0.08));border-color:rgba(45,212,191,0.2)">
          <div class="flex items-center gap-12 mb-12">
            <span style="font-size:28px">🌬️</span>
            <div>
              <div style="font-weight:600;font-size:14px;color:var(--text-primary)">4-7-8 Breathing</div>
              <div style="font-size:12px;color:var(--text-muted)">~4 minutes · Reduces anxiety fast</div>
            </div>
          </div>
          <button class="btn btn-teal btn-sm w-full" id="go-breathing-btn-2">Start Now →</button>
        </div>
      </div>
    </div>

    <!-- Privacy Section -->
    <div class="card">
      <div class="section-title">🔒 Privacy & Safety</div>
      <div class="grid-2" style="gap:12px">
        ${[
          ['🎥', 'Camera permission only on your request — never automatic.'],
          ['🚫', 'No webcam images or video are ever stored.'],
          ['💻', 'All facial analysis runs locally in your browser.'],
          ['🗑️', 'You can delete your check-in history at any time.'],
          ['⚕️', 'This is a wellness reflection tool, not a medical diagnostic.'],
          ['🔐', 'Data stored only in your browser — never sent to any server.'],
        ].map(([icon, text]) => `
          <div class="privacy-item">
            <span class="privacy-icon">${icon}</span>
            <span>${text}</span>
          </div>
        `).join('')}
      </div>
    </div>

  </div>`;
}

// ── Helpers ────────────────────────────────────────────────
function formatRelativeTime(isoStr) {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);
  if (diffMin < 2) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

function getStreakDays(history) {
  if (!history.length) return 0;
  // Count consecutive days from today
  let streak = 0;
  const today = new Date().toDateString();
  const dates = history.map(h => new Date(h.timestamp).toDateString());
  const uniqueDates = [...new Set(dates)];
  const checkDate = new Date();
  for (let i = 0; i < 30; i++) {
    if (uniqueDates.includes(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getPositiveDays(history) {
  return history.filter(h => h.category === 'low').length;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
