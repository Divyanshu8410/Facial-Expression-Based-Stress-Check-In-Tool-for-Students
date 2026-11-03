// ============================================================
// AppState — Central application state store
// ============================================================

export const AppState = {
  currentPage: 'home',
  pageData: {},

  // Current check-in in progress
  checkin: {
    step: 0,               // 0=privacy, 1=camera, 2=questionnaire, 3=done
    useCamera: null,       // true/false
    faceResult: null,      // { label, emoji, confidence }
    questionnaire: null,   // { stress, sleep, workload, emotion }
    score: null,           // 0-100
    category: null,        // 'low' | 'moderate' | 'high'
  },
};
