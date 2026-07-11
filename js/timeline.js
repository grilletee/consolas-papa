/**
 * timeline.js — timeline.html
 * Construye el timeline completo desde consolas.json (ninguna consola
 * hardcodeada), y anima entrada + scanline de foco + transición CRT
 * entre décadas usando GSAP y ScrollTrigger.
 */

(async function () {
  gsap.registerPlugin(ScrollTrigger);

  const consolas = filtrarVariantesParaTimeline(await cargarConsolas());
  if (consolas.length === 0) return; // data.js ya mostró el mensaje de error

  const contenedor = document.getElementById('timelineContent');
  const plantillaConsola = document.getElementById('consoleTemplate');
  const plantillaDecada = document.getElementById('decadeTemplate');

  let decadaAnterior = null;

  consolas.forEach((consola) => {
    const decadaActual = obtenerDecada(consola.anio);

    // Si cambiamos de década respecto a la anterior, insertamos la transición CRT
    if (decadaAnterior !== null && decadaActual !== decadaAnterior) {
      const nodoDecada = plantillaDecada.content.cloneNode(true);
      nodoDecada.querySelector('.decade-label').textContent = consola.anio;
      nodoDecada.querySelector('.decade-sub').textContent = textoDecada(decadaActual);
      contenedor.appendChild(nodoDecada);
    }
    decadaAnterior = decadaActual;

    // Construir la sección de la consola a partir de la plantilla
    const nodo = plantillaConsola.content.cloneNode(true);
    nodo.querySelector('.console-year').textContent = consola.anio;
    nodo.querySelector('.console-img').src = consola.imagen;
    nodo.querySelector('.console-img').alt = consola.modelo;
    nodo.querySelector('.label').textContent = `${consola.fabricante} · ${consola.tipo}`;
    nodo.querySelector('.console-name').textContent = consola.modelo;
    nodo.querySelector('.console-meta').innerHTML =
      `${consola.fabricante} <span style="color:var(--brass)">·</span> ${consola.tipo} <span style="color:var(--brass)">·</span> ${consola.anio}`;
    nodo.querySelector('.console-note').textContent = consola.nota || '';

    contenedor.appendChild(nodo);
  });

  // ---- Animaciones de entrada + scanline, por cada sección de consola ----

  document.querySelectorAll('.console-section').forEach((section) => {
    const visual = section.querySelector('.console-visual');
    const info = section.querySelector('.console-info');
    const scanlines = section.querySelector('.scanlines');
    const year = section.querySelector('.console-year');

    gsap.set(visual, { opacity: 0, scale: 0.7, x: 80 });
    gsap.set(info, { opacity: 0, x: 40 });
    gsap.set(year, { opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      end: 'bottom 40%',
      onEnter: () => {
        gsap.to(visual, { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: 'power2.out' });
        gsap.to(info, { opacity: 1, x: 0, duration: 0.8, delay: 0.15, ease: 'power2.out' });
        gsap.to(scanlines, { opacity: 1, duration: 0.6 });
        gsap.to(year, { opacity: 1, duration: 0.6 });
      },
      onLeave: () => gsap.to(scanlines, { opacity: 0, duration: 0.4 }),
      onEnterBack: () => gsap.to(scanlines, { opacity: 1, duration: 0.4 }),
    });
  });

  // ---- Transición CRT al cambiar de década ----

  document.querySelectorAll('.decade-transition').forEach((section) => {
    const flash = section.querySelector('.crt-flash');
    const sweep = section.querySelector('.crt-sweep');
    const scanlines = section.querySelector('.crt-scanlines');
    const label = section.querySelector('.decade-label');

    let yaReproducido = false;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => {
        if (yaReproducido) return; // el destello solo se reproduce una vez por década
        yaReproducido = true;

        gsap.set(flash, { opacity: 0.9 });
        gsap.set(sweep, { opacity: 1, top: '50%' });
        gsap.set(scanlines, { opacity: 0 });
        gsap.set(label, { transform: 'scaleY(0.02)' });

        gsap.to(flash, { opacity: 0, duration: 0.25, ease: 'power1.out' });
        gsap.to(label, { scaleY: 1, duration: 0.4, delay: 0.1, ease: 'power3.out' });
        gsap.to(sweep, { top: '100%', duration: 0.5, ease: 'power1.inOut' });
        gsap.to(sweep, { opacity: 0, duration: 0.3, delay: 0.45 });
        gsap.to(scanlines, { opacity: 1, duration: 0.6, delay: 0.15 });
        gsap.to(scanlines, { opacity: 0, duration: 0.8, delay: 0.9 });
      },
    });
  });

  // ---- Carril de progreso lateral ----

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      document.getElementById('railProgress').style.height = (self.progress * 100) + '%';
    },
  });

  // Importante: tras inyectar todo el contenido dinámicamente, refrescamos
  // ScrollTrigger para que recalcule las posiciones correctas en la página.
  ScrollTrigger.refresh();
})();
