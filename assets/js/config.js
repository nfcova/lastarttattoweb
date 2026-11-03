/* ==========================================================================
   LASTART TATTOO — SITE CONFIGURATION
   --------------------------------------------------------------------------
   Bu dosya, kod bilgisi gerektirmeden düzenlenebilecek tüm içerikleri tutar.
   Boş bırakılan ("") iletişim alanları sitede "Yakında" olarak görünür.
   ========================================================================== */
window.LASTART_CONFIG = {
  /* ---- İletişim bilgileri (şimdilik boş — gerçek bilgilerle doldurun) ---- */
  contact: {
    phone: "",          // Örn: "+90 5xx xxx xx xx"
    whatsapp: "",       // Sadece rakamlar, ülke koduyla. Örn: "905xxxxxxxxx"
    instagram: "",      // Sadece kullanıcı adı, @ olmadan. Örn: "lastarttattoo"
    email: "",          // Örn: "info@ornek.com"
    address: "",        // Örn: "Mahalle, Cadde No:1, İlçe / İl"
    mapsUrl: "",        // Google Maps paylaşım bağlantısı (opsiyonel)
    hours: ""           // Örn: "Salı – Cumartesi · 12:00 – 21:00"
  },

  /* ---- Randevu formu gönderimi ----
     endpoint: Formu alacak servis adresi. Örn. Formspree: "https://formspree.io/f/xxxxxxx"
     Boş bırakılırsa ve WhatsApp numarası tanımlıysa, form bilgileri hazır bir
     WhatsApp mesajı olarak açılır (görseller WhatsApp'ta ayrıca eklenmelidir). */
  form: {
    endpoint: "",
    maxFiles: 5,
    maxFileSizeMB: 10
  },

  /* ---- Açılış animasyonu ---- */
  intro: {
    enabled: true,
    oncePerSession: true
  },

  /* ---- Dövme stilleri ----
     image: görsel yolu (jpg/webp/svg). webp verilirse modern tarayıcılarda tercih edilir. */
  styles: [
    { title: "Fine Line",      note: "İnce, hassas çizgiler",          image: "assets/img/styles/fine-line.svg" },
    { title: "Realism",        note: "Gerçekçi portre & doku",          image: "assets/img/styles/realism.jpg", webp: "assets/img/styles/realism.webp" },
    { title: "Black & Grey",   note: "Gölge, derinlik, ton geçişi",     image: "assets/img/styles/black-grey.jpg", webp: "assets/img/styles/black-grey.webp" },
    { title: "Minimal Tattoo", note: "Az ama öz",                       image: "assets/img/styles/minimal.svg" },
    { title: "Custom Designs", note: "Sana özel çizilen tasarımlar",    image: "assets/img/styles/custom.svg" },
    { title: "Lettering",      note: "Yazı & tipografi",                image: "assets/img/styles/lettering.svg" }
  ],

  /* ---- Galeri ----
     ŞU AN GÖSTERİLEN GÖRSELLER GEÇİCİ YER TUTUCUDUR (gerçek dövme çalışması değildir).
     Gerçek çalışmaları eklediğinizde:
       1) Görselleri assets/img/gallery/ klasörüne koyun,
       2) Aşağıdaki listeyi güncelleyin,
       3) placeholder: false yapın (yer tutucu uyarısı kalkar).
     size: "tall" | "wide" | "square" | "" (masonry görünümünü etkiler) */
  gallery: {
    placeholder: true,
    items: [
      { src: "assets/img/gallery/study-owl-01.jpg", webp: "assets/img/gallery/study-owl-01.webp", alt: "Siyah-beyaz baykuş çalışması — yer tutucu görsel", title: "Study I", style: "Black & Grey", size: "tall" },
      { src: "assets/img/gallery/study-moth.svg", alt: "Güve çizimi — yer tutucu görsel", title: "Study II", style: "Fine Line", size: "" },
      { src: "assets/img/gallery/study-geometry.svg", alt: "Geometrik çizim — yer tutucu görsel", title: "Study III", style: "Custom Design", size: "square" },
      { src: "assets/img/gallery/study-owl-02.jpg", webp: "assets/img/gallery/study-owl-02.webp", alt: "Baykuş çifti çalışması — yer tutucu görsel", title: "Study IV", style: "Realism", size: "wide" },
      { src: "assets/img/gallery/study-dagger.svg", alt: "Hançer çizimi — yer tutucu görsel", title: "Study V", style: "Fine Line", size: "tall" },
      { src: "assets/img/gallery/study-botanical.svg", alt: "Botanik ince çizgi — yer tutucu görsel", title: "Study VI", style: "Fine Line", size: "tall" },
      { src: "assets/img/gallery/study-owl-03.jpg", webp: "assets/img/gallery/study-owl-03.webp", alt: "Baykuş portresi — yer tutucu görsel", title: "Study VII", style: "Realism", size: "square" },
      { src: "assets/img/gallery/study-moons.svg", alt: "Ay evreleri çizimi — yer tutucu görsel", title: "Study VIII", style: "Minimal", size: "tall" },
      { src: "assets/img/styles/lettering.svg", alt: "Yazı çalışması — yer tutucu görsel", title: "Study IX", style: "Lettering", size: "" }
    ]
  }
};
