/**
 * @file EventBus.js
 * @description Gevşek bağlı mimari için merkezi olay dağıtıcısı (Pub/Sub Event Bus)
 */

export class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this.subscribers = new Map();
    }

    /**
     * Belirli bir olaya dinleyici abone eder.
     * @param {string} eventName - Dinlenecek olayın adı
     * @param {Function} callback - Olay tetiklendiğinde çalıştırılacak fonksiyon
     * @returns {Function} Aboneliği iptal etmek için çağrılacak temizleme fonksiyonu (unsubscribe)
     */
    subscribe(eventName, callback) {
        if (typeof eventName !== "string" || eventName.trim() === "") {
            throw new TypeError("[EventBus.subscribe] Geçersiz olay adı sağlandı.");
        }
        if (typeof callback !== "function") {
            throw new TypeError("[EventBus.subscribe] Callback bir fonksiyon olmalıdır.");
        }

        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, new Set());
        }

        const handlers = this.subscribers.get(eventName);
        handlers.add(callback);

        return () => this.unsubscribe(eventName, callback);
    }

    /**
     * Kayıtlı bir dinleyiciyi abonelikten çıkarır.
     * @param {string} eventName
     * @param {Function} callback
     */
    unsubscribe(eventName, callback) {
        if (!this.subscribers.has(eventName)) {
            return;
        }

        const handlers = this.subscribers.get(eventName);
        handlers.delete(callback);

        if (handlers.size === 0) {
            this.subscribers.delete(eventName);
        }
    }

    /**
     * Bir olayı yayınlar ve tüm abonelere güvenli şekilde veri iletir.
     * Tek bir dinleyicideki hata diğer dinleyicileri veya yürütmeyi durdurmaz.
     * @param {string} eventName
     * @param {*} [payload=null]
     */
    publish(eventName, payload = null) {
        if (typeof eventName !== "string") {
            console.error("[EventBus.publish] Geçersiz olay adı:", eventName);
            return;
        }

        if (!this.subscribers.has(eventName)) {
            return;
        }

        const handlers = this.subscribers.get(eventName);
        handlers.forEach((callback) => {
            try {
                callback(payload);
            } catch (error) {
                console.error(
                    `[EventBus] '${eventName}' dinleyicisi yürütülürken hata oluştu:`,
                    error
                );
            }
        });
    }

    /**
     * Tüm olay dinleyicilerini sıfırlar.
     */
    clearAll() {
        this.subscribers.clear();
    }
}