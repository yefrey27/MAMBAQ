/**
 * hash-router.js — MAMBAQ v2.0
 * ─────────────────────────────────────────────────────────────
 * Routing limpio SIN # usando History API + _redirects de Render.
 *
 * URLs resultantes:
 *   index.html   →  mambaqsite.online/           (scroll)
 *                   mambaqsite.online/#historia   (index sigue usando hash)
 *                   mambaqsite.online/#galeria
 *                   mambaqsite.online/#coleccion
 *                   mambaqsite.online/#visita
 *
 *   adultos.html →  mambaqsite.online/adultos/crear
 *                   mambaqsite.online/adultos/museo
 *                   mambaqsite.online/adultos/sobre
 *
 *   kids.html    →  mambaqsite.online/kids/crear
 *                   mambaqsite.online/kids/galeria
 *                   mambaqsite.online/kids/jugar
 *
 * Requiere _redirects en la raíz del proyecto (incluido en entrega).
 * Cómo incluirlo — última línea antes de </body> en cada HTML:
 *   <script src="hash-router.js"></script>
 * ─────────────────────────────────────────────────────────────
 */

(function () {

  /* ══════════════════════════════════════════════════════════
     1. DETECCIÓN DE PÁGINA
  ══════════════════════════════════════════════════════════ */
  const path = window.location.pathname.toLowerCase();

  const PAGE =
    path.includes('kids')    ? 'kids'    :
    path.includes('adultos') ? 'adultos' :
    path.includes('museo')   ? 'adultos' :
    'index';

  /* ══════════════════════════════════════════════════════════
     2. MAPA COMPLETO DE SECCIONES
     Verificado contra los IDs reales del HTML
  ══════════════════════════════════════════════════════════ */
  const MAPS = {

    /*
     * adultos.html
     * Botones: [data-section="crear"] | [data-section="museo"] | [data-section="sobre"]
     * Secciones: #sectionCrear | #sectionMuseo | #sectionSobre
     */
    adultos: [
      { hash: 'crear',  selector: '[data-section="crear"]',  default: true },
      { hash: 'museo',  selector: '[data-section="museo"]'                 },
      { hash: 'sobre',  selector: '[data-section="sobre"]'                 },
    ],

    /*
     * kids.html
     * Botones: [data-sec="secCrear"] | [data-sec="secGaleria"] | [data-sec="secJugar"]
     * Secciones: #secCrear | #secGaleria | #secJugar
     */
    kids: [
      { hash: 'crear',   selector: '[data-sec="secCrear"]',   default: true },
      { hash: 'galeria', selector: '[data-sec="secGaleria"]'                },
      { hash: 'jugar',   selector: '[data-sec="secJugar"]'                  },
    ],

    /*
     * index.html
     * Navbar: href="#historia" | href="#galeria" | href="#coleccion" | href="#visita"
     * Secciones reales: #historia | #galeria | #coleccion | #visita
     */
    index: [
      { hash: 'historia',  elementId: 'historia',  default: true },
      { hash: 'galeria',   elementId: 'galeria'                  },
      { hash: 'coleccion', elementId: 'coleccion'                },
      { hash: 'visita',    elementId: 'visita'                   },
    ],

  };

  /* ══════════════════════════════════════════════════════════
     3. HELPERS DE URL
     kids/adultos  → /kids/jugar  (sin #)
     index         → /#historia   (sigue con hash, es scroll-page)
  ══════════════════════════════════════════════════════════ */
  const map = MAPS[PAGE];
  if (!map) return;

  // Prefijo de ruta para páginas internas
  const BASE = PAGE === 'index' ? '' :
               PAGE === 'adultos' ? '/museo' :
               '/' + PAGE;

  // Construye la URL limpia para una entrada
  function cleanUrl(entry) {
    if (PAGE === 'index') return '#' + entry.hash;       // index sigue con hash
    return BASE + '/' + entry.hash;                      // /kids/jugar
  }

  // Lee la sección activa desde la URL actual
  function sectionFromUrl() {
    if (PAGE === 'index') {
      return window.location.hash.replace('#', '').trim();
    }
    // pathname: /kids/jugar  →  "jugar"
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] || '';   // partes: ["kids", "jugar"]
  }

  /* ══════════════════════════════════════════════════════════
     4. NÚCLEO DEL ROUTER
  ══════════════════════════════════════════════════════════ */

  // Navega a la sección indicada
  function goTo(section) {
    const entry = map.find(e => e.hash === section)
                || map.find(e => e.default)
                || map[0];

    // Páginas con botones de navegación (adultos y kids)
    if (entry.selector) {
      const btn = document.querySelector(entry.selector);
      if (btn) btn.click();
    }

    // Página index — scroll suave al elemento
    if (entry.elementId) {
      const el = document.getElementById(entry.elementId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    // Actualiza la URL sin recargar
    const url = cleanUrl(entry);
    const current = PAGE === 'index'
      ? window.location.hash
      : window.location.pathname;
    if (current !== url) {
      history.replaceState(null, '', url);
    }
  }

  // Intercepta cada click en botones de nav y actualiza la URL limpia
  function bindNavButtons() {
    map.forEach(entry => {
      if (!entry.selector) return;
      const btn = document.querySelector(entry.selector);
      if (!btn) return;
      // capture:true → corre ANTES que el listener existente del HTML
      btn.addEventListener('click', () => {
        history.pushState(null, '', cleanUrl(entry));
      }, { capture: true });
    });
  }

  // Para index.html: observa qué sección está visible y actualiza la URL
  function bindScrollObserver() {
    if (PAGE !== 'index') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const match = map.find(e => e.elementId === entry.target.id);
        if (match) history.replaceState(null, '', cleanUrl(match));
      });
    }, { threshold: 0.35 });

    map.forEach(entry => {
      if (!entry.elementId) return;
      const el = document.getElementById(entry.elementId);
      if (el) observer.observe(el);
    });
  }

  /* ══════════════════════════════════════════════════════════
     5. INICIO
  ══════════════════════════════════════════════════════════ */
  function init() {
    const section = sectionFromUrl();

    // Si la URL ya indica una sección, navega a ella al cargar
    if (section) {
      // Delay para dejar que el código existente termine de inicializar
      setTimeout(() => goTo(section), 700);
    }

    bindNavButtons();
    bindScrollObserver();

    // Botón atrás / adelante del navegador
    window.addEventListener('popstate', () => {
      const s = sectionFromUrl();
      if (s) goTo(s);
    });
  }

  // Espera el DOM si todavía no cargó
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
