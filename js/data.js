/**
 * data.js — Carga compartida de consolas.json
 * Usado por timeline.js y coleccion.js. Mantiene consolas.json
 * como única fuente de verdad: nada de datos de consola hardcodeados aquí.
 */

async function cargarConsolas() {
  try {
    const respuesta = await fetch('consolas.json');
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error('No se pudo cargar consolas.json:', error);
    mostrarErrorCarga();
    return [];
  }
}

/**
 * Modelos que son variantes de color/edición de un modelo ya presente
 * en la lista (misma historia de lanzamiento, no aportan un momento
 * narrativo nuevo al timeline cronológico). Se excluyen SOLO en
 * timeline.js — coleccion.html sigue mostrando las 57 piezas completas,
 * porque ahí sí importa reflejar cada unidad física real.
 */
const VARIANTES_OCULTAS_EN_TIMELINE = [
  'GAME BOY ADVANCE AZUL',
  'GAME BOY COLOR VERDE',
];

function filtrarVariantesParaTimeline(consolas) {
  return consolas.filter((c) => !VARIANTES_OCULTAS_EN_TIMELINE.includes(c.modelo));
}

function mostrarErrorCarga() {
  // Si consolas.json no carga (ruta incorrecta, archivo movido, etc.),
  // esto evita que la página se quede en silencio sin explicación.
  const root = document.getElementById('timelineContent') || document.getElementById('grid');
  if (root) {
    root.innerHTML = `
      <div style="padding: 80px 40px; text-align: center; color: #9b9690;">
        <p style="font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #F4EFE6; margin-bottom: 8px;">
          No se pudieron cargar las consolas
        </p>
        <p style="font-size: 13px;">
          Comprueba que el archivo consolas.json está en la misma carpeta que este HTML.
        </p>
      </div>
    `;
  }
}

/** Agrupa consolas por década (1980, 1990, 2000...) a partir del año */
function obtenerDecada(anio) {
  return Math.floor(anio / 10) * 10;
}

/** Texto legible de década, ej. 1990 -> "Entramos en los 90" */
function textoDecada(decada) {
  const corta = decada % 100;
  const sufijo = corta === 0 ? '2000' : String(corta).padStart(2, '0');
  return `Entramos en los ${sufijo}`;
}
