/**
 * @file CompletionComponent.js
 * @description Laboratuvar Tamamlama Ekranı ve Özet Rapor Bileşeni
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

        this.taskContainerEl = document.getElementById("taskContainer");
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
        if (
            !this.taskContainerEl ||
            !this.completionContainerEl ||
            !this.summaryListEl ||
            !this.restartLabBtnEl
        ) {
            throw new Error("[CompletionComponent] Gerekli DOM elemanları bulunamadı.");
        }
    }

    /**
     * Olay dinleyicilerini kurar.
     */
    init() {
        this.restartLabBtnEl.addEventListener("click", () => {
            this.stateManager.resetSession();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.LAB_COMPLETED, () => {
            this.showCompletionView();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SESSION_RESET, () => {
            this.hideCompletionView();
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.TASK_SELECTED, () => {
            this.hideCompletionView();
        });
    }

    /**
     * Tamamlama ekranını ve modül özet tablosunu ekrana basar.
     */
    showCompletionView() {
        const state = this.stateManager.getState();
        this.summaryListEl.innerHTML = "";

        this.tasks.forEach((task) => {
            const isCompleted = state.completedTaskIds.includes(task.id);
            const formattedIndex = String(task.id).padStart(2, "0");

            const row = document.createElement("div");
            row.className = "summary-row";

            row.innerHTML = `
                <span class="summary-task-name">${formattedIndex} — ${task.title}</span>
                <span class="summary-task-status ${isCompleted ? "status-success" : ""}">${isCompleted ? "BAŞARILI" : "TAMAMLANMADI"}</span>
            `;

            this.summaryListEl.appendChild(row);
        });

        this.taskContainerEl.style.display = "none";
        this.completionContainerEl.style.display = "flex";
    }

    /**
     * Tamamlama ekranını gizleyip aktif görev alanını açar.
     */
    hideCompletionView() {
        this.completionContainerEl.style.display = "none";
        this.taskContainerEl.style.display = "flex";
    }
}