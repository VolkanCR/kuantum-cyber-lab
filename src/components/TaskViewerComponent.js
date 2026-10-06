/**
 * @file TaskViewerComponent.js
 * @description Görev İçeriği ve Vektörel Diyagram Görüntüleyici Bileşeni
 */

import { APP_CONFIG } from "../config/app.config.js";

export class TaskViewerComponent {
    /**
     * @param {Object} dependencies
     * @param {import('../core/EventBus.js').EventBus} dependencies.eventBus
     * @param {import('../core/StateManager.js').StateManager} dependencies.stateManager
     * @param {ReadonlyArray<import('../models/Task.js').Task>} dependencies.tasks
     */
    constructor({ eventBus, stateManager, tasks }) {
        if (!eventBus) throw new Error("[TaskViewerComponent] EventBus bağımlılığı zorunludur.");
        if (!stateManager) throw new Error("[TaskViewerComponent] StateManager bağımlılığı zorunludur.");
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error("[TaskViewerComponent] Geçerli bir görev listesi sağlanmalıdır.");
        }

        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.tasks = tasks;

        this.taskContainerEl = document.getElementById("taskContainer");
        this.taskIndexEl = document.getElementById("taskIndex");
        this.taskCategoryEl = document.getElementById("taskCategory");
        this.taskTitleEl = document.getElementById("taskTitle");
        this.taskContentEl = document.getElementById("taskContent");
        this.diagramWrapperEl = document.getElementById("diagramWrapper");
        this.diagramCaptionEl = document.getElementById("diagramCaption");

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
            !this.taskIndexEl ||
            !this.taskCategoryEl ||
            !this.taskTitleEl ||
            !this.taskContentEl ||
            !this.diagramWrapperEl ||
            !this.diagramCaptionEl
        ) {
            throw new Error("[TaskViewerComponent] Gerekli DOM elemanlarından biri veya birkaçı eksik.");
        }
    }

    /**
     * Olay aboneliklerini başlatır.
     */
    init() {
        this.eventBus.subscribe(APP_CONFIG.EVENTS.TASK_SELECTED, ({ taskId }) => {
            this.renderTaskById(taskId);
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.LAB_COMPLETED, () => {
            this.taskContainerEl.style.display = "none";
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SESSION_RESET, () => {
            this.taskContainerEl.style.display = "flex";
            this.renderTaskById(1);
        });
    }

    /**
     * Verilen ID'ye sahip görevi ekrana yansıtır.
     * @param {number} taskId
     */
    renderTaskById(taskId) {
        const task = this.tasks.find(t => t.id === Number(taskId));
        if (!task) {
            console.error(`[TaskViewerComponent] Modül ID bulunamadı: ${taskId}`);
            return;
        }

        this.taskContainerEl.style.display = "flex";
        this.taskIndexEl.textContent = String(task.id).padStart(2, "0");
        this.taskCategoryEl.textContent = task.category;
        this.taskTitleEl.textContent = task.title;
        this.taskContentEl.innerHTML = task.content;
        this.diagramCaptionEl.textContent = task.diagramCaption;

        this.loadDiagram(task.diagram, task.diagramCaption);
        this.eventBus.publish(APP_CONFIG.EVENTS.TASK_LOADED, { task });
    }

    /**
     * SVG diyagram dosyasını çeker ve kapsayıcıya enjekte eder.
     * @private
     * @param {string} diagramUrl
     * @param {string} captionText
     */
    async loadDiagram(diagramUrl, captionText) {
        this.diagramWrapperEl.innerHTML = `
            <span class="placeholder-text">Mimari şema yükleniyor...</span>
        `;

        try {
            const response = await fetch(diagramUrl);
            if (!response.ok) {
                throw new Error(`Diyagram alınamadı: HTTP ${response.status}`);
            }
            const svgContent = await response.text();
            this.diagramWrapperEl.innerHTML = svgContent;
        } catch (error) {
            console.warn(`[TaskViewerComponent] SVG inline yüklenemedi, nesne fallback kullanılıyor:`, error);
            this.diagramWrapperEl.innerHTML = `
                <img src="${diagramUrl}" alt="${captionText}" loading="lazy" style="max-width: 100%; height: auto;" />
            `;
        }
    }
}