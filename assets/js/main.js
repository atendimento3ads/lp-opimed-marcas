/* OPIMED — LPs por marca · interações do layout base */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header com sombra após rolar */
  var header = document.querySelector('[data-header]');
  function onScrollHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* Entrada suave dos blocos */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero: parallax do fundo na rolagem e do aparelho no movimento do mouse */
  var hero = document.querySelector('[data-hero]');
  var photo = document.querySelector('[data-hero-photo]');
  var device = document.querySelector('[data-device] .hero__float');
  if (hero && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, hero.offsetHeight);
        if (photo) photo.style.translate = '0 ' + (y * 0.18).toFixed(1) + 'px';
        if (device) device.style.setProperty('--py', (y * -0.12).toFixed(1) + 'px');
        ticking = false;
      });
    }, { passive: true });

    if (device && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        device.style.setProperty('--px', (dx * 22).toFixed(1) + 'px');
        device.style.setProperty('--py', (dy * 16 - Math.min(window.scrollY, hero.offsetHeight) * 0.12).toFixed(1) + 'px');
      });
      hero.addEventListener('pointerleave', function () {
        device.style.setProperty('--px', '0px');
      });
    }
  }

  /* Vídeos do YouTube: carrega o player só no clique (data-yt-id) */
  document.querySelectorAll('.video').forEach(function (box) {
    var id = (box.getAttribute('data-yt-id') || '').trim();
    var btn = box.querySelector('.video__play');
    if (!id) {
      if (btn) btn.setAttribute('aria-disabled', 'true');
      return;
    }
    box.classList.add('has-thumb');
    box.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg)';
    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = box.getAttribute('data-yt-title') || 'Vídeo';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(iframe);
    });
  });

  /* FAQ: mantém uma pergunta aberta por vez */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqItems.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Formulário: máscara de telefone e validação (envio entra na implementação) */
  var form = document.getElementById('leadForm');
  if (!form) return;

  var phone = form.querySelector('[data-phone]');
  if (phone) {
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      phone.value = out;
    });
  }

  function isValid(input) {
    var v = input.value.trim();
    if (input.name === 'telefone') return v.replace(/\D/g, '').length >= 10;
    if (input.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    return v.length > 1;
  }

  form.querySelectorAll('input').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value) input.closest('.field').classList.toggle('is-invalid', !isValid(input));
    });
    input.addEventListener('input', function () {
      var field = input.closest('.field');
      if (field.classList.contains('is-invalid') && isValid(input)) field.classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    form.querySelectorAll('input[required]').forEach(function (input) {
      var ok = isValid(input);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    // Protótipo: aqui entra o envio ao webhook + redirecionamento para a página de obrigado.
    var submit = form.querySelector('[type="submit"]');
    submit.classList.add('is-sent');
    submit.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
    submit.setAttribute('aria-label', 'Enviado');
  });
})();
