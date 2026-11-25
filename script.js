/* ============================================================
   Normatização 360º — interações
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP = "553533414878"; // (35) 3341-4878

  /* ---- 1. WhatsApp: cada botão abre com a mensagem do Anexo ---- */
  function buildWa(text) {
    return "https://wa.me/" + WHATSAPP + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", buildWa(el.getAttribute("data-wa")));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* ---- 2. Header: estado ao rolar + some/aparece por direção ---- */
  var header = document.getElementById("siteHeader");
  var lastScrollY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (y > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    var mm = document.getElementById("mobileMenu");
    var menuOpen = mm && !mm.hidden;
    if (!menuOpen && y > 160 && y > lastScrollY + 4) header.classList.add("header-hidden");
    else if (menuOpen || y <= 160 || y < lastScrollY - 4) header.classList.remove("header-hidden");
    lastScrollY = y;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- 3. Menu mobile ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); }
      else {
        menu.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
      }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- 4. Reveal on scroll ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- 5. FAQ: abre um por vez ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---- 6. Ano no rodapé ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- 7. Carrosséis de depoimentos (um ou mais) ---- */
  document.querySelectorAll(".carousel").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var viewport = root.querySelector(".carousel-viewport");
    var prevBtn = root.querySelector(".car-prev");
    var nextBtn = root.querySelector(".car-next");
    var dotsWrap = root.querySelector(".carousel-dots");
    if (!track || !viewport) return;

    var cards = Array.prototype.slice.call(track.children);
    var total = cards.length;
    var index = 0;
    var autoTimer = null;

    function perView() {
      var w = window.innerWidth;
      if (w <= 620) return 1;
      if (w <= 860) return 2;
      return 3;
    }
    function maxIndex() { return Math.max(0, total - perView()); }

    function cardStep() {
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24) || 24;
      return card.getBoundingClientRect().width + gap;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      var count = maxIndex() + 1;
      for (var i = 0; i < count; i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
        (function (i) { b.addEventListener("click", function () { go(i, true); }); })(i);
        dotsWrap.appendChild(b);
      }
    }

    function render() {
      var offset = -index * cardStep();
      track.style.transform = "translateX(" + offset + "px)";
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle("active", i === index);
        });
      }
    }

    function go(i, user) {
      var mx = maxIndex();
      index = i < 0 ? mx : (i > mx ? 0 : i);
      render();
      if (user) restartAuto();
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { go(index + 1); }, 6000);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function restartAuto() { startAuto(); }

    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1, true); });
    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1, true); });

    // pausa ao interagir
    [viewport].forEach(function (el) {
      el.addEventListener("mouseenter", stopAuto);
      el.addEventListener("mouseleave", startAuto);
      el.addEventListener("touchstart", stopAuto, { passive: true });
      el.addEventListener("focusin", stopAuto);
      el.addEventListener("focusout", startAuto);
    });

    // swipe no mobile
    var startX = 0, dragging = false;
    viewport.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
      else startAuto();
    });

    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        if (index > maxIndex()) index = maxIndex();
        buildDots();
        render();
      }, 150);
    });

    buildDots();
    render();
    startAuto();
  });

  /* ---- 8. Como funciona: timeline com progresso no scroll ---- */
  var cfTimeline = document.getElementById("cfTimeline");
  if (cfTimeline) {
    var cfItems = Array.prototype.slice.call(cfTimeline.querySelectorAll(".cf-item"));
    var cfTotal = cfItems.length;
    var cfLine = document.getElementById("cfLine");
    var cfLineFill = document.getElementById("cfLineFill");
    // barra de progresso (cronograma) no topo da timeline
    var progFill = document.getElementById("progFill");
    var progNow = document.getElementById("progNow");
    var progFase = document.getElementById("progFase");
    var progWhen = document.getElementById("progWhen");
    var progSegs = Array.prototype.slice.call(document.querySelectorAll(".prog__seg"));
    var PROG_MESES = 8;
    var PROG_INICIO = [0, 4, 6, 7]; // mês em que cada segmento começa
    var cfCurrent = -2;

    function cfDotCenter(i) {
      var dot = cfItems[i].querySelector(".cf-dot");
      var dr = dot.getBoundingClientRect();
      var tr = cfTimeline.getBoundingClientRect();
      return (dr.top + dr.height / 2) - tr.top;
    }
    function cfLayoutLine() {
      if (!cfItems.length || !cfLine) return;
      var top = cfDotCenter(0);
      var bottom = cfDotCenter(cfTotal - 1);
      cfLine.style.top = top + "px";
      cfLine.style.height = (bottom - top) + "px";
    }
    function cfSetActive(idx) {
      if (idx === cfCurrent) return;
      cfCurrent = idx;
      for (var i = 0; i < cfTotal; i++) {
        if (i <= idx && idx >= 0) cfItems[i].classList.add("is-active");
        else cfItems[i].classList.remove("is-active");
      }
      var shown = idx < 0 ? 0 : idx;
      // a barra mede MESES VENCIDOS (data-mes), não a posição na lista
      var mes = idx < 0 ? 0 : (parseFloat(cfItems[shown].getAttribute("data-mes")) || 0);
      var avanco = (mes / PROG_MESES * 100) + "%";
      if (progFill) progFill.style.width = avanco;
      if (progNow) progNow.style.width = avanco;
      for (var s = 0; s < progSegs.length; s++) {
        progSegs[s].classList.toggle("is-on", mes >= PROG_INICIO[s]);
      }
      if (progFase) progFase.textContent = "Fase " + ("0" + (shown + 1)).slice(-2);
      if (progWhen) progWhen.textContent = cfItems[shown].getAttribute("data-month");
      if (progNow && idx >= 0) { progNow.classList.remove("is-new"); void progNow.offsetWidth; progNow.classList.add("is-new"); }
      if (cfLineFill) cfLineFill.style.height = Math.max(0, idx < 0 ? 0 : (cfDotCenter(idx) - cfDotCenter(0))) + "px";
    }
    var cfTicking = false;
    function cfUpdate() {
      cfTicking = false;
      var lineY = window.innerHeight * 0.52;
      if (cfTimeline.getBoundingClientRect().top > lineY) { cfSetActive(-1); return; }
      var active = 0;
      for (var i = 0; i < cfTotal; i++) {
        if (cfItems[i].querySelector(".cf-dot").getBoundingClientRect().top <= lineY) active = i;
      }
      cfSetActive(active);
    }
    function cfOnScroll() { if (!cfTicking) { cfTicking = true; requestAnimationFrame(cfUpdate); } }
    window.addEventListener("scroll", cfOnScroll, { passive: true });
    window.addEventListener("resize", function () { cfLayoutLine(); cfCurrent = -2; cfUpdate(); });
    cfLayoutLine();
    cfUpdate();
  }

  /* ---- 9. A reunião: zoom "entrar na tela" do notebook ---- */
  var rStage = document.getElementById("reuniaoStage");
  var rTrack = document.getElementById("reuniaoTrack");
  var rScreen = document.getElementById("reuniaoScreen");
  var rWash = document.getElementById("reuniaoWash");
  var rReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (rStage && rTrack && !rReduce) {
    var rS = 2;
    function rComputeS() {
      var sw = rStage.offsetWidth, sh = rStage.offsetHeight;
      if (!sw || !sh) { rS = 2; return; }
      // usa o tamanho real da "tela" (varia entre laptop no desktop e iPad no mobile)
      var screenW = (rScreen && rScreen.offsetWidth) || sw * 0.7935;
      var screenH = (rScreen && rScreen.offsetHeight) || sh * 0.8529;
      rS = Math.max(window.innerWidth / screenW, window.innerHeight / screenH) * 1.04;
      if (rS < 1) rS = 1;
    }
    var rTick = false;
    function rUpdate() {
      rTick = false;
      var range = rTrack.offsetHeight - window.innerHeight;
      var p = range > 0 ? (-rTrack.getBoundingClientRect().top) / range : 0;
      p = Math.max(0, Math.min(1, p));
      var pz = Math.min(1, p / 0.82);
      var scale = 1 + pz * (rS - 1);
      rStage.style.transform = "scale(" + scale.toFixed(4) + ")";
      if (rScreen) rScreen.style.transform = "scale(" + (1 / scale).toFixed(4) + ")";
      if (rWash) rWash.style.opacity = Math.max(0, Math.min(1, (pz - 0.45) / 0.55)).toFixed(3);
    }
    function rOnScroll() { if (!rTick) { rTick = true; requestAnimationFrame(rUpdate); } }
    window.addEventListener("scroll", rOnScroll, { passive: true });
    window.addEventListener("resize", function () { rComputeS(); rUpdate(); });
    rComputeS();
    rUpdate();
  }

  /* ---- 10. Prova social do hero: contagem animada dos números ---- */
  var trustStats = document.getElementById("trustStats");
  if (trustStats) {
    var counts = Array.prototype.slice.call(trustStats.querySelectorAll(".count"));
    function fmtCount(v, dec) { return v.toFixed(dec).replace(".", ","); }
    function runCounts() {
      counts.forEach(function (el) {
        var to = parseFloat(el.getAttribute("data-to")) || 0;
        var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
        if (rReduce) { el.textContent = fmtCount(to, dec); return; }
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmtCount(to * eased, dec);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = fmtCount(to, dec);
        }
        requestAnimationFrame(step);
      });
    }
    if ("IntersectionObserver" in window) {
      var ioCount = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounts(); ioCount.disconnect(); }
        });
      }, { threshold: 0.4 });
      ioCount.observe(trustStats);
    } else {
      runCounts();
    }
  }
})();
