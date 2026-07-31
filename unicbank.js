(function(){
  var items = document.querySelectorAll('.an-reveal');
  if(!('IntersectionObserver' in window)){ items.forEach(function(el){ el.classList.add('an-in'); }); }
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          var el = entry.target;
          setTimeout(function(){ el.classList.add('an-in'); }, i * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  var haccBtns = document.querySelectorAll('.an-hacc__tab');
  haccBtns.forEach(function(b){
    b.addEventListener('click', function(){
      var item = b.parentNode;
      var open = item.classList.contains('is-open');
      var scope = item.parentNode;
      scope.querySelectorAll('.an-hacc__item').forEach(function(x){
        x.classList.remove('is-open');
        x.querySelector('.an-hacc__tab').setAttribute('aria-expanded','false');
      });
      if(!open){ item.classList.add('is-open'); b.setAttribute('aria-expanded','true'); }
    });
  });

  var btn = document.querySelector('.an-totop');
  if(btn){
    function toggle(){ btn.classList.toggle('an-show', window.scrollY > 400); }
    window.addEventListener('scroll', toggle, {passive:true});
    toggle();
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
    });
  }
  (function(){
    var stage = document.querySelector('.an-icg__big');
    if(!stage) return;
    var use = stage.querySelector('use');
    var deflt = use.getAttribute('href');
    document.querySelectorAll('.an-icg__cell').forEach(function(cell){
      var id = '#'+cell.getAttribute('data-ic');
      function set(){ use.setAttribute('href', id); }
      function reset(){ use.setAttribute('href', deflt); }
      cell.addEventListener('mouseenter', set);
      cell.addEventListener('focus', set);
      cell.addEventListener('mouseleave', reset);
      cell.addEventListener('blur', reset);
    });
  })();

  /* ═══ КИНОЛЕНТЫ ═══ */
  document.querySelectorAll('.an-film__view').forEach(function(view){
    var track = view.querySelector('.an-film__track');
    if(!track) return;
    var prev   = view.querySelector('.an-film__btn--prev');
    var next   = view.querySelector('.an-film__btn--next');
    var prog   = view.querySelector('.an-film__prog i');
    var slides = track.querySelectorAll('.an-film__slide');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function step(){
      var s = slides[0];
      if(!s) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return s.getBoundingClientRect().width + gap;
    }
    function update(){
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      if(prev) prev.disabled = x <= 2;
      if(next) next.disabled = x >= max - 2;
      if(prog){
        var p = max > 2 ? (x / max) : 1;
        prog.style.setProperty('--an-p', (6 + p * 94) + '%');
      }
    }
    function go(dir){ track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' }); }
    if(prev) prev.addEventListener('click', function(){ go(-1); });
    if(next) next.addEventListener('click', function(){ go(1); });
    track.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
    update();
  });

  /* ═══ КАРТА · СВАЙП/ДРАГ ═══ */
  document.querySelectorAll('[data-cards]').forEach(function(root){
    var view  = root.querySelector('.an-cards__view');
    var track = root.querySelector('.an-cards__track');
    var dots  = root.querySelectorAll('.an-cards__dots span');
    var n     = track.querySelectorAll('.an-cards__slide').length;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i = 0, startX = 0, dx = 0, w = 0, dragging = false;
    var EASE = 'transform .32s cubic-bezier(.22,.61,.36,1)';

    function gap(){ return parseFloat(getComputedStyle(track).gap) || 0; }
    function offset(){ return i * (view.clientWidth + gap()); }
    function place(anim){
      track.style.transition = (anim && !reduce) ? EASE : 'none';
      track.style.transform  = 'translateX(' + (-offset()) + 'px)';
      dots.forEach(function(d,k){ d.classList.toggle('is-on', k === i); });
    }
    function down(e){
      dragging = true; w = view.clientWidth; startX = e.clientX; dx = 0;
      track.style.transition = 'none'; view.classList.add('is-drag');
      if(view.setPointerCapture) view.setPointerCapture(e.pointerId);
    }
    function move(e){
      if(!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = 'translateX(' + (-(offset()) + dx) + 'px)';
    }
    function up(){
      if(!dragging) return;
      dragging = false; view.classList.remove('is-drag');
      var t = w * 0.18;
      if(dx <= -t && i < n - 1) i++;
      else if(dx >= t && i > 0) i--;
      place(true);
    }
    view.addEventListener('pointerdown', down);
    view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
    view.addEventListener('pointerleave', up);
    window.addEventListener('resize', function(){ place(false); });
    place(false);
  });

  /* ═══ ПОЛНОЭКРАННЫЙ ПРОСМОТР ═══ */
  (function(){
    var box = document.querySelector('.an-lbox');
    if(!box) return;
    var bt = box.querySelector('.an-lbox__track');
    var close = box.querySelector('.an-lbox__close');

    function open(imgs, idx){
      bt.innerHTML = '';
      imgs.forEach(function(src, i){
        var im = document.createElement('img');
        im.src = src; im.alt = ''; im.dataset.i = i;
        bt.appendChild(im);
      });
      box.classList.add('is-open');
      document.body.classList.add('an-lock');
      requestAnimationFrame(function(){
        var t = bt.children[idx];
        if(t) bt.scrollLeft = t.offsetLeft - (bt.clientWidth - t.clientWidth) / 2;
      });
      close.focus();
    }
    function shut(){
      box.classList.remove('is-open');
      document.body.classList.remove('an-lock');
      bt.innerHTML = '';
    }

    document.querySelectorAll('.an-film__track').forEach(function(tr){
      var imgs = Array.prototype.map.call(tr.querySelectorAll('img'), function(i){ return i.src; });
      tr.querySelectorAll('img').forEach(function(img, i){
        img.addEventListener('click', function(){ open(imgs, i); });
      });
    });

    close.addEventListener('click', shut);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && box.classList.contains('is-open')) shut();
    });
  })();
})();
