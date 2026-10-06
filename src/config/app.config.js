/**
 * @file app.config.js
 * @description Kuantum Siber Güvenlik — Kuantum Pi CyberLab Merkezi Yapılandırma Modülü
 */

export const APP_CONFIG = Object.freeze({
    COMPANY_NAME: "Kuantum Siber Güvenlik",
    PRODUCT_NAME: "Kuantum Pi",
    LAB_VERSION: "1.0.0",
    LOCATION: "Zonguldak",

    STORAGE: Object.freeze({
        KEY: "kuantum_cyberlab_session_v1",
        MAX_AGE_MS: 1000 * 60 * 60 * 24 * 7 // 7 Gün
    }),

    SCORING: Object.freeze({
        POINTS_PER_TASK: 20,
        MAX_SCORE: 100,
        INITIAL_SCORE: 0
    }),

    TIMING: Object.freeze({
        WRONG_ANSWER_DELAY_MS: 800,
        SUCCESS_ADVANCE_DELAY_MS: 650,
        CONSOLE_TYPING_SPEED_MS: 15
    }),

    EVENTS: Object.freeze({
        // Görev ve Navigasyon Olayları
        TASK_SELECTED: "task:selected",
        TASK_LOADED: "task:loaded",
        
        // Değerlendirme Olayları
        ANSWER_SUBMITTED: "answer:submitted",
        ANSWER_EVALUATED: "answer:evaluated",
        
        // Durum ve Oturum Olayları
        STATE_UPDATED: "state:updated",
        SCORE_CHANGED: "score:changed",
        LAB_COMPLETED: "lab:completed",
        SESSION_RESET: "session:reset",
        
        // Hata ve Sistem Olayları
        SYSTEM_ERROR: "system:error",
        UI_FEEDBACK: "ui:feedback"
    })
});