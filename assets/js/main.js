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
