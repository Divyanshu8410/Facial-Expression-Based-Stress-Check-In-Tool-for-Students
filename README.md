# 🧠 StressSense AI — Student Wellness Check-In Tool

A modern, student-friendly web application for facial-expression-based stress check-ins. Combines optional webcam facial landmark analysis with a self-reported questionnaire to help students reflect on their well-being.

**⚠️ Not a medical tool.** This is a wellness reflection app for personal use only.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 Facial Expression Check-In | Optional MediaPipe Face Landmarker analysis (runs 100% in-browser) |
| 📋 Self-Reported Questionnaire | Stress level, sleep, workload, and emotional state |
| 📊 Results Dashboard | Color-coded stress score, face label, and explanation |
| 🌬️ Breathing Exercise | Animated 4-7-8 breathing guide with Start/Pause/Reset |
| 📈 History & Analytics | Timeline + Chart.js trend chart and distribution chart |
| 🔒 Privacy First | No images stored, all data local, explicit consent required |
| 🗑️ Delete History | One-click history wipe from the History page |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## 🚀 Getting Started

### Option A — Open directly (simplest)
1. Open `index.html` in a **modern browser** (Chrome, Edge, Firefox, Safari)
2. That's it — no installation, no build step

> **Note:** Camera (MediaPipe) features require internet access the first time to download the WASM model (~10 MB). Subsequent loads use the browser cache.

### Option B — Serve with a local web server (recommended for camera)
Some browsers block camera access on `file://` URLs. Use any local server:

```bash
# Python 3
python -m http.server 8080

# Node.js (if available)
npx serve .

# VS Code: use the "Live Server" extension
```
Then open `http://localhost:8080`

---

## 📁 Project Structure

```
stress-sense/
├── index.html           # App entry point
├── styles.css           # Design system (light theme; used by the modular files)
├── app.js               # SPA router + breathing engine
├── modules/
│   ├── state.js         # Global app state
│   ├── layout.js        # Navbar, sidebar, mobile nav
│   ├── utils.js         # localStorage, scoring, recommendations
│   └── sampleData.js    # Pre-seeded demo data
└── pages/
    ├── home.js          # Dashboard page
    ├── checkin.js       # 4-step check-in flow + camera
    ├── results.js       # Results + recommendations
    ├── breathing.js     # 4-7-8 breathing exercise UI
    └── history.js       # Timeline + Chart.js charts
```

---

## 🔬 Facial Analysis — How It Works

The app uses **MediaPipe Face Landmarker** with **Face Blendshapes** (52 AU-style coefficients) to observe visible facial expression patterns:

| Blendshapes Used | Pattern Observed |
|---|---|
| `mouthSmileLeft/Right`, `cheekSquintLeft/Right` | 😊 Positive / Relaxed |
| `browInnerUp`, `browDownLeft/Right`, `mouthFrownLeft/Right` | 😟 Tense-Looking |
| `eyeSquintLeft/Right` | 😴 Tired-Looking |
| `jawOpen` | 😮 Surprised / Alert |
| (default) | 😐 Neutral |

**Important limitations:**
- Facial expressions do not reliably reflect internal stress
- Lighting, angle, and individual differences affect results significantly
- Results are averaged over 8 seconds of analysis
- This feature is labeled "Experimental" throughout the app

---

## 📊 Scoring

The self-reported questionnaire produces a **Wellness Index (0–100)**:

| Factor | Weight |
|---|---|
| Stress level (1–10) | Up to 40 points |
| Sleep quality | Up to 20 points |
| Academic workload | Up to 30 points |
| Emotional state | Up to 10 points |

Categories:
- 🟢 **Low** — Score 0–30 (Self-reported stress 1–3)
- 🟡 **Moderate** — Score 31–60 (Self-reported stress 4–6)
- 🔴 **High** — Score 61–100 (Self-reported stress 7–10)

*These are informal wellness labels, not validated clinical thresholds.*

---

## 🔒 Privacy & Safety

- ✅ Camera permission only requested after explicit user action
- ✅ No webcam images or video are ever saved
- ✅ All facial processing runs locally via WebAssembly
- ✅ Check-in history stored only in browser `localStorage`
- ✅ Complete history deletion available at any time
- ✅ Camera-free alternative always available
- ✅ Support message shown if score ≥ 70 or stress ≥ 8
- ❌ Never used for grading, attendance, or surveillance
- ❌ Does not diagnose anxiety, depression, or any condition

---

## 🛠️ Dependencies (All via CDN — no installation)

| Library | Version | Purpose |
|---|---|---|
| Chart.js | 4.4.0 | Trend + distribution charts |
| @mediapipe/tasks-vision | 0.10.14 | Face landmarker (camera mode) |
| Google Fonts — Inter + Outfit | latest | Typography |

---

## 📸 Sample Data

The app is pre-seeded with 7 sample check-ins spanning the last 7 days, so you can explore the history page and charts immediately. This data is only added if no existing history is found.

---

## ⚕️ Disclaimer

This application is for **personal wellness reflection only**. It is not a substitute for professional mental health care.

If you are experiencing severe or persistent distress, please reach out to:
- A trusted counselor, mentor, or mental health professional
- A crisis helpline in your country
- Emergency services if you are in immediate danger
