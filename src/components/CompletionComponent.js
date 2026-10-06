/**
 * @file CompletionComponent.js
 * @description Laboratuvar Tamamlama ve Özet Raporlama Bileşeni
 */

import { APP_CONFIG } from "../config/app.config.js";

export class CompletionComponent {
    /**
     * @param {Object} dependencies
     * @param {import('../core/EventBus.js').EventBus} dependencies.eventBus
     * @param {import('../core/StateManager.js').StateManager} dependencies.stateManager
     * @param {ReadonlyArray<import('../models/Task.js').Task>} dependencies.tasks
     */
    constructor({ eventBus, stateManager, tasks }) {
        if (!eventBus) throw new Error("[CompletionComponent] EventBus bağımlılığı zorunludur.");
        if (!stateManager) throw new Error("[CompletionComponent] StateManager bağımlılığı zorunludur.");
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error("[CompletionComponent] Görev listesi zorunludur.");
        }

        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.tasks = tasks;

        this.completionContainerEl = document.getElementById("completionContainer");
        this.summaryListEl = document.getElementById("summaryList");
        this.restartLabBtnEl = document.getElementById("restartLabBtn");

        this.assertDomIntegrity();
        this.init();
    }

    /**
     * DOM elemanlarının varlığını doğrular.
     * @private
     */
    assertDomIntegrity() {
        if (!this.completionContainerEl || !this.summaryListEl || !this.restartLabBtnEl) {
            throw new Error("[CompletionComponent] Gerekli sonuç DOM elemanları bulunamadı.");
        }
    }

    /**
     * Olay dinleyicilerini bağlar.
     */
    init() {
        this.restartLabBtnEl.addEventListener("click", () => {
            this.stateManager.resetSession();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.LAB_COMPLETED, () => {
            this.renderSummary();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SESSION_RESET, () => {
            this.completionContainerEl.style.display = "none";
        });

        // Sayfa yenilendiğinde zaten bitmiş bir durum varsa tetikler
        const state = this.stateManager.getState();
        if (state.isCompleted) {
            this.renderSummary();
        }
    }

    /**
     * Özet doğrulama matrisini ekrana çizer ve görünümü açar.
     */
    renderSummary() {
        this.summaryListEl.innerHTML = "";

        this.tasks.forEach((task) => {
            const row = document.createElement("div");
            row.className = "summary-row";

            const formattedId = String(task.id).padStart(2, "0");
            row.innerHTML = `
                <span class="summary-row-title">${formattedId} — ${task.title}</span>
                <span class="summary-row-status verified">DOĞRULANDI [OK]</span>
            `;

            this.summaryListEl.appendChild(row);
        });

        this.completionContainerEl.style.display = "flex";
    }
}