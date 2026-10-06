/**
 * @file 02-waf-bot-defense.js
 * @description Modül 02: Bot Koruması ve HTTP Durum Kodu Senaryosu
 */

export const scenario02 = {
    id: 2,
    title: "Bot Koruması ve HTTP Durum Kodu",
    category: "UYGULAMA KATMANI",
    content: `
        <p>Kuantum Siber Güvenlik altyapısında veri kaynaklarına yönelik otomatik kazıma (scraping) denemelerinde sunucu önündeki WAF (Web Application Firewall) katmanı istekleri derinlemesine inceler.</p>
        <p>Tarayıcı kimliği doğrulanmayan betiklerin, hız sınırını (rate-limit) aşan istemcilerin erişimi uygulama motoruna ulaşmadan standart bir HTTP durum kodu ile kesilir.</p>
    `,
    question: "Yetkisiz bot erişimi ve WAF engellemesinde dönen 'Forbidden' HTTP kodu hangisidir?",
    options: [
        { id: "opt_2_1", text: "200 OK", isCorrect: false },
        { id: "opt_2_2", text: "403 Forbidden", isCorrect: true },
        { id: "opt_2_3", text: "404 Not Found", isCorrect: false },
        { id: "opt_2_4", text: "500 Internal Server Error", isCorrect: false }
    ],
    hint: "İstemci hataları (4xx) sınıfında yer alır; kaynağın var olduğunu ancak erişim izninizin bulunmadığını belirtir.",
    points: 20,
    diagram: "assets/diagrams/02-waf-filtering-pipeline.svg",
    diagramCaption: "PİPELINE ŞEMASI: WAF BAŞLIK DENETİMİ VE 403 ENGELLEME DÖNGÜSÜ"
};