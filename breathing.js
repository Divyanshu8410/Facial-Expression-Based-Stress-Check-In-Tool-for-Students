// ============================================================
// Breathing Exercise Page — 4-7-8 Animated Guide
// ============================================================

export function renderBreathing() {
  return `
  <div class="fade-in">
    <h1 class="page-title">🌬️ Breathing Exercise</h1>
    <p class="page-subtitle">The 4-7-8 technique is a proven method to quickly calm the nervous system. Complete 4 cycles.</p>

    <div class="grid-2" style="gap:32px;align-items:start">
      <!-- Animated Circle -->
      <div class="card text-center" style="padding:40px">
        <div class="breath-container">
          <div class="breath-ring-outer">
            <div class="breath-ring breath-ring-1" id="breath-ring-1"></div>
            <div class="breath-ring breath-ring-2" id="breath-ring-2"></div>
            <div class="breath-core" id="breath-core">
              <span style="font-size:24px">🌬️</span>
            </div>
          </div>

          <div class="breath-phase-text" id="breath-phase">Ready</div>
          <div class="breath-timer" id="breath-timer">4</div>
          <div class="breath-cycle-count" id="breath-cycles">Cycle 0 / 4</div>
        </div>

        <div class="flex gap-12 justify-center mt-24">
          <button class="btn btn-teal" id="breath-start" aria-label="Start breathing exercise">▶ Start</button>
          <button class="btn btn-outline" id="breath-pause" aria-label="Pause breathing exercise" disabled>⏸ Pause</button>
          <button class="btn btn-ghost" id="breath-reset" aria-label="Reset breathing exercise">↺ Reset</button>
        </div>
      </div>

      <!-- Instructions + Guide -->
      <div class="flex flex-col gap-16">
        <div class="card card-sm">
          <div class="section-title">📖 How It Works</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
            The 4-7-8 breathing technique was developed by Dr. Andrew Weil and is widely recommended for stress reduction.
          </div>
          <div class="divider"></div>
          ${[
            { phase: 'Inhale', duration: '4 seconds', icon: '⬆️', color: 'var(--accent-blue)', desc: 'Breathe in slowly and quietly through your nose.' },
            { phase: 'Hold', duration: '7 seconds', icon: '⏸️', color: 'var(--accent-lavender)', desc: 'Hold your breath completely. Keep your body relaxed.' },
            { phase: 'Exhale', duration: '8 seconds', icon: '⬇️', color: 'var(--accent-teal)', desc: 'Exhale completely through your mouth, making a whoosh sound.' },
          ].map(p => `
            <div class="flex items-center gap-14" style="padding:10px 0;border-bottom:1px solid var(--border-color)">
              <div style="width:40px;height:40px;border-radius:10px;background:${p.color}18;border:1px solid ${p.color}40;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${p.icon}</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:${p.color}">${p.phase} — ${p.duration}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card card-sm">
          <div class="section-title">💡 Tips for Best Results</div>
          <ul style="font-size:13px;color:var(--text-secondary);line-height:2;padding-left:16px">
            <li>Sit comfortably with your back straight</li>
            <li>Place the tip of your tongue against the roof of your mouth</li>
            <li>Keep your eyes closed and focus on your breath</li>
            <li>Don't worry if it feels difficult at first</li>
            <li>Complete 4 cycles for best effect</li>
          </ul>
        </div>

        <div class="card card-sm" style="background:linear-gradient(135deg,rgba(74,222,128,0.08),rgba(45,212,191,0.08));border-color:rgba(74,222,128,0.2)">
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">
            🌿 <strong style="color:var(--accent-green)">Benefits:</strong> Regular practice can reduce anxiety, improve sleep, lower heart rate, and build stress resilience over time.
          </div>
        </div>

        <div class="card card-sm">
          <div class="section-title" style="margin-bottom:8px">🎯 Other Techniques</div>
          ${[
            { name: 'Box Breathing', detail: '4-4-4-4 · Used by Navy SEALs' },
            { name: 'Belly Breathing', detail: 'Diaphragmatic · Best for anxiety' },
            { name: '5-5 Breathing', detail: '5 in, 5 out · Beginner friendly' },
          ].map(t => `
            <div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border-color)">
              <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${t.name}</span>
              <span style="font-size:12px;color:var(--text-muted)">${t.detail}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>`;
}
