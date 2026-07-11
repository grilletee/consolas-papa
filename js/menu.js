/**
 * menu.js — index.html
 * Navegación por teclado del menú de inicio: ↑↓ mueve el cursor, Intro entra.
 */

(function () {
  const opciones = Array.from(document.querySelectorAll('.menu-option'));
  if (opciones.length === 0) return;

  let actual = 0;

  function marcarActiva(indice) {
    opciones.forEach((op, i) => {
      op.classList.toggle('active', i === indice);
    });
  }

  // Estado inicial: la primera opción activa, como en la demo original
  marcarActiva(actual);

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      actual = (actual + 1) % opciones.length;
      marcarActiva(actual);
      opciones[actual].focus();
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      actual = (actual - 1 + opciones.length) % opciones.length;
      marcarActiva(actual);
      opciones[actual].focus();
    } else if (evento.key === 'Enter') {
      // Si el foco ya está en una opción (por tab o flechas), el navegador
      // sigue el enlace de forma nativa al pulsar Enter — no hace falta lógica extra.
    }
  });

  // Si el usuario pasa el ratón por una opción, la marcamos activa también,
  // para que el teclado y el ratón compartan el mismo estado visual.
  opciones.forEach((op, i) => {
    op.addEventListener('mouseenter', () => {
      actual = i;
      marcarActiva(actual);
    });
  });
})();
