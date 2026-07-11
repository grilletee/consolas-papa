/**
 * coleccion.js — coleccion.html
 * Construye el grid desde consolas.json, genera los filtros de fabricante
 * y década dinámicamente (no hardcodeados), combina búsqueda + 3 filtros
 * con AND, gestiona el estado vacío y el overlay de detalle.
 */

(async function () {
  const consolas = await cargarConsolas();
  if (consolas.length === 0) return;

  const grid = document.getElementById('grid');
  const plantillaCard = document.getElementById('cardTemplate');
  const emptyState = document.getElementById('emptyState');
  const visibleCount = document.getElementById('visibleCount');
  const searchInput = document.getElementById('searchInput');

  const filtros = { fabricante: 'todos', tipo: 'todos', decada: 'todos' };

  // ---- Generar pills de fabricante dinámicamente, a partir de los datos reales ----

  const fabricantes = [...new Set(consolas.map((c) => c.fabricante))].sort();
  const filaFabricante = document.getElementById('filterFabricante');
  fabricantes.forEach((fab) => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.dataset.value = fab.toLowerCase();
    btn.textContent = fab;
    filaFabricante.appendChild(btn);
  });

  // ---- Generar pills de década dinámicamente ----

  const decadas = [...new Set(consolas.map((c) => obtenerDecada(c.anio)))].sort();
  const filaDecada = document.getElementById('filterDecada');
  decadas.forEach((decada) => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.dataset.value = String(decada);
    const corta = decada % 100;
    btn.textContent = `${corta}s`;
    filaDecada.appendChild(btn);
  });

  // ---- Construir el grid de tarjetas ----

  consolas.forEach((consola) => {
    const nodo = plantillaCard.content.cloneNode(true);
    const card = nodo.querySelector('.card-dense');

    card.dataset.fabricante = consola.fabricante.toLowerCase();
    card.dataset.tipo = consola.tipo.toLowerCase();
    card.dataset.decada = String(obtenerDecada(consola.anio));
    card.dataset.nombre = consola.modelo.toLowerCase();

    card.querySelector('.year-stamp').textContent = consola.anio;
    card.querySelector('.card-img').src = consola.imagen;
    card.querySelector('.card-img').alt = consola.modelo;
    card.querySelector('.name').textContent = consola.modelo;
    card.querySelector('.maker').textContent = `${consola.fabricante} · ${consola.tipo}`;

    card.addEventListener('click', () => abrirDetalle(consola));

    grid.appendChild(nodo);
  });

  // ---- Lógica de filtrado combinado (AND entre los 3 grupos + búsqueda) ----

  function aplicarFiltros() {
    const query = searchInput.value.trim().toLowerCase();
    const tarjetas = grid.querySelectorAll('.card-dense');
    let visibles = 0;

    tarjetas.forEach((card) => {
      const coincideFabricante = filtros.fabricante === 'todos' || card.dataset.fabricante === filtros.fabricante;
      const coincideTipo = filtros.tipo === 'todos' || card.dataset.tipo === filtros.tipo;
      const coincideDecada = filtros.decada === 'todos' || card.dataset.decada === filtros.decada;
      const coincideBusqueda = query === '' || card.dataset.nombre.includes(query);

      const mostrar = coincideFabricante && coincideTipo && coincideDecada && coincideBusqueda;
      card.classList.toggle('hidden', !mostrar);
      if (mostrar) visibles++;
    });

    visibleCount.textContent = visibles;
    emptyState.hidden = visibles !== 0;
  }

  // ---- Listeners de los pills, delegados por grupo ----

  function activarPill(grupo, boton) {
    const fila = boton.closest('.pill-row');
    fila.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
    boton.classList.add('active');
    filtros[grupo] = boton.dataset.value;
    aplicarFiltros();
  }

  document.querySelectorAll('[data-filter-group]').forEach((grupo) => {
    const nombreGrupo = grupo.dataset.filterGroup;
    grupo.querySelectorAll('.pill').forEach((pill) => {
      pill.addEventListener('click', () => activarPill(nombreGrupo, pill));
    });
  });

  searchInput.addEventListener('input', aplicarFiltros);

  // ---- Panel de filtros colapsable en móvil ----

  const filtersToggle = document.getElementById('filtersToggle');
  const filtersPanel = document.getElementById('filtersPanel');

  filtersToggle.addEventListener('click', () => {
    const abierto = filtersPanel.classList.toggle('open');
    filtersToggle.setAttribute('aria-expanded', String(abierto));
  });

  // ---- Overlay de detalle ----

  const detailOverlay = document.getElementById('detailOverlay');
  const detailClose = document.getElementById('detailClose');

  function abrirDetalle(consola) {
    document.getElementById('detailImg').src = consola.imagen;
    document.getElementById('detailImg').alt = consola.modelo;
    document.getElementById('detailName').textContent = consola.modelo;
    document.getElementById('detailTipo').textContent = consola.tipo;
    document.getElementById('detailMaker').textContent = consola.fabricante;
    document.getElementById('detailYear').textContent = consola.anio;
    document.getElementById('detailNote').textContent = consola.nota || '';
    detailOverlay.hidden = false;
  }

  function cerrarDetalle() {
    detailOverlay.hidden = true;
  }

  detailClose.addEventListener('click', cerrarDetalle);
  detailOverlay.addEventListener('click', (evento) => {
    if (evento.target === detailOverlay) cerrarDetalle();
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !detailOverlay.hidden) cerrarDetalle();
  });

  // Conteo inicial
  aplicarFiltros();
})();
