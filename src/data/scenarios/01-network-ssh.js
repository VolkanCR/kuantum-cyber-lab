/**
 * @file 01-network-ssh.js
 * @description Modül 01: Uzak Erişim ve Port Kısıtlama Senaryosu
 */

export const scenario01 = {
    id: 1,
    title: "Uzak Erişim ve Port Kısıtlama",
    category: "AĞ GÜVENLİĞİ",
    content: `
        <p><strong>Kuantum Pi</strong> donanımının yönetim ve yapılandırma arayüzü şifrelenmiş tüneller üzerinden yürütülür. Açık bırakılan varsayılan portlar harici tarayıcılara doğrudan saldırı yüzeyi sunar.</p>
        <p>Sistem güvenliği için yönetim servisinin dinlediği standart port bilinmeli ve WAN (dış internet) erişimine tamamen kapatılarak yalnızca yerel yönetim IP bloğuna izin verilmelidir.</p>
    `,
    question: "Kuantum Pi'nin dinlediği standart güvenli kabuk (SSH) portu nedir?",
    options: [
        {
            id: "opt_1_1",
            text: "Port 21 (FTP)",
            isCorrect: false,
            explanation: "Port 21 dosya aktarımı (FTP) için ayrılmıştır. Şifrelenmiş interaktif kabuk erişimi sunmaz ve kimlik bilgilerini düz metin ilettiği için güvenli yönetimde kullanılmaz."
        },
        {
            id: "opt_1_2",
            text: "Port 22 (SSH)",
            isCorrect: true,
            explanation: "Standart güvenli kabuk (SSH) portudur. Kriptografik tünel üzerinden kimlik doğrulama ve uzaktan komut yürütme sağlar."
        },
        {
            id: "opt_1_3",
            text: "Port 23 (Telnet)",
            isCorrect: false,
            explanation: "Port 23 eski Telnet protokolüdür. Tüm oturum trafiğini ve parolaları şifresiz aktardığı için modern güvenlik standartlarında kesinlikle engellenmelidir."
        },
        {
            id: "opt_1_4",
            text: "Port 80 (HTTP)",
            isCorrect: false,
            explanation: "Port 80 şifrelenmemiş web sunucu trafiği içindir. Donanım yönetim konsolu veya güvenli kabuk protokolüyle ilişkisi yoktur."
        }
    ],
    hint: "Şifresiz Telnet protokolünden (23) bir önceki standart değerdir.",
    points: 20,
    diagram: "assets/diagrams/01-ssh-tunnel-topology.svg",
    diagramCaption: "TOPOLOJİ ŞEMASI: GÜVENLİ SSH YÖNETİM TÜNELİ VE WAN İZOLASYONU",
    takeaway: "Varsayılan SSH portunun (22) WAN erişimine kısıtlanması, dış ağdan gelebilecek otomatik port taramalarını ve kaba kuvvet (brute-force) saldırı yüzeyini tamamen ortadan kaldırır."
};