/* ===========================================================================
   SILSTONE.AI SHARED RUNTIME
   Idempotent and re-scannable, so it works regardless of the order Hostinger
   renders the embed blocks in.
   =========================================================================== */
(function () {
  // Mark that the runtime is live. CSS gates every "start hidden" state behind
  // this class, so if the script never runs the content stays visible.
  document.documentElement.classList.add('sil-js');

  if (window.__silstoneInit) return;
  window.__silstoneInit = true;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = new WeakSet();

  function initReveal() {
    var els = document.querySelectorAll('.sil-reveal, .sil-section');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    els.forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  function initSpotlight() {
    document.querySelectorAll('.sil-card.is-spot').forEach(function (card) {
      if (card.__spot) return;
      card.__spot = true;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
    document.querySelectorAll('.sil-btn-gradient').forEach(function (b) {
      if (b.__spot) return;
      b.__spot = true;
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--by', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  function initSectionGlow() {
    document.querySelectorAll('.sil-section').forEach(function (sec) {
      if (sec.__glow || !sec.querySelector('.sil-cursorglow')) return;
      sec.__glow = true;
      sec.addEventListener('pointermove', function (e) {
        var r = sec.getBoundingClientRect();
        sec.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
        sec.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
      }, { passive: true });
    });
  }

  /* <span class="sil-count" data-to="312" data-prefix="$" data-suffix="K"> */
  function initCounters() {
    var els = document.querySelectorAll('.sil-count');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) {
      if (el.__count) return;
      el.__count = true;
      el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
      io.observe(el);
    });

    function run(el) {
      var to  = parseFloat(el.dataset.to || '0');
      var dec = parseInt(el.dataset.dec || '0', 10);
      var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      var sep = el.dataset.sep === '1';
      function fmt(v) {
        var s = v.toFixed(dec);
        return sep ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s;
      }
      if (reduced) { el.textContent = pre + fmt(to) + suf; return; }
      var dur = 1200, t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        el.textContent = pre + fmt(to * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  }

  function initFaq() {
    document.querySelectorAll('.sil-faq').forEach(function (faq) {
      if (faq.__faq) return;
      faq.__faq = true;
      var single = faq.dataset.single !== '0';

      faq.querySelectorAll('.sil-faq-item').forEach(function (item) {
        var q = item.querySelector('.sil-faq-q');
        var a = item.querySelector('.sil-faq-a');
        if (!q || !a) return;
        q.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
        if (item.classList.contains('is-open')) a.style.height = a.firstElementChild.offsetHeight + 'px';

        q.addEventListener('click', function () {
          var open = item.classList.contains('is-open');
          if (single && !open) {
            faq.querySelectorAll('.sil-faq-item.is-open').forEach(function (o) {
              o.classList.remove('is-open');
              o.querySelector('.sil-faq-a').style.height = '0px';
              o.querySelector('.sil-faq-q').setAttribute('aria-expanded', 'false');
            });
          }
          item.classList.toggle('is-open', !open);
          q.setAttribute('aria-expanded', String(!open));
          a.style.height = open ? '0px' : a.firstElementChild.offsetHeight + 'px';
        });
      });
    });

    if (!window.__silFaqResize) {
      window.__silFaqResize = true;
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          document.querySelectorAll('.sil-faq-item.is-open .sil-faq-a').forEach(function (a) {
            a.style.height = a.firstElementChild.offsetHeight + 'px';
          });
        }, 120);
      }, { passive: true });
    }
  }

  function initCharts() {
    document.querySelectorAll('.sil-chart .line').forEach(function (p) {
      if (p.__len) return;
      p.__len = true;
      try { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); } catch (err) {}
    });
  }

  /* Hostinger sizes each "Embed code" block by watching this document's body
     with a ResizeObserver and matching the iframe to its content height. If it
     measures before the webfont swaps in, the stored height can be left stale
     -- content ends up shorter than the reserved box and a blank band shows
     below the block. Poking the body's size makes the observer re-fire and the
     host re-measures, so any stale height self-corrects. Harmless outside an
     embed (the preview pages have no such observer). */
  function nudgeHostResize() {
    var b = document.body;
    if (!b) return;
    try {
      var prev = b.style.minHeight;
      b.style.minHeight = (b.offsetHeight + 1) + 'px';
      void b.offsetHeight;            // force reflow so the +1 is observed
      requestAnimationFrame(function () { b.style.minHeight = prev; });
    } catch (e) {}
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }

  function initHostResizeSync() {
    if (window.__silResizeSync) return;
    window.__silResizeSync = true;
    // Re-measure once the real fonts are in (the common stale-height cause)...
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(nudgeHostResize).catch(function () {});
    }
    // ...plus a few settling passes for late images / slow font delivery.
    [300, 900, 2000].forEach(function (t) { setTimeout(nudgeHostResize, t); });
  }

  function boot() { initReveal(); initSpotlight(); initSectionGlow(); initCounters(); initFaq(); initCharts(); }
  window.silstoneRefresh = boot;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  initHostResizeSync();

  var mo = new MutationObserver(function () {
    clearTimeout(window.__silMo);
    window.__silMo = setTimeout(boot, 140);
  });
  mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  [400, 1200, 2600].forEach(function (t) { setTimeout(boot, t); });
})();

/* ===== BLOG: reading progress bar, tag filter, copy-link (guarded) ===== */
(function () {
  // reading progress bar
  var bar = document.getElementById('silProgress');
  var article = document.querySelector('.sil-article-page');
  if (bar && article) {
    var update = function () {
      var total = article.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-article.getBoundingClientRect().top, 0), Math.max(total, 1));
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // tag filtering on the listing
  var filter = document.querySelector('.sil-tagfilter');
  if (filter) {
    var cards = [].slice.call(document.querySelectorAll('.sil-blog-card, .sil-blog-featured'));
    var apply = function (tag) {
      cards.forEach(function (c) {
        var tags = (c.getAttribute('data-tags') || '').split(',');
        c.style.display = (!tag || tags.indexOf(tag) !== -1) ? '' : 'none';
      });
      [].forEach.call(filter.querySelectorAll('.sil-tagfilter-btn'), function (b) {
        b.classList.toggle('is-active', (b.getAttribute('data-tag') || '') === tag);
      });
    };
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('.sil-tagfilter-btn');
      if (btn) apply(btn.getAttribute('data-tag') || '');
    });
    var m = location.search.match(/[?&]tag=([^&]+)/);
    if (m) apply(decodeURIComponent(m[1]));
  }

  // copy-link buttons
  [].forEach.call(document.querySelectorAll('.sil-copy-link'), function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-url') || location.href;
      var done = function () {
        var t = btn.textContent; btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = t; }, 1600);
      };
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(done).catch(function () {}); }
    });
  });
})();

/* ===== BLOG: TOC scroll-spy (highlight current section) ===== */
(function () {
  var toc = document.querySelector('.sil-toc');
  if (!toc) return;
  var links = {};
  [].forEach.call(toc.querySelectorAll('a'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  var headings = [].slice.call(document.querySelectorAll('.sil-article h2[id]'));
  if (!headings.length) return;
  var spy = function () {
    var pos = window.scrollY + 120, current = headings[0];
    headings.forEach(function (h) {
      if (h.getBoundingClientRect().top + window.scrollY <= pos) current = h;
    });
    Object.keys(links).forEach(function (id) {
      links[id].classList.toggle('is-active', id === current.id);
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();
})();
