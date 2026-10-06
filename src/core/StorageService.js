/**
 * @file StorageService.js
 * @description LocalStorage soyutlaması ve bellek yedekli (in-memory fallback) veri saklayıcı
 */

export class StorageService {
    /**
     * @param {string} storageKey
     */
    constructor(storageKey) {
        if (!storageKey || typeof storageKey !== "string") {
            throw new Error("[StorageService] Geçerli bir storageKey belirtilmelidir.");
        }
        this.storageKey = storageKey;
        this.memoryStore = new Map();
        this.isLocalStorageAvailable = this.checkAvailability();
    }

    /**
     * LocalStorage erişilebilirliğini test eder (Özel pencere modları ve izin kontrolleri).
     * @returns {boolean}
     */
    checkAvailability() {
        try {
            const testKey = `__kuantum_test_${Date.now()}__`;
            window.localStorage.setItem(testKey, "1");
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn("[StorageService] localStorage kısıtlı. Bellek içi (in-memory) depolamaya geçildi.");
            return false;
        }
    }

    /**
     * Veriyi JSON formatında saklar.
     * @param {Object} data
     * @returns {boolean} İşlem başarısı
     */
    save(data) {
        const payload = {
            data: data,
            timestamp: Date.now()
        };

        try {
            const serialized = JSON.stringify(payload);
            if (this.isLocalStorageAvailable) {
                window.localStorage.setItem(this.storageKey, serialized);
            } else {
                this.memoryStore.set(this.storageKey, serialized);
            }
            return true;
        } catch (error) {
            console.error("[StorageService.save] Veri kaydedilirken hata oluştu:", error);
            return false;
        }
    }

    /**
     * Saklanan veriyi okur ve doğrular.
     * @param {Object} defaultFallback - Veri bulunamadığında dönecek varsayılan değer
     * @returns {Object}
     */
    load(defaultFallback = null) {
        try {
            let serialized = null;

            if (this.isLocalStorageAvailable) {
                serialized = window.localStorage.getItem(this.storageKey);
            } else {
                serialized = this.memoryStore.get(this.storageKey) || null;
            }

            if (!serialized) {
                return defaultFallback;
            }

            const parsed = JSON.parse(serialized);

            if (parsed && typeof parsed === "object" && "data" in parsed) {
                return parsed.data;
            }

            return defaultFallback;
        } catch (error) {
            console.error("[StorageService.load] Veri parse edilemedi, varsayılan değer dönülüyor:", error);
            return defaultFallback;
        }
    }

    /**
     * Saklanan veriyi tamamen siler.
     */
    clear() {
        try {
            if (this.isLocalStorageAvailable) {
                window.localStorage.removeItem(this.storageKey);
            }
            this.memoryStore.delete(this.storageKey);
        } catch (error) {
            console.error("[StorageService.clear] Veri silinirken hata oluştu:", error);
        }
    }
}