/**
 * @file main.js
 * @description Kuantum Pi CyberLab — Sistem Giriş Noktası ve Yaşam Döngüsü Orkestratörü
 */

import { APP_CONFIG } from "./config/app.config.js";
import { EventBus } from "./core/EventBus.js";
import { StorageService } from "./core/StorageService.js";
import { StateManager } from "./core/StateManager.js";
import { LoggerService } from "./services/LoggerService.js";
import { ValidationEngine } from "./services/ValidationEngine.js";
import { tasks, getTotalTasksCount } from "./data/index.js";
import { SidebarComponent } from "./components/SidebarComponent.js";
import { TaskViewerComponent } from "./components/TaskViewerComponent.js";
import { TerminalComponent } from "./components/TerminalComponent.js";
import { CompletionComponent } from "./components/CompletionComponent.js";

/**
 * Laboratuvar uygulaması ana orkestrasyon sınıfı.
 */
class CyberLabApplication {
    constructor() {
        /** @type {LoggerService|null} */
        this.logger = null;
        /** @type {EventBus|null} */
        this.eventBus = null;
        /** @type {StorageService|null} */
        this.storageService = null;
        /** @type {StateManager|null} */
        this.stateManager = null;
        /** @type {ValidationEngine|null} */
        this.validationEngine = null;

        /** @type {SidebarComponent|null} */
        this.sidebarComponent = null;
        /** @type {TaskViewerComponent|null} */
        this.taskViewerComponent = null;
        /** @type {TerminalComponent|null} */
        this.terminalComponent = null;
        /** @type {CompletionComponent|null} */
        this.completionComponent = null;

        this.isInitialized = false;
    }

    /**
     * Tüm altyapıyı ve bileşenleri hiyerarşik sırayla başlatır.
     */
    async bootstrap() {
        if (this.isInitialized) {
            console.warn("[CyberLabApplication] Uygulama zaten başlatılmış durumda.");
            return;
        }

        try {
            // 1. Tanılama ve İzleme Servisi
            this.logger = new LoggerService({
                prefix: "KuantumPi-Lab",
                maxBufferSize: 150,
                enableConsole: true
            });
            this.logger.info("Laboratuvar başlatma süreci devreye alınıyor...", {
                version: APP_CONFIG.LAB_VERSION,
                location: APP_CONFIG.LOCATION
            });

            // 2. Olay Veriyolu (EventBus)
            this.eventBus = new EventBus();

            // 3. Güvenli Kalıcı Depolama
            this.storageService = new StorageService(APP_CONFIG.STORAGE.KEY);

            // 4. Durum Yöneticisi (StateManager)
            this.stateManager = new StateManager(this.eventBus, this.storageService);

            // 5. İş Mantığı ve Doğrulama Motoru (ValidationEngine)
            this.validationEngine = new ValidationEngine(
                this.stateManager,
                this.eventBus,
                this.logger
            );

            // 6. Görev Veri Havuzunun Doğrulanması
            const totalTasks = getTotalTasksCount();
            if (totalTasks === 0) {
                throw new Error("Kayıtlı laboratuvar senaryosu bulunamadı.");
            }
            this.logger.debug(`${totalTasks} adet laboratuvar senaryosu yüklendi.`);

            // 7. Kullanıcı Arayüzü Bileşenleri (UI Components)
            const componentDependencies = {
                eventBus: this.eventBus,
                stateManager: this.stateManager,
                tasks: tasks
            };

            this.sidebarComponent = new SidebarComponent(componentDependencies);
            this.taskViewerComponent = new TaskViewerComponent(componentDependencies);
            this.terminalComponent = new TerminalComponent({
                ...componentDependencies,
                validationEngine: this.validationEngine
            });
            this.completionComponent = new CompletionComponent(componentDependencies);

            // 8. Global Hata ve Olay Dinleyicileri
            this.registerGlobalEventHandlers();

            // 9. İlk Durumun Yansıtılması
            this.restoreInitialViewState();

            this.isInitialized = true;
            this.logger.success("Kuantum Pi CyberLab başarıyla çalışır duruma getirildi.");

        } catch (fatalError) {
            this.handleFatalBootError(fatalError);
        }
    }

    /**
     * Sistem genelindeki kritik durumları dinler.
     * @private
     */
    registerGlobalEventHandlers() {
        this.eventBus.subscribe(APP_CONFIG.EVENTS.SYSTEM_ERROR, (errorDetails) => {
            this.logger.error("Kritik sistem olayı bildirildi:", errorDetails);
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.LAB_COMPLETED, (sessionState) => {
            this.logger.success("Tüm laboratuvar modülleri tamamlandı!", {
                finalScore: sessionState.score,
                completedCount: sessionState.completedTaskIds.length
            });
        });

        this.eventBus.subscribe(APP_CONFIG.EVENTS.SESSION_RESET, () => {
            this.logger.info("Oturum kullanıcı tarafından sıfırlandı.");
        });

        window.addEventListener("unhandledrejection", (event) => {
            this.logger.error("Yakalanmamış Promise reddi tespit edildi:", {
                reason: event.reason
            });
        });
    }

    /**
     * Mevcut oturum durumuna göre ilk görev veya bitiş ekranını yükler.
     * @private
     */
    restoreInitialViewState() {
        const state = this.stateManager.getState();

        if (state.isCompleted) {
            this.eventBus.publish(APP_CONFIG.EVENTS.LAB_COMPLETED, state);
        } else {
            const targetId = state.activeTaskId || 1;
            this.taskViewerComponent.renderTaskById(targetId);
        }
    }

    /**
     * Başlatma sırasında ortaya çıkan ölümcül hataları ekranda güvenli şekilde gösterir.
     * @private
     * @param {Error} error
     */
    handleFatalBootError(error) {
        if (this.logger) {
            this.logger.error("Sistem başlatılırken ölümcül hata:", error);
        } else {
            console.error("[FATAL BOOT ERROR]", error);
        }

        const taskContentEl = document.getElementById("taskContent");
        if (taskContentEl) {
            taskContentEl.innerHTML = `
                <div style="border: 1px solid #111; padding: 1.5rem; background: #fafafa; font-family: monospace;">
                    <p style="font-weight: bold; margin-bottom: 0.5rem;">[SİSTEM BAŞLATILAMADI]</p>
                    <p style="font-size: 0.85rem; color: #555;">Laboratuvar modülleri yüklenirken teknik bir istisna meydana geldi.</p>
                    <p style="font-size: 0.75rem; color: #888; margin-top: 0.5rem;">Hata: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Tarayıcı DOM hazır olduğunda sistemi ayağa kaldır
const app = new CyberLabApplication();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        app.bootstrap();
    });
} else {
    app.bootstrap();
}

// Konsol üzerinden izleme amacıyla salt-okunur referans tanımlaması
Object.defineProperty(window, "__KUANTUM_PI_LAB__", {
    value: Object.freeze({
        getInstance: () => app,
        version: APP_CONFIG.LAB_VERSION
    }),
    writable: false,
    configurable: false
});