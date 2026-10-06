/**
 * @file SidebarComponent.js
 * @description Modül Gezintisi ve İlerleme Paneli Kullanıcı Arayüzü Bileşeni
 */

import { APP_CONFIG } from "../config/app.config.js";

export class SidebarComponent {
    /**
     * @param {Object} dependencies
     * @param {import('../core/EventBus.js').EventBus} dependencies.eventBus
     * @param {import('../core/StateManager.js').StateManager} dependencies.stateManager
     * @param {ReadonlyArray<import('../models/Task.js').Task>} dependencies.tasks
     */
    constructor({ eventBus, stateManager, tasks }) {
        if (!eventBus) throw new Error("[SidebarComponent] EventBus bağımlılığı zorunludur.");
        if (!stateManager) throw new Error("[SidebarComponent] StateManager bağımlılığı zorunludur.");
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error("[SidebarComponent] Geçerli bir görev listesi sağlanmalıdır.");
        }

        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.tasks = tasks;

        this.stepListEl = document.getElementById("stepList");
        this.scoreDisplayEl = document.getElementById("scoreDisplay");
        this.totalScoreDisplayEl = document.getElementById("totalScoreDisplay");
        this.resetBtnEl = document.getElementById("resetBtn");

        this.assertDomIntegrity();
        this.init();
    }

    /**
     * Gerekli DOM elemanlarının varlığını doğrular.
     * @private
     */
    assertDomIntegrity() {
        if (!this.stepListEl || !this.scoreDisplayEl || !this.totalScoreDisplayEl || !this.resetBtnEl) {
            throw new Error("[SidebarComponent] Gerekli DOM elemanlarından biri veya birkaçı bulunamadı.");
        }
    }

    /**
     * Bileşeni başlatır, olayları bağlar ve ilk render'ı yapar.
     */
    init() {
        this.totalScoreDisplayEl.textContent = String(APP_CONFIG.SCORING.MAX_SCORE);
        this.bindEvents();
        this.subscribeToStore();
        this.render();
    }

    /**
     * DOM etkileşimlerini bağlar.
     * @private
     */
    bindEvents() {
        this.resetBtnEl.addEventListener("click", () => {
            const confirmed = window.confirm(
                "Tüm laboratuvar oturumunu ve kazanılan puanları sıfırlamak istediğinize emin misiniz?"
            );
            if (confirmed) {
                this.stateManager.resetSession();
            }
        });
    }

    /**
     * Merkezi olay veriyolunu dinler.
     * @private
     */
    subscribeToStore() {
        this.eventBus.subscribe(APP_CONFIG.EVENTS.STATE_UPDATED, () => {
            this.render();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SCORE_CHANGED, ({ score }) => {
            this.updateScore(score);
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.TASK_SELECTED, () => {
            this.render();
        });
    }

    /**
     * Modül listesini anlık duruma göre yeniden çizer.
     */
    render() {
        const state = this.stateManager.getState();
        this.stepListEl.innerHTML = "";

        this.tasks.forEach((task) => {
            const isCompleted = state.completedTaskIds.includes(task.id);
            const isActive = task.id === state.activeTaskId;

            const li = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = `step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
            button.setAttribute("aria-current", isActive ? "step" : "false");

            const formattedIndex = String(task.id).padStart(2, "0");

            button.innerHTML = `
                <span class="step-circle" aria-hidden="true"></span>
                <span class="step-index-text">${formattedIndex}</span>
                <span class="step-label-text">${task.title}</span>
            `;

            button.addEventListener("click", () => {
                if (state.activeTaskId !== task.id) {
                    this.stateManager.setActiveTask(task.id);
                }
            });

            li.appendChild(button);
            this.stepListEl.appendChild(li);
        });

        this.updateScore(state.score);
    }

    /**
     * Skor panosunu günceller.
     * @param {number} score
     */
    updateScore(score) {
        this.scoreDisplayEl.textContent = String(score);
    }
}