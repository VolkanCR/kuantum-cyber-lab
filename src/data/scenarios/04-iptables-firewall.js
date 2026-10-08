/**
 * @file 04-iptables-firewall.js
 * @description Modül 04: Paket Filtreleme Kuralı Senaryosu
 */

export const scenario04 = {
    id: 4,
    title: "Paket Filtreleme Kuralı (IPTables)",
    category: "GÜVENLİK DUVARI",
    content: `
        <p>Kuantum Pi ağ geçidine yönelik kaba kuvvet veya port tarama girişimlerinde Linux çekirdeğindeki Netfilter paket filtresine anlık filtreleme kuralları yazılır.</p>
        <p>Saldırganın ağda aktif bir sunucu olup olmadığını anlamasını engellemek için pakete <em>RST (Reset)</em> veya <em>ICMP Port Unreachable</em> yanıtı döndürülmemesi hedeflenir.</p>
    `,
    question: "Saldırgana hiçbir yanıt vermeden gelen paketi sessizce yok sayan iptables hedefi nedir?",
    options: [
        {
            id: "opt_4_1",
            text: "ACCEPT",
            isCorrect: false,
            explanation: "ACCEPT kuralı gelen paketi onaylayarak çekirdekten hedef servise geçişine izin verir; paketi engellemez."
        },
        {
            id: "opt_4_2",
            text: "REJECT",
            isCorrect: false,
            explanation: "REJECT paketi engeller ancak saldırgana açıkça 'bağlantı reddedildi' (TCP RST veya ICMP Unreachable) yanıtı yollar. Bu da hedefte aktif bir cihaz olduğunu saldırgana kanıtlar."
        },
        {
            id: "opt_4_3",
            text: "DROP",
            isCorrect: true,
            explanation: "DROP hedefi paketi hiçbir geri bildirim göndermeden sessizce imha eder. Karşı taraf zaman aşımına uğrayarak cihazın aktif olup olmadığını belirleyemez."
        },
        {
            id: "opt_4_4",
            text: "LOG",
            isCorrect: false,
            explanation: "LOG hedefi sadece paketin üst bilgilerini sistem günlüklerine (syslog) kaydeder; paketin geçişini durdurmaz veya düşürmez."
        }
    ],
    hint: "Paketi sıfır yanıtla yok sayarak karşı tarafı TCP zaman aşımına (timeout) uğratan eylemdir.",
    points: 20,
    diagram: "assets/diagrams/04-iptables-packet-flow.svg",
    diagramCaption: "ÇEKİRDEK AKIŞI: NETFILTER INPUT ZİNCİRİ VE DROP HEDEFİ",
    takeaway: "DROP kuralı, saldırgana 'Port Kapalı' (RST) mesajı göndermez. Karşı taraf bağlantı zaman aşımına (timeout) uğrayarak tarama hızını ciddi ölçüde kaybeder ve ağ varlığını teyit edemez."
};