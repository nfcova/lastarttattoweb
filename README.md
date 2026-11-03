# LASTART TATTOO — Web Sitesi

Statik, bağımlılıksız (framework yok, build adımı yok) ve yayına hazır web sitesi.
Herhangi bir statik hostinge (Netlify, Vercel, GitHub Pages, cPanel vb.) klasörü olduğu gibi yükleyerek yayınlayabilirsiniz.

## Yerelde çalıştırma

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Açılış animasyonu oturum başına bir kez gösterilir. Tekrar görmek için: `http://localhost:8000/?intro=1`

## Klasör yapısı

```
index.html                 Tüm bölümler (SEO meta, Open Graph, JSON-LD dahil)
assets/css/style.css       Tasarım sistemi + tüm stiller
assets/js/config.js        ← DÜZENLENEBİLİR İÇERİK (iletişim, form, stiller, galeri)
assets/js/intro.js         Dövme makinesi açılış animasyonu (SVG stroke)
assets/js/main.js          Menü, scroll animasyonları, galeri, lightbox, form
assets/img/                Logo (beyaz/koyu, şeffaf), sanatçı fotoğrafı, stil & galeri görselleri
assets/video/              Hero videosu (webm + mp4, sessiz, optimize) ve poster görseli
```

## İçerik düzenleme — `assets/js/config.js`

### İletişim bilgileri
`contact` altındaki alanları doldurun. Boş alanlar sitede “Yakında” olarak görünür.
`instagram` doldurulduğunda footer'daki Instagram bağlantısı da otomatik görünür.

### Randevu formu
Form, kod değişikliği gerektirmeden iki şekilde çalışabilir:

1. **Form servisi (önerilen, görsel ekleriyle birlikte):** `form.endpoint` alanına bir form servisinin adresini yazın.
   Örn. [Formspree](https://formspree.io) → `"https://formspree.io/f/xxxxxxx"`. Form, dosyalar dahil `multipart/form-data` olarak gönderilir.
2. **WhatsApp:** `endpoint` boşsa ve `contact.whatsapp` doluysa, form bilgileri hazır bir WhatsApp mesajı olarak açılır.

İkisi de tanımlı değilse kullanıcıya formun yakında aktif olacağı bilgisi gösterilir.
Form; zorunlu alan, telefon formatı, dosya türü/boyutu/adedi doğrulaması ve spam için honeypot alanı içerir.

### Galeri (önemli)
Galeride şu an gösterilen görseller **yer tutucudur** — gerçek dövme çalışmaları değildir ve sitede bu şekilde etiketlenir.
Gerçek çalışmalar hazır olduğunda:

1. Görselleri `assets/img/gallery/` klasörüne koyun (tercihen ~1200px, jpg + webp),
2. `gallery.items` listesini güncelleyin (`src`, `webp`, `alt`, `title`, `style`, `size`),
3. `gallery.placeholder` değerini `false` yapın (yer tutucu uyarıları kalkar).

`size`: `"tall"`, `"wide"`, `"square"` veya `""` — masonry düzenindeki oranı belirler.

### Dövme stilleri
`styles` listesindeki her kartın başlığı, açıklaması ve görseli buradan değiştirilir.

## Özellikler

- Tam ekran açılış: dövme makinesi iğne titreşimiyle “LASTART TATTOO” yazısını çizer, ardından orijinal logo belirir ve sinematik geçişle ana sayfa açılır. SKIP INTRO, Esc/Enter ile geçilebilir; oturum başına bir kez gösterilir.
- Hero: sessiz, döngüsel, ekrana göre kırpılan siyah-beyaz video; karartma katmanı, film greni, duraklat/oynat düğmesi; ekran dışındayken video duraklar.
- Erişilebilirlik: semantik HTML, skip link, klavye ile tam kullanım, menü/lightbox odak yönetimi, ARIA etiketleri, form hata mesajları.
- `prefers-reduced-motion`: açılış animasyonu, parallax ve hareketli efektler devre dışı kalır, video otomatik oynamaz.
- Performans: lazy-loading görseller, webp + jpg, responsive `srcset`, optimize video (~1 MB), bağımlılık yok.

## Yayın öncesi kontrol listesi

- [ ] `config.js` → iletişim bilgileri
- [ ] `config.js` → `form.endpoint` (veya WhatsApp)
- [ ] Gerçek galeri görselleri + `placeholder: false`
- [ ] Alan adı belli olunca `index.html` içindeki `canonical` ve `og:image` adreslerini tam URL yapın, isterseniz `sitemap.xml` ekleyin
