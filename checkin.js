// ============================================================
// Check-In Page — 4-step stepper flow
// Steps: 0=Privacy, 1=Camera, 2=Questionnaire, 3=Complete
// ============================================================

import { navigate } from '../app.js';
import { getScore, getCategory, getFaceLabel } from '../modules/utils.js';

// ── State ─────────────────────────────────────────────────────
let step = 0;
let useCamera = null;
let faceResult = null;
let questionnaire = { stress: 5, sleep: 2, workload: 1, emotion: 2 };
let mediaStream = null;
let faceAnalysisInterval = null;
let faceLandmarker = null;
let mpInitialized = false;
let analyzing = false;
let faceReadings = [];
let scanProgress = 0;

// ── Entry Point ───────────────────────────────────────────────
export function renderCheckin(container) {
  step = 0;
  useCamera = null;
  faceResult = null;
  questionnaire = { stress: 5, sleep: 2, workload: 1, emotion: 2 };
  faceReadings = [];
  scanProgress = 0;
  renderStep(container);
}

function renderStep(container) {
  switch (step) {
    case 0: container.innerHTML = renderPrivacy(); attachPrivacyListeners(container); break;
    case 1: container.innerHTML = renderCamera(); attachCameraListeners(container); break;
    case 2: container.innerHTML = renderQuestionnaire(); attachQuestionnaireListeners(container); break;
  }
}

// ── Stepper HTML ──────────────────────────────────────────────
function renderStepper() {
  const steps = ['Privacy', 'Camera', 'Questionnaire', 'Done'];
  return `
  <div class="stepper" role="progressbar" aria-valuenow="${step}" aria-valuemax="3">
    ${steps.map((label, i) => `
      ${i > 0 ? `<div class="step-line ${i <= step ? 'done' : ''}"></div>` : ''}
      <div class="step">
        <div class="step-circle ${i < step ? 'done' : i === step ? 'active' : 'pending'}">
          ${i < step ? '✓' : i + 1}
        </div>
        <span class="step-label ${i < step ? 'done' : i === step ? 'active' : 'pending'}">${label}</span>
      </div>
    `).join('')}
  </div>`;
}

// ── Step 0: Privacy ───────────────────────────────────────────
function renderPrivacy() {
  return `
  <div class="fade-in">
    <h1 class="page-title">🧠 Wellness Check-In</h1>
    <p class="page-subtitle">A quick 2-minute reflection on how you're feeling today.</p>
    ${renderStepper()}

    <div class="card mb-20">
      <h2 class="section-title">🔒 Privacy Notice</h2>
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        Before we start, please read how this tool works:
      </p>
      <div class="privacy-notice">
        ${[
          ['🎥', '<strong>Camera is optional.</strong> You can skip it and still complete the check-in.'],
          ['🚫', '<strong>No images are stored.</strong> Any facial analysis is processed live and immediately discarded.'],
          ['💻', '<strong>Everything stays on your device.</strong> No data is sent to any server.'],
          ['⚕️', '<strong>Not a medical tool.</strong> Facial expressions do not diagnose stress, anxiety, or any condition.'],
          ['🗑️', '<strong>You control your data.</strong> Delete your check-in history anytime from the History page.'],
          ['👤', '<strong>No surveillance.</strong> This tool is for personal reflection only.'],
        ].map(([icon, text]) => `
          <div class="privacy-item">
            <span class="privacy-icon">${icon}</span>
            <span style="font-size:13px;color:var(--text-secondary)">${text}</span>
          </div>
        `).join('')}
      </div>

      <h2 class="section-title" style="margin-top:24px">Choose your check-in type:</h2>
      <div class="grid-2">
        <div class="option-card selected-teal ${useCamera === true ? 'selected-teal' : ''}" id="opt-camera" tabindex="0" role="button" aria-pressed="${useCamera === true}">
          <div style="font-size:40px;margin-bottom:10px">📸</div>
          <div style="font-weight:700;font-size:15px;color:var(--text-primary);margin-bottom:6px">Camera Check-In</div>
          <div style="font-size:12px;color:var(--text-muted);line-height:1.5">Uses your webcam to observe facial expression patterns as an optional wellness indicator.</div>
          <div class="badge badge-blue mt-8">Experimental 🔬</div>
        </div>
        <div class="option-card" id="opt-nocamera" tabindex="0" role="button" aria-pressed="${useCamera === false}">
          <div style="font-size:40px;margin-bottom:10px">📝</div>
          <div style="font-weight:700;font-size:15px;color:var(--text-primary);margin-bottom:6px">Questionnaire Only</div>
          <div style="font-size:12px;color:var(--text-muted);line-height:1.5">Complete only the self-reported questionnaire. No camera required.</div>
          <div class="badge badge-lavender mt-8">Privacy Friendly 🔒</div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <button class="btn btn-ghost" id="cancel-btn">← Back to Dashboard</button>
      <button class="btn btn-primary" id="privacy-next-btn" disabled id="privacy-next-btn">
        Continue →
      </button>
    </div>
  </div>`;
}

function attachPrivacyListeners(container) {
  let selected = null;

  const optCamera = container.querySelector('#opt-camera');
  const optNone = container.querySelector('#opt-nocamera');
  const nextBtn = container.querySelector('#privacy-next-btn');
  const cancelBtn = container.querySelector('#cancel-btn');

  function select(choice) {
    selected = choice;
    useCamera = choice;
    optCamera.classList.toggle('selected-teal', choice === true);
    optCamera.style.borderColor = choice === true ? 'var(--accent-teal)' : '';
    optNone.classList.toggle('selected', choice === false);
    nextBtn.disabled = false;
    nextBtn.setAttribute('aria-disabled', 'false');
  }

  optCamera.addEventListener('click', () => select(true));
  optCamera.addEventListener('keydown', e => e.key === 'Enter' && select(true));
  optNone.addEventListener('click', () => select(false));
  optNone.addEventListener('keydown', e => e.key === 'Enter' && select(false));

  cancelBtn.addEventListener('click', () => navigate('home'));

  nextBtn.addEventListener('click', () => {
    if (selected === null) return;
    step = 1;
    renderStep(container);
  });
}

// ── Step 1: Camera ─────────────────────────────────────────────
function renderCamera() {
  if (useCamera === false) {
    // Skip directly to questionnaire
    step = 2;
    return renderQuestionnaire();
  }

  return `
  <div class="fade-in">
    <h1 class="page-title">📸 Facial Expression Check-In</h1>
    <p class="page-subtitle">We'll observe your facial expression for a few seconds. No image is saved.</p>
    ${renderStepper()}

    <div class="alert-banner alert-warning mb-20">
      <span>🔬</span>
      <span><strong>Experimental feature:</strong> Facial landmark analysis observes visible expression patterns only — it does <em>not</em> diagnose stress, anxiety, or any medical condition. Your self-reported answers are more meaningful.</span>
    </div>

    <div class="grid-2" style="gap:24px;align-items:start">
      <!-- Camera Panel -->
      <div>
        <div class="camera-container" id="camera-container">
          <video id="camera-video" class="camera-video" autoplay playsinline muted aria-label="Camera preview"></video>
          <div class="camera-overlay" id="camera-overlay">
            <div style="font-size:40px;margin-bottom:8px">📷</div>
            <div style="font-size:14px;color:var(--text-secondary);text-align:center;padding:0 16px">Click "Enable Camera" to start.</div>
          </div>
          <!-- Scanning corners (hidden until active) -->
          <div class="camera-corner tl" id="cam-corner-tl" style="display:none"></div>
          <div class="camera-corner tr" id="cam-corner-tr" style="display:none"></div>
          <div class="camera-corner bl" id="cam-corner-bl" style="display:none"></div>
          <div class="camera-corner br" id="cam-corner-br" style="display:none"></div>
          <div class="face-scan-ring" id="face-scan-ring" style="display:none"></div>
          <div class="scan-line" id="scan-line" style="display:none"></div>
          <div class="camera-status-bar" id="camera-status-bar" style="display:none">
            <div class="flex items-center gap-8">
              <div class="recording-dot"></div>
              <span id="camera-status-text" style="font-size:12px;color:var(--text-secondary)">Analyzing…</span>
            </div>
            <span id="camera-timer-text" style="font-size:12px;color:var(--accent-teal);font-weight:600"></span>
          </div>
        </div>

        <div class="flex gap-12 mt-16" style="flex-wrap:wrap">
          <button class="btn btn-teal" id="enable-camera-btn">📷 Enable Camera</button>
          <button class="btn btn-ghost" id="stop-camera-btn" disabled>⏹ Stop</button>
          <button class="btn btn-ghost btn-sm" id="skip-camera-btn">Skip Camera →</button>
        </div>
      </div>

      <!-- Analysis Panel -->
      <div>
        <div class="card" style="min-height:260px">
          <div class="section-title">🔍 Expression Analysis</div>
          <div id="face-analysis-result">
            <div style="text-align:center;padding:32px 0;color:var(--text-muted)">
              <div style="font-size:40px;margin-bottom:8px">🤔</div>
              <div>Enable camera to start<br>expression observation</div>
            </div>
          </div>
        </div>

        <div class="card card-sm mt-16">
          <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Observable Patterns</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
            The tool looks for these visible patterns:
            <ul style="margin:8px 0 0 16px;color:var(--text-muted)">
              <li>Smile / positive expression 😊</li>
              <li>Brow tension / furrowing 😟</li>
              <li>Eye squinting / tiredness 😴</li>
              <li>Neutral resting expression 😐</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>
    <div class="flex justify-between items-center">
      <button class="btn btn-ghost" id="back-btn-camera">← Back</button>
      <button class="btn btn-primary" id="camera-next-btn" disabled>Next: Questionnaire →</button>
    </div>
  </div>`;
}

function attachCameraListeners(container) {
  // If useCamera is false, we're rendering questionnaire directly
  if (useCamera === false) {
    attachQuestionnaireListeners(container);
    return;
  }

  const enableBtn = container.querySelector('#enable-camera-btn');
  const stopBtn = container.querySelector('#stop-camera-btn');
  const skipBtn = container.querySelector('#skip-camera-btn');
  const nextBtn = container.querySelector('#camera-next-btn');
  const backBtn = container.querySelector('#back-btn-camera');

  if (backBtn) backBtn.addEventListener('click', () => { stopCamera(); step = 0; renderStep(container); });
  if (skipBtn) skipBtn.addEventListener('click', () => { stopCamera(); faceResult = null; step = 2; renderStep(container); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopCamera(); step = 2; renderStep(container); });

  if (enableBtn) {
    enableBtn.addEventListener('click', async () => {
      enableBtn.disabled = true;
      enableBtn.textContent = '⏳ Requesting…';
      await startCamera(container);
    });
  }

  if (stopBtn) stopBtn.addEventListener('click', () => stopCamera());
}

async function startCamera(container) {
  const video = container.querySelector('#camera-video');
  const overlay = container.querySelector('#camera-overlay');
  const enableBtn = container.querySelector('#enable-camera-btn');
  const stopBtn = container.querySelector('#stop-camera-btn');
  const nextBtn = container.querySelector('#camera-next-btn');
  const statusBar = container.querySelector('#camera-status-bar');
  const corners = ['cam-corner-tl', 'cam-corner-tr', 'cam-corner-bl', 'cam-corner-br', 'face-scan-ring', 'scan-line'];
  const statusText = container.querySelector('#camera-status-text');
  const timerText = container.querySelector('#camera-timer-text');
  const resultDiv = container.querySelector('#face-analysis-result');

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    video.srcObject = mediaStream;
    await video.play();
    if (overlay) overlay.style.display = 'none';
    if (statusBar) statusBar.style.display = 'flex';
    corners.forEach(id => { const el = container.querySelector(`#${id}`); if (el) el.style.display = 'block'; });
    if (stopBtn) stopBtn.disabled = false;
    if (enableBtn) { enableBtn.disabled = true; enableBtn.textContent = '✅ Camera Active'; }

    // Show scanning feedback
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div style="text-align:center;padding:16px 0">
          <div class="spinner" style="margin:0 auto 12px"></div>
          <div style="font-size:14px;color:var(--text-secondary)">Initializing MediaPipe…</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Loading facial landmark model…</div>
        </div>`;
    }

    // Try to init MediaPipe
    await initMediaPipe(video, container, resultDiv, statusText, timerText, nextBtn);

  } catch (err) {
    console.warn('Camera error:', err);
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        <div style="font-size:14px;color:#f87171;text-align:center;padding:0 16px">${getCameraError(err)}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="document.getElementById('skip-camera-btn').click()">Skip Camera →</button>`;
    }
    if (enableBtn) { enableBtn.disabled = false; enableBtn.textContent = '📷 Try Again'; }
  }
}

function getCameraError(err) {
  if (err.name === 'NotAllowedError') return 'Camera permission denied. Please allow camera access in your browser settings, or skip the camera step.';
  if (err.name === 'NotFoundError') return 'No camera found on this device. Please skip the camera step.';
  if (err.name === 'NotReadableError') return 'Camera is in use by another application.';
  return 'Camera unavailable: ' + err.message;
}

async function initMediaPipe(video, container, resultDiv, statusText, timerText, nextBtn) {
  // Try to load MediaPipe Face Landmarker from CDN
  try {
    const { FaceLandmarker, FilesetResolver } = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
    );

    if (statusText) statusText.textContent = 'Loading face model…';

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    mpInitialized = true;
    if (statusText) statusText.textContent = 'Analyzing expression…';
    startFaceAnalysis(video, container, resultDiv, statusText, timerText, nextBtn);

  } catch (mpErr) {
    console.warn('MediaPipe unavailable, using fallback:', mpErr);
    // Fallback: simulate analysis with heuristic based on brightness / motion
    runFallbackAnalysis(video, container, resultDiv, statusText, timerText, nextBtn);
  }
}

function startFaceAnalysis(video, container, resultDiv, statusText, timerText, nextBtn) {
  faceReadings = [];
  let countdown = 8;
  analyzing = true;

  if (timerText) timerText.textContent = `${countdown}s`;

  const countdownInterval = setInterval(() => {
    countdown--;
    if (timerText) timerText.textContent = `${countdown}s`;
    if (countdown <= 0) clearInterval(countdownInterval);
  }, 1000);

  let lastVideoTime = -1;
  let frameCount = 0;

  function detectFrame() {
    if (!analyzing || !video || video.readyState < 2) {
      if (analyzing) requestAnimationFrame(detectFrame);
      return;
    }
    try {
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = faceLandmarker.detectForVideo(video, performance.now());
        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          const blendshapes = results.faceBlendshapes[0].categories;
          faceReadings.push(blendshapes);
          frameCount++;
          updateLiveResult(resultDiv, blendshapes, frameCount);
        } else if (frameCount > 10) {
          if (resultDiv) {
            resultDiv.innerHTML = `<div class="alert-banner alert-warning" style="margin:0"><span>👤</span><span>No face detected. Please center your face in frame.</span></div>`;
          }
        }
      }
    } catch (e) { /* ignore frame errors */ }
    if (analyzing) requestAnimationFrame(detectFrame);
  }

  requestAnimationFrame(detectFrame);

  // Stop after 8 seconds and compute result
  setTimeout(() => {
    analyzing = false;
    clearInterval(countdownInterval);
    finalizeFaceResult(faceReadings, resultDiv, statusText, timerText, nextBtn);
  }, 8000);
}

function updateLiveResult(resultDiv, blendshapes, frameCount) {
  if (!resultDiv || frameCount % 6 !== 0) return; // Update every 6 frames
  const { getFaceLabel } = window._ssUtils;
  const result = getFaceLabel(blendshapes);
  if (!result) return;

  resultDiv.innerHTML = `
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:48px;margin-bottom:8px">${result.emoji}</div>
      <div class="face-result-pill" style="border-color:${result.color};color:${result.color};background:${result.color}18;margin:0 auto;width:fit-content">
        ${result.label}
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:12px">Live observation · ${frameCount} frames analyzed</div>
    </div>
    <div style="margin-top:12px">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Top Blendshapes</div>
      ${blendshapes.filter(b => b.score > 0.15).slice(0,4).map(b => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:11px;color:var(--text-muted);width:140px;flex-shrink:0">${b.categoryName}</span>
          <div class="progress-bar-container" style="flex:1">
            <div class="progress-bar-fill" style="width:${Math.round(b.score * 100)}%;background:var(--accent-teal)"></div>
          </div>
          <span style="font-size:11px;color:var(--text-secondary);width:30px">${Math.round(b.score * 100)}%</span>
        </div>
      `).join('')}
    </div>`;
}

function finalizeFaceResult(readings, resultDiv, statusText, timerText, nextBtn) {
  if (statusText) statusText.textContent = 'Analysis complete';
  if (timerText) timerText.textContent = '✅';

  if (readings.length === 0) {
    faceResult = { label: 'Not Detected', emoji: '❓', color: 'var(--text-muted)', badge: 'badge-blue' };
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="alert-banner alert-warning" style="margin:0">
          <span>👤</span><span>No face detected during the scan. This could be due to lighting or camera angle. Your self-reported answers will be used.</span>
        </div>`;
    }
  } else {
    // Average the blendshapes across all readings
    const avgBS = averageBlendshapes(readings);
    const { getFaceLabel } = window._ssUtils;
    faceResult = getFaceLabel(avgBS);
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div style="text-align:center;padding:8px 0 16px">
          <div style="font-size:52px;margin-bottom:10px">${faceResult.emoji}</div>
          <div class="face-result-pill" style="border-color:${faceResult.color};color:${faceResult.color};background:${faceResult.color}18;margin:0 auto;width:fit-content;font-size:15px;padding:10px 20px">
            ${faceResult.label}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:12px">Based on ${readings.length} frames · Experimental indicator only</div>
        </div>
        <div class="alert-banner alert-info" style="margin-top:12px">
          <span>ℹ️</span>
          <span>This is an <strong>experimental observation</strong> of visible facial patterns — not a stress diagnosis. Your questionnaire answers are more informative.</span>
        </div>`;
    }
  }

  if (nextBtn) nextBtn.disabled = false;
}

function runFallbackAnalysis(video, container, resultDiv, statusText, timerText, nextBtn) {
  // MediaPipe unavailable — show camera-free experience with a clear notice
  if (statusText) statusText.textContent = 'Limited mode active';
  if (resultDiv) {
    resultDiv.innerHTML = `
      <div class="alert-banner alert-warning" style="margin:0;margin-bottom:12px">
        <span>⚠️</span>
        <span>The facial landmark model couldn't load (requires internet). Camera preview is still active, but expression analysis is unavailable.</span>
      </div>
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:40px;margin-bottom:8px">😐</div>
        <div style="font-size:14px;color:var(--text-secondary)">Expression analysis unavailable.<br>Your questionnaire answers will be used.</div>
      </div>`;
  }
  faceResult = { label: 'Analysis Unavailable', emoji: '❓', color: 'var(--text-muted)', badge: 'badge-blue' };

  // Auto-enable next after 3s
  setTimeout(() => {
    if (nextBtn) nextBtn.disabled = false;
  }, 3000);
}

function averageBlendshapes(readings) {
  if (!readings.length) return [];
  const sums = {};
  const counts = {};
  readings.forEach(frame => {
    frame.forEach(bs => {
      sums[bs.categoryName] = (sums[bs.categoryName] || 0) + bs.score;
      counts[bs.categoryName] = (counts[bs.categoryName] || 0) + 1;
    });
  });
  return Object.keys(sums).map(name => ({
    categoryName: name,
    score: sums[name] / counts[name],
  }));
}

function stopCamera() {
  analyzing = false;
  if (faceAnalysisInterval) { clearInterval(faceAnalysisInterval); faceAnalysisInterval = null; }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

// ── Step 2: Questionnaire ─────────────────────────────────────
function renderQuestionnaire() {
  const sleepOptions = ['😴 Poor (< 5 hrs)', '😕 Fair (5–6 hrs)', '😊 Good (7–8 hrs)', '🌟 Great (8+ hrs)'];
  const workloadOptions = ['🌱 Light', '📚 Moderate', '🔥 Heavy', '😰 Overwhelming'];
  const emotionOptions = [
    { emoji: '😭', label: 'Awful' },
    { emoji: '😔', label: 'Bad' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😄', label: 'Great' },
  ];

  return `
  <div class="fade-in">
    <h1 class="page-title">📋 Self-Reported Questionnaire</h1>
    <p class="page-subtitle">Your answers give the most accurate picture of your well-being. Takes about 60 seconds.</p>
    ${renderStepper()}

    <div class="card mb-24">
      <!-- Q1 -->
      <div class="question-block">
        <div class="question-label">
          <span class="question-number">1</span>
          How stressed do you feel right now?
        </div>
        <div class="slider-value-display" id="stress-display" style="color:${getStressColor(questionnaire.stress)}">${questionnaire.stress}</div>
        <input type="range" min="1" max="10" value="${questionnaire.stress}" class="stress-slider w-full" id="stress-slider" aria-label="Stress level 1 to 10" />
        <div class="slider-labels">
          <span>😌 Not at all (1)</span>
          <span>😟 Extremely stressed (10)</span>
        </div>
        <div style="text-align:center;margin-top:8px">
          <span class="badge" id="stress-badge" style="${getStressStyle(questionnaire.stress)}">${getStressLabel(questionnaire.stress)}</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Q2 -->
      <div class="question-block">
        <div class="question-label">
          <span class="question-number">2</span>
          How well did you sleep last night?
        </div>
        <div class="grid-2" id="sleep-options" style="gap:10px">
          ${sleepOptions.map((opt, i) => `
            <div class="option-card ${questionnaire.sleep === i ? 'selected' : ''}" data-sleep="${i}" tabindex="0" role="button" aria-pressed="${questionnaire.sleep === i}">
              <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Q3 -->
      <div class="question-block">
        <div class="question-label">
          <span class="question-number">3</span>
          How is your current academic workload?
        </div>
        <div class="grid-2" id="workload-options" style="gap:10px">
          ${workloadOptions.map((opt, i) => `
            <div class="option-card ${questionnaire.workload === i ? 'selected' : ''}" data-workload="${i}" tabindex="0" role="button" aria-pressed="${questionnaire.workload === i}">
              <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Q4 -->
      <div class="question-block" style="margin-bottom:0">
        <div class="question-label">
          <span class="question-number">4</span>
          How are you feeling emotionally today?
        </div>
        <div class="emoji-options" id="emotion-options">
          ${emotionOptions.map((opt, i) => `
            <div class="emoji-option ${questionnaire.emotion === i ? 'selected' : ''}" data-emotion="${i}" tabindex="0" role="button" aria-pressed="${questionnaire.emotion === i}" aria-label="${opt.label}">
              ${opt.emoji}
              <span class="emoji-label">${opt.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="alert-banner alert-info mb-24">
      <span>💬</span>
      <span>Your own answers are the most reliable indicator of how you feel. Facial patterns are only an optional, experimental supplement.</span>
    </div>

    <div class="flex justify-between items-center">
      <button class="btn btn-ghost" id="back-btn-q">← Back</button>
      <button class="btn btn-primary" id="questionnaire-next-btn">
        See My Results →
      </button>
    </div>
  </div>`;
}

function attachQuestionnaireListeners(container) {
  // Stress slider
  const slider = container.querySelector('#stress-slider');
  const display = container.querySelector('#stress-display');
  const badge = container.querySelector('#stress-badge');

  if (slider) {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value);
      questionnaire.stress = v;
      if (display) { display.textContent = v; display.style.color = getStressColor(v); }
      if (badge) {
        badge.textContent = getStressLabel(v);
        Object.assign(badge.style, parseStyle(getStressStyle(v)));
      }
    });
  }

  // Sleep options
  container.querySelectorAll('[data-sleep]').forEach(el => {
    el.addEventListener('click', () => {
      questionnaire.sleep = parseInt(el.dataset.sleep);
      container.querySelectorAll('[data-sleep]').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
    });
  });

  // Workload options
  container.querySelectorAll('[data-workload]').forEach(el => {
    el.addEventListener('click', () => {
      questionnaire.workload = parseInt(el.dataset.workload);
      container.querySelectorAll('[data-workload]').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
    });
  });

  // Emotion options
  container.querySelectorAll('[data-emotion]').forEach(el => {
    el.addEventListener('click', () => {
      questionnaire.emotion = parseInt(el.dataset.emotion);
      container.querySelectorAll('[data-emotion]').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
    });
  });

  // Back
  const backBtn = container.querySelector('#back-btn-q');
  if (backBtn) backBtn.addEventListener('click', () => { step = useCamera ? 1 : 0; renderStep(container); });

  // Next → Results
  const nextBtn = container.querySelector('#questionnaire-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const { getScore, getCategory } = window._ssUtils;
      const score = getScore(questionnaire);
      const category = getCategory(score);
      stopCamera();
      navigate('results', {
        score,
        category,
        stress: questionnaire.stress,
        faceLabel: faceResult?.label || 'Not analyzed',
        faceEmoji: faceResult?.emoji || '❓',
        faceColor: faceResult?.color || 'var(--text-muted)',
        sleep: questionnaire.sleep,
        workload: questionnaire.workload,
        emotion: questionnaire.emotion,
        questionnaire,
      });
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────
function getStressColor(v) {
  if (v <= 3) return 'var(--accent-green)';
  if (v <= 6) return 'var(--accent-yellow)';
  return '#f87171';
}

function getStressLabel(v) {
  if (v <= 3) return '🟢 Low Stress';
  if (v <= 6) return '🟡 Moderate Stress';
  return '🔴 High Stress';
}

function getStressStyle(v) {
  if (v <= 3) return 'background:rgba(74,222,128,0.15);color:var(--accent-green);border:1px solid rgba(74,222,128,0.3)';
  if (v <= 6) return 'background:rgba(251,191,36,0.15);color:var(--accent-yellow);border:1px solid rgba(251,191,36,0.3)';
  return 'background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3)';
}

function parseStyle(styleStr) {
  const obj = {};
  styleStr.split(';').forEach(s => {
    const [k, v] = s.split(':');
    if (k && v) obj[k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v.trim();
  });
  return obj;
}
