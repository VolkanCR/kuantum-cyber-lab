/**
 * @file LabSession.js
 * @description Laboratuvar Oturum Takibi ve İlerleme Geçmişi Modeli
 */

export class LabSession {
    /**
     * @param {Object} [initialState={}]
     */
    constructor(initialState = {}) {
        this.activeTaskId = Number(initialState.activeTaskId) || 1;
        this.completedTaskIds = new Set(
            Array.isArray(initialState.completedTaskIds)
                ? initialState.completedTaskIds.map(Number)
                : []
        );
        this.score = Number(initialState.score) || 0;
        this.isCompleted = Boolean(initialState.isCompleted);
        this.startedAt = initialState.startedAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        /** @type {Array<{ taskId: number, timestamp: string, earnedPoints: number }>} */
        this.history = Array.isArray(initialState.history) ? [...initialState.history] : [];
    }

    /**
     * Oturuma tamamlanan görev kaydı ekler.
     * @param {number} taskId
     * @param {number} earnedPoints
     */
    recordCompletion(taskId, earnedPoints) {
        const id = Number(taskId);
        if (!this.completedTaskIds.has(id)) {
            this.completedTaskIds.add(id);
            this.score += Number(earnedPoints);
            this.updatedAt = new Date().toISOString();
            this.history.push({
                taskId: id,
                timestamp: this.updatedAt,
                earnedPoints: Number(earnedPoints)
            });
        }
    }

    /**
     * Oturumu serileştirilebilir bir nesneye dönüştürür.
     * @returns {Object}
     */
    toJSON() {
        return {
            activeTaskId: this.activeTaskId,
            completedTaskIds: Array.from(this.completedTaskIds),
            score: this.score,
            isCompleted: this.isCompleted,
            startedAt: this.startedAt,
            updatedAt: this.updatedAt,
            history: [...this.history]
        };
    }
}