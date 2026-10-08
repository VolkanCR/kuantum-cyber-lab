/**
 * @file 03-fingerprinting.js
 * @description Modül 03: İstemci İmzası ve Başlık Yapısı Senaryosu
 */

export const scenario03 = {
    id: 3,
    title: "İstemci İmzası ve Başlık Yapısı",
    category: "PARMAK İZİ ANALİZİ",
    content: `
        <p>Otomasyon kütüphaneleri varsayılan istek başlıklarıyla kendilerini ele verir. Kuantum Pi denetim mekanizmaları bu alanları inceleyerek istemcinin doğasını ayrıştırır.</p>
        <p>Normal bir tarayıcı ile betik motorunu ayırt etmede ilk hedeflenen protokol alanı, istemcinin işletim sistemi ve tarayıcı motorunu taşıyan üstveridir.</p>
    `,
    question: "Tarayıcı motoru ve işletim sistemi bilgisini taşıyan standart HTTP başlığı nedir?",
    options: [
        {
            id: "opt_3_1",
            text: "Content-Type",
            isCorrect: false,
            explanation: "Content-Type, istek veya yanıt gövdesinde (body) taşınan verinin MIME formatını (ör. application/json, text/html) tanımlar; istemci donanım/tarayıcı bilgisi taşımaz."
        },
        {
            id: "opt_3_2",
            text: "Host",
            isCorrect: false,
            explanation: "Host başlığı isteğin gönderildiği hedef alan adını (domain/IP) belirtir; isteği yapan istemcinin kimliği hakkında bilgi vermez."
        },
        {
            id: "opt_3_3",
            text: "User-Agent",
            isCorrect: true,
            explanation: "User-Agent başlığı, istemcinin tarayıcı çekirdeğini (Chrome, Firefox vb.), işletim sistemini ve mimarisini taşıyarak WAF'ın bot ayrımı yapmasını sağlar."
        },
        {
            id: "opt_3_4",
            text: "Accept-Encoding",
            isCorrect: false,
            explanation: "Accept-Encoding başlığı istemcinin anlayabildiği veri sıkıştırma algoritmalarını (gzip, br, deflate) belirtir; kimlik parmak izi görevi görmez."
        }
    ],
    hint: "Kullanıcı temsilcisi anlamına gelen temel HTTP başlığıdır.",
    points: 20,
    diagram: "assets/diagrams/03-client-fingerprint-vector.svg",
    diagramCaption: "VEKTÖR ANALİZİ: HTTP BAŞLIK AYRIŞTIRMA VE KİMLİK DOĞRULAMA",
    takeaway: "İstek başlığındaki 'User-Agent' alanı ve TLS parmak izi eşleşmesi, normal bir kullanıcı tarayıcısı ile arka planda çalışan Python/curl betiklerini birbirinden ayıran ilk sezgisel parametredir."
};