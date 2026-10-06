/**
 * @file StateManager.js
 * @description Merkezi Uygulama Durum Yöneticisi (Reactive State Container)
 */

import { APP_CONFIG } from "../config/app.config.js";

export class StateManager {
    /**
     * @param {import('./EventBus.js').EventBus} eventBus
     * @param {import('./StorageService.js').StorageService} storageService
     */
    constructor(eventBus, storageService) {
        if (!eventBus) throw new Error("[StateManager] EventBus bağımlılığı zorunludur.");
        if (!storageService) throw new Error("[StateManager] StorageService bağımlılığı zorunludur.");

        this.eventBus = eventBus;
        this.storage = storageService;

        /** @private */
        this.state = this.initializeState();
    }

    /**
     * Başlangıç durumunu yerel depolamadan yükler veya varsayılan oluşturur.
     * @private
     * @returns {Object}
     */
    initializeState() {
        const persisted = this.storage.load(null);
        
        if (persisted && Array.isArray(persisted.completedTaskIds)) {
            return {
                activeTaskId: Number(persisted.activeTaskId) || 1,
                completedTaskIds: new Set(persisted.completedTaskIds.map(Number)),
                score: Number(persisted.score) || APP_CONFIG.SCORING.INITIAL_SCORE,
                isCompleted: Boolean(persisted.isCompleted)
            };
        }

        return {
            activeTaskId: 1,
            completedTaskIds: new Set(),
            score: APP_CONFIG.SCORING.INITIAL_SCORE,
            isCompleted: false
        };
    }

    /**
     * Aktif durumun salt-okunur (immutable) bir kopyasını döner.
     * @returns {Object}
     */
    getState() {
        return {
            activeTaskId: this.state.activeTaskId,
            completedTaskIds: Array.from(this.state.completedTaskIds),
            score: this.state.score,
            isCompleted: this.state.isCompleted
        };
    }

    /**
     * Görev seçimi yapar ve olay tetikler.
     * @param {number} taskId
     */
    setActiveTask(taskId) {
        const id = Number(taskId);
        if (isNaN(id) || id <= 0) {
            console.error("[StateManager.setActiveTask] Geçersiz taskId:", taskId);
            return;
        }

        if (this.state.activeTaskId === id) return;

        this.state.activeTaskId = id;
        this.persist();

        this.eventBus.publish(APP_CONFIG.EVENTS.TASK_SELECTED, { taskId: id });
        this.eventBus.publish(APP_CONFIG.EVENTS.STATE_UPDATED, this.getState());
    }

    /**
     * Görevi tamamlandı olarak işaretler ve puan ekler.
     * @param {number} taskId
     * @param {number} points
     * @param {number} totalTasksCount
     */
    markTaskCompleted(taskId, points, totalTasksCount) {
        const id = Number(taskId);
        const earnedPoints = Number(points) || APP_CONFIG.SCORING.POINTS_PER_TASK;

        if (!this.state.completedTaskIds.has(id)) {
            this.state.completedTaskIds.add(id);
            this.state.score = Math.min(
                this.state.score + earnedPoints,
                APP_CONFIG.SCORING.MAX_SCORE
            );

            // Tüm modüller tamamlandı mı kontrolü
            if (this.state.completedTaskIds.size >= totalTasksCount) {
                this.state.isCompleted = true;
                this.eventBus.publish(APP_CONFIG.EVENTS.LAB_COMPLETED, this.getState());
            }

            this.persist();

            this.eventBus.publish(APP_CONFIG.EVENTS.SCORE_CHANGED, { score: this.state.score });
            this.eventBus.publish(APP_CONFIG.EVENTS.STATE_UPDATED, this.getState());
        }
    }

    /**
     * Belirli bir görevin tamamlanıp tamamlanmadığını sorgular.
     * @param {number} taskId
     * @returns {boolean}
     */
    isTaskCompleted(taskId) {
        return this.state.completedTaskIds.has(Number(taskId));
    }

    /**
     * Oturumu ve ilerlemeyi sıfırlar.
     */
    resetSession() {
        this.state.activeTaskId = 1;
        this.state.completedTaskIds.clear();
        this.state.score = APP_CONFIG.SCORING.INITIAL_SCORE;
        this.state.isCompleted = false;

        this.storage.clear();

        this.eventBus.publish(APP_CONFIG.EVENTS.SESSION_RESET);
        this.eventBus.publish(APP_CONFIG.EVENTS.SCORE_CHANGED, { score: this.state.score });
        this.eventBus.publish(APP_CONFIG.EVENTS.STATE_UPDATED, this.getState());
        this.eventBus.publish(APP_CONFIG.EVENTS.TASK_SELECTED, { taskId: 1 });
    }

    /**
     * Durumu yerel depolamaya serileştirir.
     * @private
     */
    persist() {
        this.storage.save({
            activeTaskId: this.state.activeTaskId,
            completedTaskIds: Array.from(this.state.completedTaskIds),
            score: this.state.score,
            isCompleted: this.state.isCompleted
        });
    }
}