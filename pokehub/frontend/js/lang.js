/* =========================================
   LANG.JS — Sistema de idioma global
   Lee TRANSLATIONS_ES para mostrar nombres
   en ES o EN en toda la app.
   ========================================= */

window.LANG = localStorage.getItem('pokehub-lang') || 'es';

/* ── Obtener nombre según idioma del usuario ── */
window.getName = function(id, category) {
  const T = window.TRANSLATIONS_ES;
  if (!T || !T[category]) return id;
  const entry = T[category][id];
  if (!entry) return id;
  const [es, en] = Array.isArray(entry) ? entry : [entry, null];
  if (window.LANG === 'es') return es || en || id;
  if (window.LANG === 'en') return en || id;
  // 'both': mostrar "ES / EN"
  if (es && en && es !== en) return `${es} / ${en}`;
  return es || en || id;
};

/* ── Nombre secundario (el otro idioma) ── */
window.getSecName = function(id, category) {
  const T = window.TRANSLATIONS_ES;
  if (!T || !T[category]) return '';
  const entry = T[category][id];
  if (!entry) return '';
  const [es, en] = Array.isArray(entry) ? entry : [entry, null];
  if (window.LANG === 'es') return en || '';
  if (window.LANG === 'en') return es || '';
  return '';
};

/* ── Descripción EN (siempre en inglés, es lo que hay) ── */
window.getDesc = function(id, category) {
  const T = window.TRANSLATIONS_ES;
  if (!T || !T[category]) return '';
  const entry = T[category][id];
  if (!Array.isArray(entry) || entry.length < 3) return '';
  return entry[2] || '';
};

/* ── Obtener nombre preferido de un resultado de la API ── */
window.getPreferredName = function(result) {
  if (!result) return '';
  if (window.LANG === 'es') return result.name_es || result.name || result.id || '';
  if (window.LANG === 'en') return result.name || result.name_en || result.id || '';
  // both
  const es = result.name_es || '';
  const en = result.name || result.name_en || '';
  if (es && en && es !== en) return `${es} / ${en}`;
  return es || en || result.id || '';
};

window.getSecondaryName = function(result) {
  if (!result) return '';
  if (window.LANG === 'es') return result.name || result.name_en || '';
  return result.name_es || '';
};

window.getBilingualNames = function(result) {
  if (!result) return { es: '', en: '' };
  const es = result.name_es || result.es || result.name || result.id || '';
  const en = result.name_en || result.name || result.id || '';
  return { es, en };
};

/* ── Tipos según idioma ── */
const TYPE_NAMES_ALL = {
  es: { normal:'Normal',fire:'Fuego',water:'Agua',electric:'Eléctrico',
    grass:'Planta',ice:'Hielo',fighting:'Lucha',poison:'Veneno',
    ground:'Tierra',flying:'Volador',psychic:'Psíquico',bug:'Bicho',
    rock:'Roca',ghost:'Fantasma',dragon:'Dragón',dark:'Siniestro',
    steel:'Acero',fairy:'Hada' },
  en: { normal:'Normal',fire:'Fire',water:'Water',electric:'Electric',
    grass:'Grass',ice:'Ice',fighting:'Fighting',poison:'Poison',
    ground:'Ground',flying:'Flying',psychic:'Psychic',bug:'Bug',
    rock:'Rock',ghost:'Ghost',dragon:'Dragon',dark:'Dark',
    steel:'Steel',fairy:'Fairy' },
};
window.getTypeName = function(typeEn) {
  const lang = window.LANG === 'both' ? 'es' : window.LANG;
  return (TYPE_NAMES_ALL[lang] || TYPE_NAMES_ALL.es)[typeEn] || typeEn;
};

/* ── Cambiar idioma ── */
window.setLang = function(lang) {
  window.LANG = lang;
  localStorage.setItem('pokehub-lang', lang);
  updateLangButton();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
};

/* ── Actualizar botón ── */
function updateLangButton() {
  const btn = document.getElementById('lang-toggle-btn');
  if (!btn) return;
  const labels = { es: '🌍 ES', en: '🌍 EN', both: '🌍 ES/EN' };
  btn.textContent = labels[window.LANG] || '🌍 ES';
}

/* ── Ciclar entre ES → EN → ES/EN → ES ── */
window.cycleLang = function() {
  const cycle = { es: 'en', en: 'both', both: 'es' };
  window.setLang(cycle[window.LANG] || 'es');
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  updateLangButton();
});
