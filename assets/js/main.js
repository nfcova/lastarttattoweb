/* ==========================================================================
   LASTART TATTOO — Main interactions
   Navigation · reveals · parallax · styles/gallery rendering · lightbox ·
   appointment form · contact details · hero video controls
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = window.LASTART_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isTouch = window.matchMedia('(hover: none)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pictureHTML(item, alt, extra) {
    var webp = item.webp ? '<source type="image/webp" srcset="' + esc(item.webp) + '">' : '';
    return '<picture>' + webp + '<img src="' + esc(item.src || item.image) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"' + (extra || '') + '></picture>';
  }

  /* ---------------------------------------------------------------- Header */
  var header = $('#header');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // Active section highlight
  var navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ----------------------------------------------------------- Mobile menu */
  var burger = $('#burger');
  var menu = $('#mobile-menu');
  var menuOpen = false;

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      $('#main').inert = true;
      setTimeout(function () { var first = $('a', menu); if (first) first.focus({ preventScroll: true }); }, 350);
    } else {
      menu.classList.remove('is-open');
      $('#main').inert = false;
      setTimeout(function () { if (!menuOpen) menu.hidden = true; }, reduceMotion.matches ? 0 : 800);
    }
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenu(false); burger.focus(); }
    if (e.key === 'Tab') { // focus trap: menu links + burger
      var items = [burger].concat($$('a', menu));
      var idx = items.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && menuOpen) setMenu(false); });

  /* -------------------------------------------------------- Styles render */
  var stylesGrid = $('#styles-grid');
  if (stylesGrid && Array.isArray(CONFIG.styles)) {
    stylesGrid.innerHTML = CONFIG.styles.map(function (s, i) {
      var num = String(i + 1).padStart(2, '0');
      return '<li class="reveal">' +
        '<article class="style-card">' +
          '<div class="style-card__media">' + pictureHTML({ src: s.image, webp: s.webp }, '') + '</div>' +
          '<span class="style-card__num" aria-hidden="true">' + num + '</span>' +
          '<div class="style-card__body">' +
            '<h3 class="style-card__title" lang="en">' + esc(s.title) + '</h3>' +
            '<p class="style-card__note">' + esc(s.note || '') + '</p>' +
          '</div>' +
          '<a class="style-card__link" href="#contact" aria-label="' + esc(s.title) + ' dövme için randevu talep et"></a>' +
        '</article></li>';
    }).join('');
  }

  /* ------------------------------------------------------- Gallery render */
  var galleryGrid = $('#gallery-grid');
  var galleryItems = (CONFIG.gallery && CONFIG.gallery.items) || [];
  var galleryPlaceholder = !!(CONFIG.gallery && CONFIG.gallery.placeholder);
  if (galleryPlaceholder) { var notice = $('#gallery-notice'); if (notice) notice.hidden = false; }
  if (galleryGrid) {
    galleryGrid.innerHTML = galleryItems.map(function (it, i) {
      return '<li class="gallery__item reveal" data-size="' + esc(it.size || '') + '">' +
        '<button class="gallery__btn" type="button" data-index="' + i + '" aria-label="Büyüt: ' + esc(it.title || it.alt) + '">' +
          pictureHTML(it, it.alt || '') +
          (galleryPlaceholder ? '<span class="gallery__badge">Örnek</span>' : '') +
          '<span class="gallery__zoom" aria-hidden="true">+</span>' +
          '<span class="gallery__meta"><span class="gallery__meta-title">' + esc(it.title || '') + '</span>' +
          '<span class="gallery__meta-style" lang="en">' + esc(it.style || '') + '</span></span>' +
        '</button></li>';
    }).join('');
  }

  /* ------------------------------------------------------------- Lightbox */
  var lb = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbCap = $('#lightbox-caption');
  var lbIndex = 0;
  var lastFocus = null;

  function showItem(i) {
    if (!galleryItems.length) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var it = galleryItems[lbIndex];
    lbImg.classList.add('is-swapping');
    var src = it.full || it.src;
    var tmp = new Image();
    tmp.onload = tmp.onerror = function () {
      lbImg.src = src;
      lbImg.alt = it.alt || '';
      void lbImg.offsetWidth;
      lbImg.classList.remove('is-swapping');
    };
    tmp.src = src;
    lbCap.textContent = [it.title, it.style, (lbIndex + 1) + ' / ' + galleryItems.length].filter(Boolean).join(' — ') +
      (galleryPlaceholder ? ' · Yer tutucu görsel' : '');
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showItem(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  }
  lb.addEventListener('close', function () {
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  });
  if (galleryGrid) {
    galleryGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__btn');
      if (btn) openLb(parseInt(btn.getAttribute('data-index'), 10));
    });
  }
  lb.addEventListener('click', function (e) {
    var action = e.target.closest('[data-lb]');
    if (action) {
      var a = action.getAttribute('data-lb');
      if (a === 'close') closeLb();
      if (a === 'prev') showItem(lbIndex - 1);
      if (a === 'next') showItem(lbIndex + 1);
      return;
    }
    if (e.target === lb) closeLb(); // click on backdrop area
  });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') showItem(lbIndex - 1);
    if (e.key === 'ArrowRight') showItem(lbIndex + 1);
  });
  // Swipe
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showItem(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* -------------------------------------------------------------- Reveals */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // gentle stagger for siblings revealed together
        var siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = (Math.min(idx, 5) * 0.08) + 's';
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------- Parallax */
  var parallaxEls = $$('[data-parallax]');
  var parallaxEnabled = !reduceMotion.matches && !isTouch && window.innerWidth > 960;
  if (parallaxEls.length && parallaxEnabled) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.06;
        var progress = (r.top + r.height / 2 - vh / 2);
        var target = el.querySelector('img');
        if (target) target.style.transform = 'translate3d(0,' + (-progress * speed - r.height * 0.06).toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ----------------------------------------------------------- Hero video */
  var video = $('#hero-video');
  var vToggle = $('#video-toggle');
  var userPaused = false;
  if (video) {
    var tryPlay = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    if (reduceMotion.matches) { userPaused = true; video.removeAttribute('autoplay'); video.pause(); vToggle.setAttribute('aria-pressed', 'true'); }
    vToggle.addEventListener('click', function () {
      userPaused = !video.paused ? true : false;
      if (userPaused) video.pause(); else tryPlay();
      vToggle.setAttribute('aria-pressed', String(userPaused));
      vToggle.setAttribute('aria-label', userPaused ? 'Arka plan videosunu oynat' : 'Arka plan videosunu duraklat');
    });
    // Pause when out of view (saves battery/CPU)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !userPaused) tryPlay(); else if (!en.isIntersecting) video.pause();
        });
      }, { threshold: 0.05 }).observe(video);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause(); else if (!userPaused && window.scrollY < window.innerHeight) tryPlay();
    });
  }

  /* -------------------------------------------------------- Contact info */
  var contact = CONFIG.contact || {};
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  var renderers = {
    phone: function (v) { return '<a href="tel:+' + esc(digits(v)) + '">' + esc(v) + '</a>'; },
    whatsapp: function (v) { return '<a href="https://wa.me/' + esc(digits(v)) + '" target="_blank" rel="noopener">+' + esc(digits(v)) + '</a>'; },
    instagram: function (v) { var u = String(v).replace(/^@/, ''); return '<a href="https://instagram.com/' + esc(u) + '" target="_blank" rel="noopener">@' + esc(u) + '</a>'; },
    address: function (v) { return contact.mapsUrl ? '<a href="' + esc(contact.mapsUrl) + '" target="_blank" rel="noopener">' + esc(v) + '</a>' : esc(v); },
    hours: function (v) { return esc(v); }
  };
  $$('[data-contact]').forEach(function (dd) {
    var key = dd.getAttribute('data-contact');
    var val = contact[key];
    if (val) { dd.innerHTML = renderers[key] ? renderers[key](val) : esc(val); }
    else { dd.innerHTML = '<span class="is-empty">Yakında</span>'; }
  });
  var igLink = $('#footer-instagram');
  if (igLink && contact.instagram) {
    igLink.href = 'https://instagram.com/' + String(contact.instagram).replace(/^@/, '');
    igLink.hidden = false;
  }

  /* ------------------------------------------------------ Appointment form */
  var form = $('#appointment-form');
  if (!form) return;
  var formCfg = CONFIG.form || {};
  var MAX_FILES = formCfg.maxFiles || 5;
  var MAX_MB = formCfg.maxFileSizeMB || 10;
  var fileInput = $('#f-files');
  var uploadZone = $('#upload');
  var uploadList = $('#upload-list');
  var statusEl = $('#form-status');
  var submitBtn = $('#submit-btn');
  var files = [];

  var limits = $('[data-upload-limits]');
  if (limits) limits.textContent = 'En fazla ' + MAX_FILES + ' görsel · her biri en fazla ' + MAX_MB + ' MB';

  function setError(field, msg) {
    var wrap = field.closest('.field');
    var errId = field.getAttribute('aria-describedby') || '';
    var err = document.getElementById(errId.split(' ').filter(function (id) { return id.indexOf('e-') === 0; })[0]);
    if (wrap) wrap.classList.toggle('is-invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }

  var validators = {
    name: function (v) { v = v.trim(); if (!v) return 'Lütfen adınızı yazın.'; if (v.length < 2) return 'İsim en az 2 karakter olmalı.'; return ''; },
    phone: function (v) {
      var d = v.replace(/\D/g, '');
      if (!v.trim()) return 'Lütfen telefon numaranızı yazın.';
      if (!/^[+\d\s().-]+$/.test(v.trim()) || d.length < 10 || d.length > 15) return 'Geçerli bir telefon numarası girin (örn. 05xx xxx xx xx).';
      return '';
    },
    idea: function (v) { v = v.trim(); if (!v) return 'Dövme fikrinizi kısaca anlatın.'; if (v.length < 10) return 'Biraz daha detay verin (en az 10 karakter).'; return ''; },
    placement: function (v) { return v ? '' : 'Lütfen bir bölge seçin.'; },
    size: function (v) { return v ? '' : 'Lütfen tahmini boyutu seçin.'; },
    consent: function (_, el) { return el.checked ? '' : 'Devam etmek için onay vermeniz gerekiyor.'; }
  };

  function validateField(el) {
    var fn = validators[el.name];
    if (!fn) return true;
    var msg = fn(el.value, el);
    setError(el, msg);
    return !msg;
  }

  $$('input, textarea, select', form).forEach(function (el) {
    if (!validators[el.name]) return;
    el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') validateField(el); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validateField(el); });
    el.addEventListener('change', function () {
      if (el.tagName === 'SELECT') el.closest('.field').classList.toggle('has-value', !!el.value);
      if (el.tagName === 'SELECT' || el.type === 'checkbox') validateField(el);
    });
  });

  // Files ------------------------------------------------------------------
  var filesErr = $('#e-files');
  function renderFiles() {
    uploadList.innerHTML = '';
    files.forEach(function (f, i) {
      var li = document.createElement('li');
      li.className = 'upload__thumb';
      var img = document.createElement('img');
      img.alt = f.name;
      img.src = URL.createObjectURL(f);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      var rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'upload__remove'; rm.textContent = '×';
      rm.setAttribute('aria-label', f.name + ' dosyasını kaldır');
      rm.addEventListener('click', function () { files.splice(i, 1); renderFiles(); fileInput.focus(); });
      li.appendChild(img); li.appendChild(rm);
      uploadList.appendChild(li);
    });
  }
  function addFiles(list) {
    var msgs = [];
    Array.prototype.forEach.call(list, function (f) {
      if (!/^image\//.test(f.type)) { msgs.push(f.name + ': yalnızca görsel dosyaları yükleyebilirsiniz.'); return; }
      if (f.size > MAX_MB * 1024 * 1024) { msgs.push(f.name + ': dosya ' + MAX_MB + ' MB sınırını aşıyor.'); return; }
      if (files.length >= MAX_FILES) { msgs.push('En fazla ' + MAX_FILES + ' görsel ekleyebilirsiniz.'); return; }
      if (files.some(function (x) { return x.name === f.name && x.size === f.size; })) return;
      files.push(f);
    });
    filesErr.textContent = msgs.filter(function (m, i, a) { return a.indexOf(m) === i; }).join(' ');
    renderFiles();
  }
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) {
    uploadZone.addEventListener(ev, function (e) { e.preventDefault(); uploadZone.classList.add('is-drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    uploadZone.addEventListener(ev, function (e) { e.preventDefault(); uploadZone.classList.remove('is-drag'); });
  });
  uploadZone.addEventListener('drop', function (e) { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  // Submit -----------------------------------------------------------------
  function setStatus(html, type) {
    statusEl.className = 'form__status' + (type ? ' is-' + type : '');
    statusEl.innerHTML = html;
  }

  function buildMessage(data) {
    return [
      'Merhaba LASTART TATTOO, randevu talebim:',
      'İsim: ' + data.get('name'),
      'Telefon: ' + data.get('phone'),
      'Bölge: ' + data.get('placement'),
      'Boyut: ' + data.get('size'),
      'Fikir: ' + data.get('idea'),
      files.length ? '(' + files.length + ' referans görseli ayrıca göndereceğim.)' : ''
    ].filter(Boolean).join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = $$('input, textarea, select', form).filter(function (el) { return validators[el.name]; });
    var firstInvalid = null;
    fields.forEach(function (el) { if (!validateField(el) && !firstInvalid) firstInvalid = el; });
    if (firstInvalid) {
      setStatus('Lütfen işaretli alanları kontrol edin.', 'error');
      firstInvalid.focus();
      return;
    }
    if (form.website && form.website.value) return; // bot

    var data = new FormData(form);
    data.delete('references');
    data.delete('website');
    files.forEach(function (f) { data.append('references', f, f.name); });

    var endpoint = formCfg.endpoint;
    var wa = digits(contact.whatsapp);

    if (endpoint) {
      submitBtn.disabled = true;
      setStatus('Gönderiliyor…');
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset(); files = []; renderFiles();
          $$('.field.has-value', form).forEach(function (f) { f.classList.remove('has-value'); });
          $$('.field', form).forEach(function (f) { f.classList.remove('is-invalid'); });
          setStatus('Teşekkürler! Randevu talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.', 'success');
        })
        .catch(function () {
          setStatus('Talebiniz gönderilemedi. Lütfen tekrar deneyin' + (wa ? ' ya da <a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp üzerinden</a> yazın.' : '.'), 'error');
        })
        .then(function () { submitBtn.disabled = false; });
      return;
    }

    if (wa) {
      var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(buildMessage(data));
      window.open(url, '_blank', 'noopener');
      setStatus('Talebiniz WhatsApp üzerinden iletilmek üzere hazırlandı.' + (files.length ? ' Referans görsellerinizi sohbete eklemeyi unutmayın.' : ''), 'success');
      return;
    }

    // Not configured yet (see assets/js/config.js → form.endpoint / contact.whatsapp)
    console.warn('[LASTART] Form gönderim adresi tanımlı değil: assets/js/config.js → form.endpoint');
    setStatus('Online randevu formu çok yakında aktif olacak. Şimdilik lütfen stüdyoyla doğrudan iletişime geçin.', 'error');
  });
})();
