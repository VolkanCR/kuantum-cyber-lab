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
        this.takeawayBoxEl = document.getElementById("takeawayBox");
        this.statusLineEl = document.getElementById("statusLine");

        /** @type {import('../models/Task.js').Task|null} */
        this.currentTask = null;
        this.isCompleted = false;

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
            !this.takeawayBoxEl ||
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
            this.hideFeedback();
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
     * Yanlış cevap seçildiğinde öğretici açıklamayı ekranda sabit tutar.
     * @param {string} explanationText
     */
    showWrongFeedback(explanationText) {
        this.takeawayBoxEl.className = "takeaway-card visible state-wrong";
        this.takeawayBoxEl.innerHTML = `
            <div class="takeaway-header">
                <span aria-hidden="true">✕</span>
                <span>HATALI PARAMETRE — ÖĞRETİCİ ANALİZ</span>
            </div>
            <div class="takeaway-body">${explanationText}</div>
        `;
    }

    /**
     * Doğru cevap seçildiğinde teknik çıkarımı ve kullanıcı kontrollü geçiş butonunu gösterir.
     * @param {string} optionExplanation
     * @param {string} summaryTakeaway
     */
    showCorrectTakeaway(optionExplanation, summaryTakeaway) {
        const isLastTask = this.currentTask && this.currentTask.id === this.tasks.length;
        const advanceButtonLabel = isLastTask ? "SONUÇ RAPORUNU İNCELE →" : "SONRAKİ MODÜLE İLERLE →";

        this.takeawayBoxEl.className = "takeaway-card visible state-correct";
        this.takeawayBoxEl.innerHTML = `
            <div class="takeaway-header">
                <span aria-hidden="true">✓</span>
                <span>DOĞRULANDI — TEKNİK ÇIKARIM VE ALINAN ÖNLEM</span>
            </div>
            <div class="takeaway-body">
                <p style="margin-bottom: 0.5rem;">${optionExplanation}</p>
                <p><strong>Özet:</strong> ${summaryTakeaway}</p>
            </div>
            <div class="takeaway-action-bar">
                <button type="button" class="btn-advance-task" id="advanceTaskBtn">
                    ${advanceButtonLabel}
                </button>
            </div>
        `;

        const advanceBtn = document.getElementById("advanceTaskBtn");
        if (advanceBtn) {
            advanceBtn.addEventListener("click", () => {
                this.advanceToNextAvailableTask();
            });
        }
    }

    /**
     * Geri bildirim kartını temizler ve kapatır.
     */
    hideFeedback() {
        this.takeawayBoxEl.innerHTML = "";
        this.takeawayBoxEl.className = "takeaway-card";
    }

    /**
     * Soru ve seçenekleri ekrana basar.
     * @param {import('../models/Task.js').Task} task
     */
    renderInteractiveArea(task) {
        this.closeHint();
        this.hideFeedback();

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
            const correctOpt = task.options.find(o => o.isCorrect);
            this.showCorrectTakeaway(
                correctOpt ? correctOpt.explanation : "",
                task.takeaway
            );
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
        if (!this.currentTask) return;

        // Daha önce seçilmiş başka bir yanlış buton varsa vurgusunu temizle
        const allOptionButtons = this.optionsContainerEl.querySelectorAll(".option-node");
        allOptionButtons.forEach(btn => btn.classList.remove("wrong-selected"));

        const evaluation = this.validationEngine.evaluateAnswer({
            task: this.currentTask,
            selectedOption: option,
            totalTasksCount: this.tasks.length
        });

        if (evaluation.isCorrect) {
            buttonEl.classList.add("correct");
            this.disableAllOptionButtons();
            this.setConsoleStatus(evaluation.message, "success");

            // Doğru cevap çıktısını ekranda tut; süre kısıtı koyma, butonu bekle
            this.showCorrectTakeaway(option.explanation, this.currentTask.takeaway);

        } else {
            // Tıklanan şıkkı silme, 'wrong-selected' olarak sabit bırak
            buttonEl.classList.add("wrong-selected");
            this.setConsoleStatus(evaluation.message, "error");

            // Farklı bir şık seçilene kadar öğretici açıklamayı ekranda sabit tut
            this.showWrongFeedback(option.explanation);
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
     * Kullanıcı butona bastığında sıradaki göreve veya sonuç ekranına geçer.
     * @private
     */
    advanceToNextAvailableTask() {
        const state = this.stateManager.getState();
        const nextTask = this.tasks.find(t => !state.completedTaskIds.includes(t.id));

        if (nextTask) {
            this.stateManager.setActiveTask(nextTask.id);
        } else {
            // Tüm görevler tamamlandıysa tamamlanma olayını tetikle
            this.eventBus.publish(APP_CONFIG.EVENTS.LAB_COMPLETED, state);
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