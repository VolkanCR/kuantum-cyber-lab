/**
 * @file TerminalComponent.js
 * @description İnteraktif Değerlendirme Bölgesi ve Terminal Kontrol Bileşeni
 */

import { APP_CONFIG } from "../config/app.config.js";

export class TerminalComponent {
    /**
     * @param {Object} dependencies
     * @param {import('../core/EventBus.js').EventBus} dependencies.eventBus
     * @param {import('../core/StateManager.js').StateManager} dependencies.stateManager
     * @param {import('../services/ValidationEngine.js').ValidationEngine} dependencies.validationEngine
     * @param {ReadonlyArray<import('../models/Task.js').Task>} dependencies.tasks
     */
    constructor({ eventBus, stateManager, validationEngine, tasks }) {
        if (!eventBus) throw new Error("[TerminalComponent] EventBus bağımlılığı zorunludur.");
        if (!stateManager) throw new Error("[TerminalComponent] StateManager bağımlılığı zorunludur.");
        if (!validationEngine) throw new Error("[TerminalComponent] ValidationEngine bağımlılığı zorunludur.");
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error("[TerminalComponent] Görev listesi zorunludur.");
        }

        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.validationEngine = validationEngine;
        this.tasks = tasks;

        this.interactiveZoneEl = document.getElementById("interactiveZone");
        this.questionTextEl = document.getElementById("questionText");
        this.hintToggleBtnEl = document.getElementById("hintToggleBtn");
        this.hintBoxEl = document.getElementById("hintBox");
        this.optionsContainerEl = document.getElementById("optionsContainer");
        this.statusLineEl = document.getElementById("statusLine");

        /** @type {import('../models/Task.js').Task|null} */
        this.currentTask = null;
        this.isProcessing = false;

        this.assertDomIntegrity();
        this.init();
    }

    /**
     * DOM elemanlarının varlığını doğrular.
     * @private
     */
    assertDomIntegrity() {
        if (
            !this.interactiveZoneEl ||
            !this.questionTextEl ||
            !this.hintToggleBtnEl ||
            !this.hintBoxEl ||
            !this.optionsContainerEl ||
            !this.statusLineEl
        ) {
            throw new Error("[TerminalComponent] Gerekli etkileşim DOM elemanları bulunamadı.");
        }
    }

    /**
     * Dinleyicileri kurar.
     */
    init() {
        this.hintToggleBtnEl.addEventListener("click", () => this.toggleHint());

        this.eventBus.subscribe(APP_CONFIG.EVENTS.TASK_LOADED, ({ task }) => {
            this.currentTask = task;
            this.renderInteractiveArea(task);
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SESSION_RESET, () => {
            this.closeHint();
            this.setConsoleStatus("Sistem sıfırlandı. Seçim bekleniyor...", "");
        });
    }

    /**
     * İpucu kartının görünürlüğünü değiştirir.
     */
    toggleHint() {
        const isCurrentlyVisible = this.hintBoxEl.classList.contains("visible");
        if (isCurrentlyVisible) {
            this.closeHint();
        } else {
            this.openHint();
        }
    }

    openHint() {
        this.hintBoxEl.classList.add("visible");
        this.hintBoxEl.setAttribute("aria-hidden", "false");
        this.hintToggleBtnEl.setAttribute("aria-expanded", "true");
    }

    closeHint() {
        this.hintBoxEl.classList.remove("visible");
        this.hintBoxEl.setAttribute("aria-hidden", "true");
        this.hintToggleBtnEl.setAttribute("aria-expanded", "false");
    }

    /**
     * Soru ve seçenekleri ekrana basar.
     * @param {import('../models/Task.js').Task} task
     */
    renderInteractiveArea(task) {
        this.closeHint();
        this.isProcessing = false;

        this.questionTextEl.textContent = task.question;
        this.hintBoxEl.textContent = task.hint;

        const isTaskCompleted = this.stateManager.isTaskCompleted(task.id);
        this.optionsContainerEl.innerHTML = "";

        task.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "option-node";
            btn.textContent = option.text;
            btn.dataset.optionId = option.id;

            if (isTaskCompleted) {
                btn.disabled = true;
                if (option.isCorrect) {
                    btn.classList.add("correct");
                }
            } else {
                btn.addEventListener("click", () => this.handleOptionSelection(option, btn));
            }

            this.optionsContainerEl.appendChild(btn);
        });

        if (isTaskCompleted) {
            this.setConsoleStatus("— Doğrulandı. Modül tamamlandı.", "success");
        } else {
            this.setConsoleStatus("Seçenek bekleniyor...", "");
        }
    }

    /**
     * Seçenek tıklama olayını yönetir.
     * @private
     * @param {Object} option
     * @param {HTMLButtonElement} buttonEl
     */
    handleOptionSelection(option, buttonEl) {
        if (this.isProcessing || !this.currentTask) return;

        this.isProcessing = true;
        const evaluation = this.validationEngine.evaluateAnswer({
            task: this.currentTask,
            selectedOption: option,
            totalTasksCount: this.tasks.length
        });

        if (evaluation.isCorrect) {
            buttonEl.classList.add("correct");
            this.disableAllOptionButtons();
            this.setConsoleStatus(evaluation.message, "success");

            window.setTimeout(() => {
                this.isProcessing = false;
                this.advanceToNextAvailableTask();
            }, APP_CONFIG.TIMING.SUCCESS_ADVANCE_DELAY_MS);

        } else {
            buttonEl.classList.add("wrong");
            this.setConsoleStatus(evaluation.message, "error");

            window.setTimeout(() => {
                buttonEl.classList.remove("wrong");
                this.setConsoleStatus("Yeniden deneme bekleniyor...", "");
                this.isProcessing = false;
            }, APP_CONFIG.TIMING.WRONG_ANSWER_DELAY_MS);
        }
    }

    /**
     * Tüm seçenek butonlarını pasif yapar.
     * @private
     */
    disableAllOptionButtons() {
        const buttons = this.optionsContainerEl.querySelectorAll(".option-node");
        buttons.forEach((b) => {
            b.disabled = true;
        });
    }

    /**
     * Tamamlanmamış sıradaki göreve otomatik geçiş yapar.
     * @private
     */
    advanceToNextAvailableTask() {
        const state = this.stateManager.getState();
        const nextTask = this.tasks.find(t => !state.completedTaskIds.includes(t.id));

        if (nextTask) {
            this.stateManager.setActiveTask(nextTask.id);
        }
    }

    /**
     * Terminal konsol satırına metin basar.
     * @param {string} message
     * @param {'success'|'error'|''} type
     */
    setConsoleStatus(message, type = "") {
        this.statusLineEl.textContent = message;
        this.statusLineEl.className = `console-log ${type}`.trim();
    }
}