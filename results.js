// ============================================================
// Results Page — Score, Face Label, Recommendations
// ============================================================

import { getRecommendations } from '../modules/utils.js';

const SLEEP_LABELS = ['Poor (< 5 hrs)', 'Fair (5–6 hrs)', 'Good (7–8 hrs)', 'Great (8+ hrs)'];
const WORKLOAD_LABELS = ['Light', 'Moderate', 'Heavy', 'Overwhelming'];
const EMOTION_LABELS = ['Awful 😭', 'Bad 😔', 'Okay 😐', 'Good 🙂', 'Great 😄'];

export function renderResults(data) {
  if (!data || !data.score) {
    return `
      <div class="fade-in text-center" style="padding:60px 20px">
        <div style="font-size:48px;margin-bottom:16px">🤔</div>
        <h2 style="color:var(--text-primary);margin-bottom:8px">No Results Yet</h2>
        <p style="color:var(--text-secondary)">Please complete a check-in first.</p>
        <button class="btn btn-primary mt-16" id="new-checkin-btn">Start Check-In</button>
      </div>`;
  }

  const { score, category, stress, faceLabel, faceEmoji, faceColor, sleep, workload, emotion, questionnaire } = data;
  const recs = getRecommendations(score, questionnaire);

  const categoryConfig = {
    low: { label: 'Low Stress', color: 'var(--accent-green)', badge: 'badge-low', emoji: '🟢', desc: 'You\'re reporting low stress levels today. That\'s wonderful! Keep up your healthy routines and stay mindful.' },
    moderate: { label: 'Moderate Stress', color: 'var(--accent-yellow)', badge: 'badge-moderate', emoji: '🟡', desc: 'You\'re experiencing moderate stress. This is common for students — consider a short break or breathing exercise.' },
    high: { label: 'High Stress', color: '#f87171', badge: 'badge-high', emoji: '🔴', desc: 'You\'re reporting high stress levels. Take this seriously and try some of the wellness activities below. If stress persists, consider speaking with a counselor.' },
  };

  const cfg = categoryConfig[category] || categoryConfig.moderate;

  const showSupportBanner = score >= 70 || stress >= 8;

  return `
  <div class="fade-in">
    <h1 class="page-title">📊 Your Check-In Results</h1>
    <p class="page-subtitle">Here's a summary of your wellness reflection. Remember: these are informal labels, not clinical assessments.</p>

    <div class="grid-2 mb-24">
      <!-- Score Card -->
      <div class="card card-glow text-center">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Self-Reported Stress</div>
        <div class="score-circle ${category}">
          <div class="score-number" style="color:${cfg.color}">${stress}</div>
          <div class="score-label" style="color:${cfg.color}">/10</div>
        </div>
        <span class="badge ${cfg.badge}" style="font-size:14px;padding:8px 16px">${cfg.emoji} ${cfg.label}</span>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:16px;line-height:1.6">${cfg.desc}</p>
        <div class="divider"></div>
        <div class="alert-banner alert-info" style="margin:0;text-align:left">
          <span>ℹ️</span>
          <span style="font-size:12px">These categories (Low 1–3, Moderate 4–6, High 7–10) are <strong>informal wellness labels</strong>, not validated clinical thresholds.</span>
        </div>
      </div>

      <!-- Details -->
      <div class="flex flex-col gap-16">
        <!-- Face result -->
        <div class="card card-sm">
          <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Facial Expression Observation</div>
          <div class="flex items-center gap-12">
            <span style="font-size:36px">${faceEmoji}</span>
            <div>
              <div class="face-result-pill" style="border-color:${faceColor};color:${faceColor};background:${faceColor}18">
                ${faceLabel}
              </div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:6px">Experimental observation only</div>
            </div>
          </div>
          <div class="alert-banner alert-warning" style="margin-top:12px;margin-bottom:0">
            <span>🔬</span>
            <span style="font-size:12px">Facial expressions <strong>do not reliably indicate internal stress</strong>. This is an experimental feature for informational purposes only.</span>
          </div>
        </div>

        <!-- Questionnaire summary -->
        <div class="card card-sm">
          <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Your Responses</div>
          ${[
            ['💤', 'Sleep', SLEEP_LABELS[sleep] || 'Not answered'],
            ['📚', 'Workload', WORKLOAD_LABELS[workload] || 'Not answered'],
            ['💭', 'Emotional State', EMOTION_LABELS[emotion] || 'Not answered'],
          ].map(([icon, label, val]) => `
            <div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border-color)">
              <span style="font-size:13px;color:var(--text-secondary)">${icon} ${label}</span>
              <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${val}</span>
            </div>
          `).join('')}
        </div>

        <!-- Wellness Score Bar -->
        <div class="card card-sm">
          <div class="flex justify-between items-center mb-8">
            <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Wellness Index</span>
            <span style="font-size:13px;color:${cfg.color};font-weight:700">${score}/100</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width:${score}%;background:${score <= 30 ? 'var(--accent-green)' : score <= 60 ? 'var(--accent-yellow)' : '#f87171'}"></div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Combined from all questionnaire responses</div>
        </div>
      </div>
    </div>

    ${showSupportBanner ? `
    <div class="support-banner mb-24">
      <div style="font-size:28px;margin-bottom:8px">💜</div>
      <div style="font-weight:700;font-size:16px;color:var(--text-primary);margin-bottom:6px">You're not alone</div>
      <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;max-width:480px;margin:0 auto">
        You're reporting high stress today. That's completely valid — student life can be really challenging. Please consider reaching out to a trusted friend, mentor, or counselor. Your well-being matters.
      </p>
      <div style="margin-top:12px;font-size:13px;color:var(--accent-lavender);font-weight:500">
        🆘 If you're in crisis, please contact a mental health helpline or emergency services immediately.
      </div>
    </div>` : ''}

    <!-- Recommendations -->
    <div class="section-title">🌟 Personalized Wellness Recommendations</div>
    <div class="flex flex-col gap-12 mb-24">
      ${recs.map(rec => `
        <div class="rec-card" ${rec.highlight ? 'style="border-color:rgba(167,139,250,0.4)"' : ''}>
          <div class="rec-icon" style="background:${rec.bg}">${rec.icon}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;color:var(--text-primary);margin-bottom:3px">${rec.title}</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">${rec.desc}</div>
            ${rec.action === 'breathing' ? `<button class="btn btn-teal btn-sm mt-8" id="results-breathing-btn">🌬️ Try Breathing Exercise</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Actions -->
    <div class="card">
      <div class="section-title">💾 Save This Check-In</div>
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">
        Saving is optional. Only your score, stress level, face label, and timestamp are stored — locally in your browser.
      </p>
      <div class="flex gap-12 flex-wrap">
        <button class="btn btn-primary" id="save-checkin-btn">💾 Save to History</button>
        <button class="btn btn-outline" id="new-checkin-btn">🔄 New Check-In</button>
        <button class="btn btn-ghost" id="view-history-btn">📈 View History</button>
      </div>
    </div>

  </div>`;
}
