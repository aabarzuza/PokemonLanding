/* =========================================
   JS/GLOSSARY.JS
   This file controls the glossary term search.
   ========================================= */

const searchInput    = document.getElementById('glossary-search');
const categoryFilter = document.getElementById('glossary-category');
const glossaryList   = document.getElementById('glossary-list');
const resultCount    = document.getElementById('glossary-count');

/* Normalizar: minúsculas + sin acentos */
function normG(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildCategoryFilter() {
  const cats = [...new Set(GLOSSARY.map(i => i.category))].sort();
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

function renderGlossary(items) {
  glossaryList.innerHTML = '';
  if (!items.length) {
    glossaryList.innerHTML = `<div class="glossary-empty">${window.LANG === 'en' ? 'No terms found. Try another search.' : 'No se encontraron términos. Prueba con otra búsqueda.'}</div>`;
    resultCount.textContent = window.LANG === 'en' ? '0 terms' : '0 términos';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glossary-card';
    card.innerHTML =
      '<div class="glossary-card-header">' +
        '<span class="glossary-term">' + item.term + '</span>' +
        '<span class="glossary-category-badge category-' + slugify(item.category) + '">' + item.category + '</span>' +
      '</div>' +
      '<p class="glossary-definition">' + item.definition + '</p>';
    glossaryList.appendChild(card);
  });
  resultCount.textContent = window.LANG === 'en'
    ? `${items.length} term${items.length !== 1 ? 's' : ''}`
    : `${items.length} término${items.length !== 1 ? 's' : ''}`;
}

function filterGlossary() {
  const query    = normG(searchInput.value.trim());
  const category = categoryFilter.value;

  const filtered = GLOSSARY.filter(item => {
    const inTerm = normG(item.term).includes(query);
    const inDef  = normG(item.definition).includes(query);
    const matchSearch = query === '' || inTerm || inDef;
    const matchCat = category === 'all' || item.category === category;
    return matchSearch && matchCat;
  });

  /* Ordenar: término que empieza por la query primero */
  filtered.sort((a, b) => {
    const at = normG(a.term), bt = normG(b.term);
    const aStarts = at.startsWith(query) ? 0 : 1;
    const bStarts = bt.startsWith(query) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return at.localeCompare(bt);
  });

  renderGlossary(filtered);
}

searchInput.addEventListener('input', filterGlossary);
categoryFilter.addEventListener('change', filterGlossary);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchInput.value = ''; filterGlossary(); }
});

buildCategoryFilter();
filterGlossary();

document.addEventListener('langchange', () => {
  filterGlossary();
});
