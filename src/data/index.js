/**
 * @file index.js
 * @description Senaryo Koleksiyonu ve Veri Deposu Giriş Noktası
 */

import { Task } from "../models/Task.js";
import { scenario01 } from "./scenarios/01-network-ssh.js";
import { scenario02 } from "./scenarios/02-waf-bot-defense.js";
import { scenario03 } from "./scenarios/03-fingerprinting.js";
import { scenario04 } from "./scenarios/04-iptables-firewall.js";
import { scenario05 } from "./scenarios/05-gateway-architecture.js";

/**
 * Ham senaryoların Task modeli ile doğrulanmış dondurulmuş listesi.
 * @type {ReadonlyArray<Task>}
 */
export const tasks = Object.freeze([
    new Task(scenario01),
    new Task(scenario02),
    new Task(scenario03),
    new Task(scenario04),
    new Task(scenario05)
]);

/**
 * ID'ye göre görev nesnesi döner.
 * @param {number} id
 * @returns {Task|null}
 */
export function getTaskById(id) {
    const targetId = Number(id);
    return tasks.find(t => t.id === targetId) || null;
}

/**
 * Toplam kayıtlı görev sayısını döner.
 * @returns {number}
 */
export function getTotalTasksCount() {
    return tasks.length;
}

/**
 * İlk görevin referansını döner.
 * @returns {Task}
 */
export function getFirstTask() {
    return tasks[0];
}