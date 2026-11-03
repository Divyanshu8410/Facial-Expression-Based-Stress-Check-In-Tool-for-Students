// ============================================================
// History Page — Timeline + Trend Charts using Chart.js
// ============================================================

import { getHistory } from '../modules/utils.js';

const SLEEP_LABELS = ['Poor', 'Fair', 'Good', 'Great'];
const WORKLOAD_LABELS = ['Light', 'Moderate', 'Heavy', 'Overwhelming'];
const EMOTION_EMOJIS = ['😭', '😔', '😐', '🙂', '😄'];

export function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    return `
      <div class="fade-in">
        <h1 class="page-title">📈 Check-In History</h1>
        <p class="page-subtitle">Your past wellness check-ins appear here.</p>
        <div class="card text-center" style="padding:60px 20px">
          <div style="font-size:48px;margin-bottom:16px">📋</div>
          <h2 style="color:var(--text-primary);margin-bottom:8px">No history yet</h2>
          <p style="color:var(--text-secondary);margin-bottom:24px">Complete your first check-in to start tracking your wellness journey.</p>
          <button class="btn btn-primary" data-nav="checkin">✅ Start Check-In</button>
        </div>
      </div>`;
  }

  const recent7 = history.slice(0, 7).reverse();
  const avgScore = Math.round(recent7.reduce((a, b) => a + (b.score || 0), 0) / recent7.length);
  const avgStress = Math.round(recent7.reduce((a, b) => a + (b.stress || 0), 0) / recent7.length);
  const lowCount = history.filter(h => h.category === 'low').length;
  const highCount = history.filter(h => h.category === 'high').length;

  return `
  <div class="fade-in">
    <h1 class="page-title">📈 Check-In History</h1>
    <p class="page-subtitle">Your wellness journey over time. All data is stored locally on your device.</p>

    <!-- Summary Stats -->
    <div class="grid-4 stats-grid mb-24">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(108,159,255,0.15)">📊</div>
        <div>
          <div class="stat-value text-accent">${history.length}</div>
          <div class="stat-label">Total Check-Ins</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(251,191,36,0.15)">📉</div>
        <div>
          <div class="stat-value" style="color:var(--accent-yellow)">${avgScore}</div>
          <div class="stat-label">7-Day Avg Index</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(74,222,128,0.15)">🌱</div>
        <div>
          <div class="stat-value text-green">${lowCount}</div>
          <div class="stat-label">Low-Stress Days</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(248,113,113,0.15)">⚡</div>
        <div>
          <div class="stat-value text-danger">${highCount}</div>
          <div class="stat-label">High-Stress Days</div>
        </div>
      </div>
    </div>

    <div class="grid-2 mb-24">
      <!-- Trend Chart -->
      <div class="card">
        <div class="section-title">📈 7-Day Stress Trend</div>
        <div class="chart-container">
          <canvas id="trend-chart" aria-label="7-day stress trend chart"></canvas>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:8px">Self-reported stress score (1–10) over your last 7 check-ins.</div>
      </div>

      <!-- Distribution Chart -->
      <div class="card">
        <div class="section-title">🥧 Stress Distribution</div>
        <div class="chart-container">
          <canvas id="dist-chart" aria-label="Stress category distribution chart"></canvas>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:8px">Breakdown of your check-in categories across all sessions.</div>
      </div>
    </div>

    <!-- Timeline -->
    <div class="card mb-24">
      <div class="flex justify-between items-center mb-20">
        <div class="section-title" style="margin-bottom:0">🕒 Check-In Timeline</div>
        <div class="flex gap-8">
          <span class="badge badge-low">🟢 Low</span>
          <span class="badge badge-moderate">🟡 Moderate</span>
          <span class="badge badge-high">🔴 High</span>
        </div>
      </div>
      <div class="timeline">
        ${history.slice(0, 20).map(item => `
          <div class="timeline-item">
            <div class="timeline-dot ${item.category || 'moderate'}"></div>
            <div class="card card-sm" style="border-color:${getCategoryColor(item.category)}22">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-12">
                  <span style="font-size:28px">${item.faceEmoji || '😐'}</span>
                  <div>
                    <div style="font-weight:600;font-size:14px;color:var(--text-primary)">
                      Stress: ${item.stress || '?'}/10
                      <span class="badge badge-${item.category || 'moderate'}" style="margin-left:8px">${capitalize(item.category || 'unknown')}</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                      ${item.faceLabel || 'No face data'} ·
                      Sleep: ${SLEEP_LABELS[item.sleep] || '?'} ·
                      Workload: ${WORKLOAD_LABELS[item.workload] || '?'}
                    </div>
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:12px;color:var(--text-muted)">${formatDate(item.timestamp)}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${formatTime(item.timestamp)}</div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ${history.length > 20 ? `<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px">Showing 20 of ${history.length} check-ins</div>` : ''}
    </div>

    <!-- Delete -->
    <div class="card" style="border-color:rgba(248,113,113,0.2)">
      <div class="section-title">🗑️ Manage Your Data</div>
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        Your check-in history is stored only in your browser's local storage. You can delete it at any time.
        This action is <strong style="color:#f87171">irreversible</strong>.
      </p>
      <button class="btn btn-danger" id="delete-history-btn">🗑️ Delete All History</button>
    </div>
  </div>`;
}

// ── Chart initialization (called after DOM renders) ────────────
export function initHistoryCharts() {
  const history = getHistory();
  if (!history.length || typeof Chart === 'undefined') return;

  const recent7 = history.slice(0, 7).reverse();
  const labels = recent7.map(h => formatDateShort(h.timestamp));
  const scores = recent7.map(h => h.stress || 0);

  // Trend Chart
  const trendCtx = document.getElementById('trend-chart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Stress Level (1-10)',
          data: scores,
          borderColor: '#6c9fff',
          backgroundColor: 'rgba(108,159,255,0.1)',
          borderWidth: 2.5,
          pointBackgroundColor: scores.map(s => s <= 3 ? '#4ade80' : s <= 6 ? '#fbbf24' : '#f87171'),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2340',
            borderColor: 'rgba(108,159,255,0.3)',
            borderWidth: 1,
            titleColor: '#f0f4ff',
            bodyColor: '#9ca3d4',
            callbacks: {
              label: ctx => `Stress: ${ctx.raw}/10 · ${ctx.raw <= 3 ? '🟢 Low' : ctx.raw <= 6 ? '🟡 Moderate' : '🔴 High'}`,
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(108,159,255,0.08)' }, ticks: { color: '#6272a4', font: { size: 11 } } },
          y: {
            min: 0, max: 10,
            grid: { color: 'rgba(108,159,255,0.08)' },
            ticks: { color: '#6272a4', font: { size: 11 }, stepSize: 2 }
          }
        }
      }
    });
  }

  // Distribution Doughnut
  const cats = { low: 0, moderate: 0, high: 0 };
  history.forEach(h => { if (h.category) cats[h.category]++; });

  const distCtx = document.getElementById('dist-chart');
  if (distCtx && (cats.low + cats.moderate + cats.high) > 0) {
    new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels: ['🟢 Low', '🟡 Moderate', '🔴 High'],
        datasets: [{
          data: [cats.low, cats.moderate, cats.high],
          backgroundColor: ['rgba(74,222,128,0.7)', 'rgba(251,191,36,0.7)', 'rgba(248,113,113,0.7)'],
          borderColor: ['#4ade80', '#fbbf24', '#f87171'],
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#9ca3d4', padding: 16, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: '#1e2340',
            borderColor: 'rgba(108,159,255,0.3)',
            borderWidth: 1,
            titleColor: '#f0f4ff',
            bodyColor: '#9ca3d4',
          }
        }
      }
    });
  }
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(isoStr) {
  return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getCategoryColor(cat) {
  if (cat === 'low') return '#4ade80';
  if (cat === 'high') return '#f87171';
  return '#fbbf24';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
