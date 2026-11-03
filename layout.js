// ============================================================
// Layout — Navbar, Sidebar, Mobile Nav HTML renderers
// ============================================================

const NAV_ITEMS = [
  { id: 'home',      icon: '🏠', label: 'Dashboard' },
  { id: 'checkin',   icon: '✅', label: 'Check-In' },
  { id: 'breathing', icon: '🌬️', label: 'Breathing' },
  { id: 'history',   icon: '📈', label: 'History' },
];

export function renderNavbar() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-brand" data-nav="home" style="cursor:pointer">
      <div class="navbar-logo">🧠</div>
      <div>
        <div class="navbar-title">StressSense AI</div>
        <div class="navbar-subtitle">Student Wellness Check-In</div>
      </div>
    </div>
    <div class="navbar-spacer"></div>
    <span class="navbar-badge">🕐 ${timeStr}</span>
    <span class="navbar-badge" style="color:var(--accent-teal);border-color:rgba(45,212,191,0.3);background:rgba(45,212,191,0.1)">🔒 Privacy First</span>
  </nav>`;
}

export function renderSidebar(currentPage) {
  return `
    <div class="nav-section-label">Navigation</div>
    ${NAV_ITEMS.map(item => `
      <button class="nav-item ${currentPage === item.id ? 'active' : ''}" data-nav="${item.id}" aria-label="${item.label}">
        <span class="nav-item-icon">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `).join('')}
    <div class="nav-section-label" style="margin-top:24px">About</div>
    <div style="padding:12px;font-size:12px;color:var(--text-muted);line-height:1.6;border-radius:var(--radius-sm);background:rgba(108,159,255,0.05);border:1px solid var(--border-color)">
      🔒 All data processed locally in your browser. No images are saved.
      <br><br>
      ⚕️ Not a medical tool. Always consult a qualified professional for mental health concerns.
    </div>
  `;
}

export function renderMobileNav(currentPage) {
  return `<div class="mobile-nav-inner">
    ${NAV_ITEMS.map(item => `
      <button class="mobile-nav-item ${currentPage === item.id ? 'active' : ''}" data-nav="${item.id}" aria-label="${item.label}">
        <span class="mobile-nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `).join('')}
  </div>`;
}
