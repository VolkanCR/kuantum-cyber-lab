/**
 * @file ValidationEngine.js
 * @description Modül Yanıt Doğrulama ve Değerlendirme Motoru
 */

import { APP_CONFIG } from "../config/app.config.js";

export class ValidationError extends Error {
    /**
     * @param {string} message
     * @param {string} code
     */
    constructor(message, code = "ERR_VALIDATION") {
        super(message);
        this.name = "ValidationError";
        this.code = code;
    }
}

export class ValidationEngine {
    /**
     * @param {import('../core/StateManager.js').StateManager} stateManager
     * @param {import('../core/EventBus.js').EventBus} eventBus
     * @param {import('./LoggerService.js').LoggerService} logger
     */
    constructor(stateManager, eventBus, logger) {
        if (!stateManager) {
            throw new Error("[ValidationEngine] StateManager bağımlılığı zorunludur.");
        }
        if (!eventBus) {
            throw new Error("[ValidationEngine] EventBus bağımlılığı zorunludur.");
        }
        if (!logger) {
            throw new Error("[ValidationEngine] LoggerService bağımlılığı zorunludur.");
        }

        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.logger = logger;
    }

    /**
     * Bir görev için verilen seçeneği doğrular ve değerlendirir.
     * @param {Object} params
     * @param {Object} params.task - Değerlendirilecek görev nesnesi
     * @param {Object} params.selectedOption - Kullanıcının tıkladığı seçenek nesnesi
     * @param {number} params.totalTasksCount - Toplam modül sayısı
     * @returns {Object} Değerlendirme sonucu
     */
    evaluateAnswer({ task, selectedOption, totalTasksCount }) {
        try {
            this.assertValidationParameters(task, selectedOption);

            const isAlreadyCompleted = this.stateManager.isTaskCompleted(task.id);
            const isCorrect = Boolean(selectedOption.isCorrect);

            if (isAlreadyCompleted) {
                this.logger.warn(`Modül ${task.id} zaten tamamlanmış. Puan verilmeyecek.`);
                
                const evaluationResult = {
                    taskId: task.id,
                    isCorrect: true,
                    isAlreadyCompleted: true,
                    earnedPoints: 0,
                    message: "— Modül daha önce doğrulandı.",
                    timestamp: Date.now()
                };

                this.eventBus.publish(APP_CONFIG.EVENTS.ANSWER_EVALUATED, evaluationResult);
                return evaluationResult;
            }

            if (isCorrect) {
                const earnedPoints = Number(task.points) || APP_CONFIG.SCORING.POINTS_PER_TASK;
                
                this.stateManager.markTaskCompleted(task.id, earnedPoints, totalTasksCount);
                this.logger.success(`Modül ${task.id} doğrulandı: ${task.title} (+${earnedPoints} Puan)`);

                const evaluationResult = {
                    taskId: task.id,
                    isCorrect: true,
                    isAlreadyCompleted: false,
                    earnedPoints: earnedPoints,
                    message: "— Başarılı. Kural doğrulandı.",
                    timestamp: Date.now()
                };

                this.eventBus.publish(APP_CONFIG.EVENTS.ANSWER_EVALUATED, evaluationResult);
                return evaluationResult;
            } else {
                this.logger.info(`Modül ${task.id} için yanlış eşleşme girildi.`);

                const evaluationResult = {
                    taskId: task.id,
                    isCorrect: false,
                    isAlreadyCompleted: false,
                    earnedPoints: 0,
                    message: "— Yanlış eşleşme. Parametreleri yeniden inceleyin.",
                    timestamp: Date.now()
                };

                this.eventBus.publish(APP_CONFIG.EVENTS.ANSWER_EVALUATED, evaluationResult);
                return evaluationResult;
            }

        } catch (error) {
            this.logger.error(`[ValidationEngine.evaluateAnswer] Doğrulama hatası:`, error);
            
            const errorResult = {
                taskId: task ? task.id : null,
                isCorrect: false,
                isAlreadyCompleted: false,
                earnedPoints: 0,
                message: "— Doğrulama hatası oluştu.",
                error: error.message,
                timestamp: Date.now()
            };

            this.eventBus.publish(APP_CONFIG.EVENTS.SYSTEM_ERROR, errorResult);
            return errorResult;
        }
    }

    /**
     * Parametrelerin bütünlüğünü ve tip doğruluğunu denetler.
     * @private
     * @param {Object} task
     * @param {Object} selectedOption
     */
    assertValidationParameters(task, selectedOption) {
        if (!task || typeof task !== "object") {
            throw new ValidationError("Geçersiz görev nesnesi iletildi.", "ERR_INVALID_TASK");
        }

        if (typeof task.id !== "number" || isNaN(task.id)) {
            throw new ValidationError("Görev ID'si geçerli bir sayı olmalıdır.", "ERR_INVALID_TASK_ID");
        }

        if (!selectedOption || typeof selectedOption !== "object") {
            throw new ValidationError("Geçersiz seçenek nesnesi iletildi.", "ERR_INVALID_OPTION");
        }

        if (typeof selectedOption.isCorrect !== "boolean") {
            throw new ValidationError("Seçenek doğruluk bayrağı (isCorrect) bozuk.", "ERR_CORRUPT_OPTION");
        }
    }
}