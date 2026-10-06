/**
 * @file LoggerService.js
 * @description Kuantum Pi CyberLab Tanılama ve Günlükleme (Logging) Servisi
 */

export const LogLevel = Object.freeze({
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
    SUCCESS: "SUCCESS"
});

export class LoggerService {
    /**
     * @param {Object} [options={}]
     * @param {string} [options.prefix='KuantumPi']
     * @param {number} [options.maxBufferSize=100]
     * @param {boolean} [options.enableConsole=true]
     */
    constructor(options = {}) {
        this.prefix = options.prefix || "KuantumPi";
        this.maxBufferSize = options.maxBufferSize || 100;
        this.enableConsole = options.enableConsole !== false;

        /** @type {Array<Object>} */
        this.buffer = [];
    }

    /**
     * Günlük girdisi oluşturur, arabelleğe ekler ve konsola yazar.
     * @private
     * @param {string} level
     * @param {string} message
     * @param {Object|null} [context=null]
     * @returns {Object}
     */
    write(level, message, context = null) {
        const timestamp = new Date().toISOString();
        const entry = Object.freeze({
            timestamp,
            level,
            prefix: this.prefix,
            message: String(message),
            context: context ? JSON.parse(JSON.stringify(context)) : null
        });

        this.buffer.push(entry);
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }

        if (this.enableConsole) {
            this.outputToConsole(entry);
        }

        return entry;
    }

    /**
     * Girdiyi seviyesine göre konsola formatlayarak basar.
     * @private
     * @param {Object} entry
     */
    outputToConsole(entry) {
        const timePart = entry.timestamp.split("T")[1].replace("Z", "");
        const formattedTag = `[${entry.prefix}][${timePart}][${entry.level}]`;

        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(formattedTag, entry.message, entry.context || "");
                break;
            case LogLevel.INFO:
                console.info(formattedTag, entry.message, entry.context || "");
                break;
            case LogLevel.WARN:
                console.warn(formattedTag, entry.message, entry.context || "");
                break;
            case LogLevel.ERROR:
                console.error(formattedTag, entry.message, entry.context || "");
                break;
            case LogLevel.SUCCESS:
                console.log(
                    `%c${formattedTag} ${entry.message}`,
                    "color: #111111; font-weight: bold; background: #e4e4e7; padding: 2px 4px;",
                    entry.context || ""
                );
                break;
            default:
                console.log(formattedTag, entry.message, entry.context || "");
        }
    }

    /**
     * Bilgilendirme günlüğü.
     * @param {string} message
     * @param {Object} [context]
     */
    info(message, context = null) {
        return this.write(LogLevel.INFO, message, context);
    }

    /**
     * Hata günlüğü.
     * @param {string} message
     * @param {Error|Object} [errorOrContext]
     */
    error(message, errorOrContext = null) {
        const payload = errorOrContext instanceof Error
            ? { errorName: errorOrContext.name, errorMessage: errorOrContext.message, stack: errorOrContext.stack }
            : errorOrContext;

        return this.write(LogLevel.ERROR, message, payload);
    }

    /**
     * Uyarı günlüğü.
     * @param {string} message
     * @param {Object} [context]
     */
    warn(message, context = null) {
        return this.write(LogLevel.WARN, message, context);
    }

    /**
     * Başarı günlüğü.
     * @param {string} message
     * @param {Object} [context]
     */
    success(message, context = null) {
        return this.write(LogLevel.SUCCESS, message, context);
    }

    /**
     * Hata ayıklama (debug) günlüğü.
     * @param {string} message
     * @param {Object} [context]
     */
    debug(message, context = null) {
        return this.write(LogLevel.DEBUG, message, context);
    }

    /**
     * Arabellekteki tüm geçmiş logları döner.
     * @returns {Array<Object>}
     */
    getHistory() {
        return [...this.buffer];
    }

    /**
     * Log arabelleğini temizler.
     */
    clear() {
        this.buffer = [];
    }
}