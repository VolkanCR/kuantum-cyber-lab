/**
 * @file Task.js
 * @description Laboratuvar Modül/Görev Veri Modeli ve Tip Doğrulayıcı
 */

export class Task {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.title
     * @param {string} data.category
     * @param {string} data.content
     * @param {string} data.question
     * @param {Array<{ id: string, text: string, isCorrect: boolean }>} data.options
     * @param {string} data.hint
     * @param {number} data.points
     * @param {string} data.diagram
     * @param {string} data.diagramCaption
     * @param {string} data.takeaway
     */
    constructor(data) {
        this.validate(data);

        this.id = Number(data.id);
        this.title = String(data.title).trim();
        this.category = String(data.category).trim();
        this.content = String(data.content).trim();
        this.question = String(data.question).trim();
        this.options = Object.freeze(
            data.options.map((opt, index) => Object.freeze({
                id: opt.id || `opt_${this.id}_${index + 1}`,
                text: String(opt.text).trim(),
                isCorrect: Boolean(opt.isCorrect)
            }))
        );
        this.hint = String(data.hint).trim();
        this.points = Number(data.points);
        this.diagram = String(data.diagram).trim();
        this.diagramCaption = String(data.diagramCaption).trim();
        this.takeaway = String(data.takeaway).trim();

        Object.freeze(this);
    }

    /**
     * Gelen veri nesnesinin alan bütünlüğünü ve tiplerini denetler.
     * @param {Object} data
     * @throws {TypeError|RangeError}
     */
    validate(data) {
        if (!data || typeof data !== "object") {
            throw new TypeError("[Task.validate] Görev verisi geçerli bir nesne olmalıdır.");
        }

        if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0) {
            throw new RangeError("[Task.validate] Görev ID pozitif bir tam sayı olmalıdır.");
        }

        if (!data.title || typeof data.title !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Başlık alanı zorunludur.`);
        }

        if (!data.category || typeof data.category !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Kategori alanı zorunludur.`);
        }

        if (!data.content || typeof data.content !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: İçerik metni zorunludur.`);
        }

        if (!data.question || typeof data.question !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Soru metni zorunludur.`);
        }

        if (!Array.isArray(data.options) || data.options.length < 2) {
            throw new RangeError(`[Task.validate] Modül ${data.id}: En az 2 seçenek tanımlanmalıdır.`);
        }

        const correctOptions = data.options.filter(opt => opt && opt.isCorrect === true);
        if (correctOptions.length !== 1) {
            throw new RangeError(`[Task.validate] Modül ${data.id}: Tam olarak 1 adet doğru seçenek (isCorrect: true) olmalıdır.`);
        }

        if (typeof data.points !== "number" || data.points <= 0) {
            throw new RangeError(`[Task.validate] Modül ${data.id}: Puan pozitif bir değer olmalıdır.`);
        }

        if (!data.diagram || typeof data.diagram !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Diyagram dosya yolu zorunludur.`);
        }

        if (!data.diagramCaption || typeof data.diagramCaption !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Diyagram açıklaması zorunludur.`);
        }

        if (!data.takeaway || typeof data.takeaway !== "string") {
            throw new TypeError(`[Task.validate] Modül ${data.id}: Teknik çıkarım (takeaway) alanı zorunludur.`);
        }
    }
}