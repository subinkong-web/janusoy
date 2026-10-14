(function () {
  var root = document.documentElement;

  // 언어 전환 (KR / EN) — ?lang=en 으로도 열 수 있다
  var buttons = document.querySelectorAll('.lang button');
  function setLang(lang) {
    root.lang = lang;
    buttons.forEach(function (b) { b.classList.toggle('is-on', b.dataset.lang === lang); });
    try { localStorage.setItem('janusoy-lang', lang); } catch (e) {}
  }
  var initial = (new URLSearchParams(location.search)).get('lang');
  if (!initial) { try { initial = localStorage.getItem('janusoy-lang'); } catch (e) {} }
  setLang(initial === 'en' || initial === 'ko' ? initial : (root.lang === 'en' ? 'en' : 'ko'));
  buttons.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  // 헤더
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 모바일 메뉴
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // 스크롤 등장
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // 히어로: 마우스를 따라 캐릭터가 살짝 움직인다
  var art = document.querySelector('.hero-art');
  if (art && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 18;
      var y = (e.clientY / window.innerHeight - 0.5) * 12;
      art.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }, { passive: true });
  }
})();

// 영상 — 카드에 마우스를 올리면 무음 미리보기, 누르면 플레이어. 오피셜 필름은 언어에 맞는 자막판을 튼다.
(function () {
  var root = document.documentElement;
  var FILMS = {
    official: {
      src: { ko: 'assets/video/janusoy-official-film-ko.mp4', en: 'assets/video/janusoy-official-film-en.mp4' },
      poster: 'assets/img/film-official.jpg',
      title: { ko: 'JANUSOY 야누소이 — 오피셜 필름', en: 'JANUSOY — Official Film' }
    },
    mv: {
      src: { ko: 'assets/video/janusoy-8cm-mv.mp4', en: 'assets/video/janusoy-8cm-mv.mp4' },
      poster: 'assets/img/film-mv.jpg',
      title: { ko: '8cm — 오피셜 뮤직비디오', en: '8cm — Official Music Video' }
    }
  };
  var player = document.getElementById('player');
  var video = document.getElementById('player-video');
  var titleEl = player && player.querySelector('.player-title');
  if (!player || !video) return;
  var current = null, lastFocus = null;

  function lang() { return root.lang === 'en' ? 'en' : 'ko'; }

  function load(key, keepTime) {
    var f = FILMS[key], src = f.src[lang()];
    if (video.getAttribute('src') === src) return;
    var t = keepTime ? video.currentTime : 0, wasPlaying = keepTime && !video.paused;
    video.poster = f.poster;
    video.src = src;
    titleEl.textContent = f.title[lang()];
    if (keepTime) {
      video.addEventListener('loadedmetadata', function once() {
        video.removeEventListener('loadedmetadata', once);
        video.currentTime = t;
        if (wasPlaying) video.play().catch(function () {});
      });
    }
  }

  function open(key) {
    current = key;
    lastFocus = document.activeElement;
    video.removeAttribute('src');
    load(key, false);
    player.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(function () { player.classList.add('open'); });
    player.querySelector('.player-close').focus();
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function close() {
    if (player.hidden) return;
    video.pause();
    player.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { player.hidden = true; video.removeAttribute('src'); video.load(); }, 300);
    current = null;
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.film-shot').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.dataset.film); });
    var teaser = btn.querySelector('.teaser');
    if (!teaser || !window.matchMedia('(pointer:fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    btn.addEventListener('mouseenter', function () {
      teaser.currentTime = 0;
      var p = teaser.play();
      if (p && p.then) p.then(function () { btn.classList.add('is-teasing'); }).catch(function () {});
    });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('is-teasing'); teaser.pause(); });
  });

  player.querySelector('.player-close').addEventListener('click', close);
  player.addEventListener('click', function (e) { if (e.target === player) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // 플레이어가 열린 채로 KR/EN 을 바꾸면 같은 지점에서 자막판만 바꾼다
  new MutationObserver(function () {
    if (current) { load(current, true); titleEl.textContent = FILMS[current].title[lang()]; }
  }).observe(root, { attributes: true, attributeFilter: ['lang'] });
})();
