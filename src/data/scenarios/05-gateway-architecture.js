/**
 * @file 05-gateway-architecture.js
 * @description Modül 05: Cihaz Ağ Konumlandırması Senaryosu
 */

export const scenario05 = {
    id: 5,
    title: "Cihaz Ağ Konumlandırması",
    category: "AĞ MİMARİSİ",
    content: `
        <p><strong>Kuantum Pi</strong> donanımının yerel ağdaki istemci veya ofis trafiğini süzebilmesi, DNS ve paket filtrelerini uygulayabilmesi için tüm cihazların çıkış rotasında yer alması gerekir.</p>
        <p>Yerel ağdaki tüm uç noktaların dış internete çıkmadan önce uğramak zorunda olduğu merkezi rota tanımı bu cihaz üzerinden yönetilir.</p>
    `,
    question: "Kuantum Pi'nin tüm ağ trafiğini denetleyebilmesi için yerel ağdaki fonksiyonel rolü nedir?",
    options: [
        { id: "opt_5_1", text: "Varsayılan Ağ Geçidi (Default Gateway)", isCorrect: true },
        { id: "opt_5_2", text: "Yedek DNS Sunucusu", isCorrect: false },
        { id: "opt_5_3", text: "Web Barındırma Sunucusu", isCorrect: false },
        { id: "opt_5_4", text: "Ağ Yazıcısı Paylaşım Noktası", isCorrect: false }
    ],
    hint: "Yerel ağın dış dünyaya açıldığı ve yönlendiricinin çıkış rotası olarak tanımlanan tek çıkış kapısıdır.",
    points: 20,
    diagram: "assets/diagrams/05-gateway-perimeter-layout.svg",
    diagramCaption: "PERİMETRE TOPOLOJİSİ: DEFAULT GATEWAY MERKEZİ KONUMLANDIRMASI",
    takeaway: "Cihazın 'Varsayılan Ağ Geçidi' (Default Gateway) olarak konuşlandırılması, tüm LAN segmentinin dış internet trafiğini tek bir fiziksel ve mantıksal denetim noktasından geçmeye zorunlu kılar."
};