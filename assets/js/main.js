/* =====================================================================
   ROI LOAN EXPERTS — main.js
   Vanilla JS, no dependencies. Progressive enhancement only.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     0. Site configuration
     Fill these in once real details are available.
  --------------------------------------------------------------- */
  window.ROI = window.ROI || {};
  window.ROI.config = Object.assign({
    /* POST endpoint for all enquiry forms (Formspree, Web3Forms, your API...).
       Leave empty to run the forms in local "demo" mode. */
    formEndpoint: '',
    /* WhatsApp number in international format, digits only, no "+".
       Leave empty to hide / disable the floating WhatsApp button. */
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    hours: ''
  }, window.ROI.config || {});

  var cfg = window.ROI.config;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Sticky header state
  --------------------------------------------------------------- */
  function initHeader() {
    var header = $('.header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     1.5 Active navigation
  --------------------------------------------------------------- */
  function initNav() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
      var list = a.getAttribute('data-nav').toLowerCase().split(',');
      if (list.indexOf(path) > -1) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------------------------------------------------------------
     2. Mobile drawer
  --------------------------------------------------------------- */
  function initDrawer() {
    var drawer = $('#drawer');
    if (!drawer) return;
    var openBtn = $$('[data-drawer-open]');
    var closeBtn = $('[data-drawer-close]', drawer);
    var scrim = $('.drawer__scrim', drawer);
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      openBtn.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      openBtn.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    openBtn.forEach(function (b) { b.addEventListener('click', open); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', close); });
    /* focus trap */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
      var f = $$('a[href], button:not([disabled]), input, select, textarea', drawer)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------------------
     3. Mega menu (keyboard + touch friendly)
  --------------------------------------------------------------- */
  function initMega() {
    var mega = $('.has-mega');
    if (!mega) return;
    var trigger = $('.nav__link', mega);
    if (!trigger) return;
    function setOpen(state) { mega.classList.toggle('is-open', state); }
    mega.addEventListener('focusout', function (e) {
      if (!mega.contains(e.relatedTarget)) setOpen(false);
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); setOpen(true);
        var first = $('.mega a', mega); if (first) first.focus();
      }
    });
    mega.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); trigger.focus(); }
    });
  }

  /* ---------------------------------------------------------------
     4. Reveal on scroll (+ stagger)
  --------------------------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal, .reveal-scal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement ? $$('[data-stagger] > *', el.parentElement) : [];
        if (group.indexOf(el) > -1) {
          el.style.setProperty('--d', Math.min(group.indexOf(el), 7) * 70 + 'ms');
        }
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     5. Counters — only run on elements that carry a real value
  --------------------------------------------------------------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      if (reduceMotion) { el.textContent = target + suffix; return; }
      el.textContent = '0' + suffix;   /* the static markup already shows the real figure */
      var dur = 1200, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     6. Accordion (FAQ)
  --------------------------------------------------------------- */
  function initAccordion() {
    $$('[data-acc]').forEach(function (root) {
      var single = root.getAttribute('data-acc') === 'single';
      var btns = $$('.acc__btn', root);
      btns.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        btn.addEventListener('click', function () {
          var isOpen = btn.getAttribute('aria-expanded') === 'true';
          if (single && !isOpen) {
            btns.forEach(function (b) {
              var p = document.getElementById(b.getAttribute('aria-controls'));
              b.setAttribute('aria-expanded', 'false');
              if (p) p.classList.remove('is-open');
            });
          }
          btn.setAttribute('aria-expanded', String(!isOpen));
          panel.classList.toggle('is-open', !isOpen);
        });
      });
    });
  }

  /* ---------------------------------------------------------------
     7. Testimonial carousel
  --------------------------------------------------------------- */
  function initCarousel() {
    $$('[data-carousel]').forEach(function (root) {
      var track = $('.tst__track', root);
      var slides = $$('.tst__slide', root);
      if (!track || slides.length < 2) return;
      var dotsWrap = $('.tst__dots', root);
      var index = 0, timer = null, auto = root.getAttribute('data-auto') !== 'false';

      slides.forEach(function (_, i) {
        if (!dotsWrap) return;
        var d = document.createElement('button');
        d.className = 'tst__dot' + (i === 0 ? ' is-active' : '');
        d.type = 'button';
        d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        d.addEventListener('click', function () { go(i); restart(); });
        dotsWrap.appendChild(d);
      });
      var dots = dotsWrap ? $$('.tst__dot', dotsWrap) : [];

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
        slides.forEach(function (s, n) {
          s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
          s.querySelectorAll('a, button').forEach(function (f) {
            if (n === index) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', '-1');
          });
        });
      }
      function restart() { if (timer) clearInterval(timer); if (auto) timer = setInterval(function () { go(index + 1); }, 6000); }
      var prev = $('[data-carousel-prev]', root);
      var next = $('[data-carousel-next]', root);
      if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
      if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
      root.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
      root.addEventListener('mouseleave', restart);
      root.addEventListener('focusin', function () { if (timer) clearInterval(timer); });

      /* touch swipe */
      var x0 = null;
      track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        x0 = null; restart();
      });

      go(0); restart();
    });
  }

  /* ---------------------------------------------------------------
     8. Multi-step loan matcher
  --------------------------------------------------------------- */
  function initMatcher() {
    var form = $('form.matcher') || $('#matcher');  /* bind to the form element itself */
    if (!form) return;
    var panels = $$('.matcher__panel', form);
    var fill = $('.matcher__fill', form);
    var count = $('.matcher__count', form);
    var stepLabels = $$('.matcher__steps li', form);
    var prevBtn = $('[data-prev]', form);
    var nextBtn = $('[data-next]', form);
    var submitBtn = $('[data-submit]', form);
    var err = $('.matcher__err', form);
    var success = $('#matcher-success');
    var index = 0;

    function paint(focusPanel) {
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === index); });
      if (fill) fill.style.width = (((index + 1) / panels.length) * 100) + '%';
      if (count) count.textContent = 'Step ' + (index + 1) + ' of ' + panels.length;
      stepLabels.forEach(function (li, i) {
        li.classList.toggle('is-active', i === index);
        li.classList.toggle('is-done', i < index);
      });
      if (prevBtn) prevBtn.classList.toggle('is-disabled', index === 0);
      if (nextBtn) nextBtn.classList.toggle('hide', index === panels.length - 1);
      if (submitBtn) submitBtn.classList.toggle('hide', index !== panels.length - 1);
      if (err) err.textContent = '';
      if (focusPanel) {
        panels[index].setAttribute('tabindex', '-1');
        try { panels[index].focus({ preventScroll: true }); } catch (err) { panels[index].focus(); }
      }
      panels[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }

    function validate(step) {
      var panel = panels[step];
      var need = $$('[data-required]', panel);
      for (var i = 0; i < need.length; i++) {
        var el = need[i];
        var ok = el.type === 'radio' || el.type === 'checkbox'
          ? !!panel.querySelector('input[name="' + el.name + '"]:checked')
          : el.value.trim() !== '' && (el.type !== 'tel' || el.value.replace(/\D/g, '').length >= 10);
        if (!ok) {
          if (err) err.textContent = el.getAttribute('data-msg') || 'Please complete this field to continue.';
          var wrap = el.closest('.field') || el.closest('.opt');
          if (wrap) {
            wrap.classList.add('has-err');
            setTimeout(function () { wrap.classList.remove('has-err'); }, 1600);
          }
          (el.type === 'radio' ? el.closest('label') || el : el).focus();
          return false;
        }
      }
      return true;
    }

    /* option tiles */
    $$('.opt', form).forEach(function (opt) {
      var input = $('input', opt);
      if (!input) return;
      input.addEventListener('change', function () {
        var name = input.name;
        $$('input[name="' + name + '"]', form).forEach(function (r) {
          if (r.closest('.opt')) r.closest('.opt').classList.toggle('is-sel', r.checked);
        });
        if (err) err.textContent = '';
      });
    });
    $$('.chip', form).forEach(function (chip) {
      var input = $('input', chip);
      if (!input) return;
      input.addEventListener('change', function () { chip.classList.toggle('is-sel', input.checked); });
    });
    $$('input, select, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { el.closest('.field') && el.closest('.field').classList.remove('has-err'); });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { if (index > 0) { index--; paint(true); } });
    if (nextBtn) nextBtn.addEventListener('click', function () { if (validate(index)) { index++; paint(true); } });

    /* Enter advances the wizard instead of submitting a half-completed form */
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var tag = (e.target.tagName || '').toUpperCase();
      if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
      e.preventDefault();
      if (index < panels.length - 1) { if (validate(index)) { index++; paint(true); } }
      else { if (form.requestSubmit) form.requestSubmit(); else { e.target.form.dispatchEvent(new Event('submit', { cancelable: true })); } }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(index)) return;
      var hp = $('[name="company_website"]', form);
      if (hp && hp.value) return; /* honeypot */
      var btn = $('[data-submit]', form);
      var btnLabel = btn ? btn.innerHTML : '';
      if (btn) { btn.classList.add('is-disabled'); btn.innerHTML = 'Sending<span class="dots"></span>'; }
      var payload = collect(form);
      deliver(form, payload).then(function () {
        form.classList.add('hide');
        if (success) {
          success.hidden = false;
          success.setAttribute('tabindex', '-1');
          success.focus();
          success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
        if (window.ROI.onSubmit) window.ROI.onSubmit(payload, 'matcher');
      }).catch(function () {
        if (btn) { btn.classList.remove('is-disabled'); btn.innerHTML = btnLabel; }
        if (err) err.textContent = 'Something went wrong. Please contact us directly.';
      });
    });

    paint();
  }

  /* ---------------------------------------------------------------
     9. Generic forms
  --------------------------------------------------------------- */
  function collect(form) {
    var data = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.name === 'company_website') return;
      if (el.type === 'checkbox') {
        if (el.checked) data[el.name] = data[el.name] ? data[el.name] + ', ' + el.value : el.value;
      } else if (el.type === 'radio') {
        if (el.checked) data[el.name] = el.value;
      } else if (el.multiple) {
        data[el.name] = $$('option:checked', el).map(function (o) { return o.value; });
      } else {
        data[el.name] = el.value;
      }
    });
    data._page = location.pathname.split('/').pop() || 'index.html';
    data._ts = new Date().toISOString();
    return data;
  }

  function deliver(form, payload) {
    if (cfg.formEndpoint) {
      return fetch(cfg.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { if (!r.ok) throw new Error('bad response'); });
    }
    /* Demo mode: simulate a network round-trip so the UI works end-to-end. */
    return new Promise(function (res) { setTimeout(res, 900); });
  }

  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      var ok = $('[data-form-ok]', form.parentNode || document) ||
        document.getElementById((form.getAttribute('data-form') || '') + '-ok');
      form.setAttribute('novalidate', 'novalidate');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var hp = $('[name="company_website"]', form);
        if (hp && hp.value) return;
        var bad = false;
        $$('[data-required]', form).forEach(function (el) {
          var f = el.closest('.field');
          var good = el.type === 'checkbox' || el.type === 'radio'
            ? !!form.querySelector('input[name="' + el.name + '"]:checked')
            : el.value.trim() !== '' &&
              (el.type !== 'tel' || el.value.replace(/\D/g, '').length >= 10) &&
              (el.type !== 'email' || /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(el.value.trim()));
          if (f) f.classList.toggle('has-err', !good);
          if (!good && !bad) {
            bad = true;
            var msg = $('.field__err', f);
            if (msg) msg.textContent = el.getAttribute('data-msg') || 'This field is required.';
            el.focus();
          }
        });
        if (bad) return;
        var btn = $('button[type="submit"]', form);
        var label = btn ? btn.innerHTML : '';
        if (btn) { btn.classList.add('is-disabled'); btn.innerHTML = 'Sending<span class="dots"></span>'; }
        deliver(form, collect(form)).then(function () {
          form.reset();
          if (btn) { btn.classList.remove('is-disabled'); btn.innerHTML = label; }
          if (ok) {
            ok.hidden = false;
            ok.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
          if (window.ROI.onSubmit) window.ROI.onSubmit(collect(form), form.getAttribute('data-form'));
        }).catch(function () {
          if (btn) { btn.classList.remove('is-disabled'); btn.innerHTML = label; }
          window.alert('We could not submit the form right now. Please try again or contact us directly.');
        });
      });
      $$('input, select, textarea', form).forEach(function (el) {
        el.addEventListener('input', function () {
          var f = el.closest('.field');
          if (f) f.classList.remove('has-err');
        });
      });
    });
  }

  /* ---------------------------------------------------------------
     10. Table of contents scrollspy
  --------------------------------------------------------------- */
  function initSpy() {
    var toc = $('[data-toc]');
    if (!toc) return;
    var links = $$('a[href^="#"]', toc);
    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { map[id] = a; targets.push(el); }
    });
    if (!targets.length) return;
    var offset = 100;
    function update() {
      var y = window.scrollY + offset;
      var current = targets[0];
      targets.forEach(function (t) { if (t.offsetTop <= y) current = t; });
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (map[current.id]) map[current.id].classList.add('is-active');
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(function () { update(); ticking = false; }); }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     11. Prefill loan type across pages
  --------------------------------------------------------------- */
  function initPrefill() {
    var params = new URLSearchParams(location.search);
    var type = params.get('type');
    if (!type) return;
    var wanted = type.toLowerCase();
    $$('select[name="loanType"], select[name="loan_type"]').forEach(function (sel) {
      $$('option', sel).forEach(function (o) {
        if (o.value.toLowerCase() === wanted) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    });
    /* the eligibility wizard uses radio tiles */
    var radio = $$('input[type="radio"]').filter(function (r) {
      return (r.value || '').toLowerCase() === wanted;
    })[0];
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
  }

  /* ---------------------------------------------------------------
     12. Floating buttons + config wiring
  --------------------------------------------------------------- */
  function initFloat() {
    var top = $('.fab--top');
    if (top) {
      var tick = false;
      window.addEventListener('scroll', function () {
        if (tick) return; tick = true;
        window.requestAnimationFrame(function () {
          top.classList.toggle('is-on', window.scrollY > 700);
          tick = false;
        });
      }, { passive: true });
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    if (cfg.whatsapp) {
      var url = 'https://wa.me/' + cfg.whatsapp.replace(/\D/g, '') +
        '?text=' + encodeURIComponent('Hello ROI Loan Experts, I would like to discuss a loan requirement.');
      $$('[data-wa-link]').forEach(function (a) { a.href = url; });
    }
  }

  /* ---------------------------------------------------------------
     13. Misc
  --------------------------------------------------------------- */
  function initMisc() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* animated number suffixes already handled; anchor smooth scroll for browsers w/o support */
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });

    /* lazy-reveal for elements inside scroll containers is already handled by IO */
  }

  /* ---------------------------------------------------------------
     Boot
  --------------------------------------------------------------- */
  function boot() {
    initHeader(); initNav(); initDrawer(); initMega(); initReveal(); initCounters();
    initAccordion(); initCarousel(); initMatcher(); initForms();
    initSpy(); initPrefill(); initFloat(); initMisc();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
