// ============================================================
// StressSense AI — Main Application
// Pure Vanilla JS ES-module SPA — no build step required
// ============================================================

import { AppState } from './modules/state.js';
import { renderNavbar, renderSidebar, renderMobileNav } from './modules/layout.js';
import { renderHome } from './pages/home.js';
import { renderCheckin } from './pages/checkin.js';
import { renderResults } from './pages/results.js';
import { renderBreathing } from './pages/breathing.js';
import { renderHistory, initHistoryCharts } from './pages/history.js';

// ── Router ───────────────────────────────────────────────────
export function navigate(page, data = {}) {
  AppState.currentPage = page;
  AppState.pageData = data;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const app = document.getElementById('app');
  const page = AppState.currentPage;

  app.innerHTML = `
    ${renderNavbar()}
    <div class="main-layout">
      <aside class="sidebar" id="sidebar" role="navigation" aria-label="Sidebar">${renderSidebar(page)}</aside>
      <main class="page-content" id="page-content" role="main"></main>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">${renderMobileNav(page)}</nav>
    <div class="toast-container" id="toast-container" aria-live="polite"></div>
  `;

  const content = document.getElementById('page-content');

  switch (page) {
    case 'home':
      content.innerHTML = renderHome();
      attachHomeListeners();
      break;
    case 'checkin':
      renderCheckin(content);
      break;
    case 'results':
      content.innerHTML = renderResults(AppState.pageData);
      attachResultsListeners();
      break;
    case 'breathing':
      content.innerHTML = renderBreathing();
      startBreathing();
      break;
    case 'history':
      content.innerHTML = renderHistory();
      attachHistoryListeners();
      // Init charts after DOM is ready
      requestAnimationFrame(() => initHistoryCharts());
      break;
    default:
      content.innerHTML = renderHome();
      attachHomeListeners();
  }

  attachNavListeners();
}

// ── Nav Listeners ─────────────────────────────────────────────
function attachNavListeners() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
}

// ── Home Listeners ─────────────────────────────────────────────
function attachHomeListeners() {
  document.getElementById('start-checkin-btn')?.addEventListener('click', () => navigate('checkin'));
  document.getElementById('go-breathing-btn')?.addEventListener('click', () => navigate('breathing'));
  document.getElementById('go-breathing-btn-2')?.addEventListener('click', () => navigate('breathing'));
  document.getElementById('go-history-btn')?.addEventListener('click', () => navigate('history'));
}

// ── Results Listeners ──────────────────────────────────────────
function attachResultsListeners() {
  document.getElementById('save-checkin-btn')?.addEventListener('click', () => {
    const { saveCheckin } = window._ssUtils;
    if (AppState.pageData) {
      saveCheckin(AppState.pageData);
      const btn = document.getElementById('save-checkin-btn');
      if (btn) { btn.textContent = '✅ Saved!'; btn.disabled = true; }
      showToast('Check-in saved to history!', '💾');
    }
  });
  document.getElementById('new-checkin-btn')?.addEventListener('click', () => navigate('checkin'));
  document.getElementById('view-history-btn')?.addEventListener('click', () => navigate('history'));
  document.getElementById('results-breathing-btn')?.addEventListener('click', () => navigate('breathing'));
}

// ── History Listeners ─────────────────────────────────────────
function attachHistoryListeners() {
  document.getElementById('delete-history-btn')?.addEventListener('click', () => {
    if (confirm('Delete all check-in history? This cannot be undone.')) {
      window._ssUtils.clearHistory();
      showToast('History cleared.', '🗑️');
      navigate('history');
    }
  });
}

// ── Breathing Exercise Engine ─────────────────────────────────
let breathTimer = null;

const PHASES = [
  { name: 'Inhale',  duration: 4,  scaleTo: 1.6, color: '#6c9fff' },
  { name: 'Hold',    duration: 7,  scaleTo: 1.6, color: '#a78bfa' },
  { name: 'Exhale',  duration: 8,  scaleTo: 1.0, color: '#2dd4bf' },
];

function startBreathing() {
  let phaseIdx = 0;
  let tick = 0;
  let cycle = 0;
  let running = false;
  const MAX_CYCLES = 4;

  const get = id => document.getElementById(id);

  function applyVisual() {
    const ph = PHASES[phaseIdx];
    const elapsed = tick; // seconds elapsed in this phase
    const progress = elapsed / ph.duration; // 0→1

    let scale;
    if (ph.name === 'Inhale')  scale = 1.0 + progress * 0.6;
    else if (ph.name === 'Exhale') scale = 1.6 - progress * 0.6;
    else scale = 1.6; // Hold

    const core = get('breath-core');
    const ring1 = get('breath-ring-1');
    const ring2 = get('breath-ring-2');

    if (core) {
      core.style.transform = `scale(${scale})`;
      core.style.background = `radial-gradient(circle, ${ph.color}dd, ${ph.color}88)`;
      core.style.boxShadow = `0 0 ${Math.round(30 * scale)}px ${ph.color}88`;
    }
    if (ring1) ring1.style.transform = `scale(${0.95 + (scale - 1) * 0.12})`;
    if (ring2) ring2.style.transform = `scale(${0.88 + (scale - 1) * 0.18})`;

    const phEl = get('breath-phase');
    if (phEl) phEl.textContent = ph.name;

    const tiEl = get('breath-timer');
    if (tiEl) tiEl.textContent = ph.duration - tick;
  }

  function tick_fn() {
    if (!running) return;

    applyVisual();
    tick++;

    if (tick >= PHASES[phaseIdx].duration) {
      tick = 0;
      phaseIdx = (phaseIdx + 1) % PHASES.length;

      if (phaseIdx === 0) {
        cycle++;
        const cyEl = get('breath-cycles');
        if (cyEl) cyEl.textContent = `Cycle ${cycle} / ${MAX_CYCLES}`;

        if (cycle >= MAX_CYCLES) {
          running = false;
          clearInterval(breathTimer);
          const phEl = get('breath-phase');
          if (phEl) phEl.textContent = '🎉 Well done!';
          const tiEl = get('breath-timer');
          if (tiEl) tiEl.textContent = '';
          const core = get('breath-core');
          if (core) { core.style.transform = 'scale(1)'; core.style.background = 'var(--gradient-teal)'; core.innerHTML = '<span style="font-size:24px">✅</span>'; }
          const startBtn = get('breath-start');
          if (startBtn) { startBtn.disabled = false; startBtn.textContent = '▶ Again'; }
          const pauseBtn = get('breath-pause');
          if (pauseBtn) pauseBtn.disabled = true;
          showToast('Great job! 4 cycles complete 🎉', '🌬️');
        }
      }
    }
  }

  function doStart() {
    running = true;
    clearInterval(breathTimer);
    breathTimer = setInterval(tick_fn, 1000);
    get('breath-start').disabled = true;
    get('breath-pause').disabled = false;
    applyVisual();
  }

  function doPause() {
    running = false;
    clearInterval(breathTimer);
    const startBtn = get('breath-start');
    if (startBtn) { startBtn.disabled = false; startBtn.textContent = '▶ Resume'; }
    const pauseBtn = get('breath-pause');
    if (pauseBtn) pauseBtn.disabled = true;
    const phEl = get('breath-phase');
    if (phEl) phEl.textContent = 'Paused ⏸';
  }

  function doReset() {
    running = false;
    clearInterval(breathTimer);
    phaseIdx = 0; tick = 0; cycle = 0;
    const startBtn = get('breath-start');
    if (startBtn) { startBtn.disabled = false; startBtn.textContent = '▶ Start'; }
    const pauseBtn = get('breath-pause');
    if (pauseBtn) pauseBtn.disabled = true;
    const phEl = get('breath-phase');
    if (phEl) phEl.textContent = 'Ready';
    const tiEl = get('breath-timer');
    if (tiEl) tiEl.textContent = '4';
    const cyEl = get('breath-cycles');
    if (cyEl) cyEl.textContent = `Cycle 0 / ${MAX_CYCLES}`;
    const core = get('breath-core');
    if (core) { core.style.transform = 'scale(1)'; core.style.background = 'var(--gradient-teal)'; core.style.boxShadow = '0 0 30px rgba(45,212,191,0.5)'; core.innerHTML = '<span style="font-size:24px">🌬️</span>'; }
    const ring1 = get('breath-ring-1');
    if (ring1) ring1.style.transform = 'scale(1)';
    const ring2 = get('breath-ring-2');
    if (ring2) ring2.style.transform = 'scale(1)';
  }

  get('breath-start')?.addEventListener('click', doStart);
  get('breath-pause')?.addEventListener('click', doPause);
  get('breath-reset')?.addEventListener('click', doReset);
}

// ── Toast ─────────────────────────────────────────────────────
export function showToast(msg, icon = 'ℹ️') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Boot ──────────────────────────────────────────────────────
import { initUtils } from './modules/utils.js';
import { seedSampleData } from './modules/sampleData.js';

initUtils();
seedSampleData();
navigate('home');
