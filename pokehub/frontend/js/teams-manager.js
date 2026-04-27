/* =========================================
   TEAMS-MANAGER.JS
   Gestión de equipos guardados en el servidor.
   ========================================= */

async function loadSavedTeams() {
  const container = document.getElementById('saved-teams-list');
  if (!container) return;
  container.innerHTML = `<div class="api-loading"><div class="api-spinner"></div><span>${window.t ? window.t('common.loadingTeams') : 'Cargando equipos...'}</span></div>`;

  const teams = await window.PH_API?.teams.getAll() || [];

  if (!teams.length) {
    container.innerHTML = `
      <div class="teams-empty">
        <div style="font-size:32px;margin-bottom:12px">🛡️</div>
        <div style="font-size:14px;color:var(--text-muted)">${window.t ? window.t('common.noSavedTeams') : 'No tienes equipos guardados todavía.'}</div>
        <div style="font-size:13px;color:var(--text-hint);margin-top:6px">${window.t ? window.t('common.createTeamFirst') : 'Crea uno en el Constructor y guárdalo aquí.'}</div>
      </div>`;
    return;
  }

  container.innerHTML = teams.map(team => `
    <div class="saved-team-card" data-id="${team.id}">
      <div class="saved-team-header">
        <div>
          <div class="saved-team-name">${team.name}</div>
          <div class="saved-team-meta">
            <span class="saved-team-format">${team.format}</span>
            <span class="saved-team-date">${formatDate(team.created_at)}</span>
          </div>
        </div>
        <div class="saved-team-actions">
          <button class="btn-team-load" data-id="${team.id}" title="${window.t ? window.t('common.load') : 'Cargar'}">⬆ ${window.t ? window.t('common.load') : 'Cargar'}</button>
          <button class="btn-team-delete" data-id="${team.id}" title="${window.t ? window.t('common.delete') : 'Eliminar'}">🗑</button>
        </div>
      </div>
    </div>`
  ).join('');

  // Eventos
  container.querySelectorAll('.btn-team-load').forEach(btn => {
    btn.addEventListener('click', async () => {
      const team = await window.PH_API.teams.get(btn.dataset.id);
      if (!team) return;
      // Importar en el constructor
      if (typeof importShowdown === 'function') {
        importShowdown(team.export_code);
        navigateTo('constructor');
      }
    });
  });

  container.querySelectorAll('.btn-team-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const approved = await (window.PH_UI?.confirm?.(
        window.t ? window.t('common.deleteTeamConfirm') : '¿Eliminar este equipo?',
        'PokeHub'
      ) ?? Promise.resolve(false));
      if (!approved) return;
      await window.PH_API.teams.delete(btn.dataset.id);
      window.PH_UI?.toast?.(window.LANG === 'en' ? 'Team deleted.' : 'Equipo eliminado.', 'success');
      loadSavedTeams();
    });
  });
}

function formatDate(str) {
  if (!str) return '';
  const locale = window.LANG === 'en' ? 'en-GB' : 'es-ES';
  return new Date(str).toLocaleDateString(locale, { day:'2-digit', month:'short', year:'numeric' });
}

/* Guardar equipo actual desde el constructor */
async function saveCurrentTeam() {
  const code = typeof exportShowdown === 'function' ? exportShowdown() : '';
  if (!code.trim()) {
    await window.PH_UI?.alert?.(window.t ? window.t('common.emptyTeam') : 'El equipo está vacío. Añade al menos un Pokémon.', 'PokeHub');
    return;
  }

  const values = await (window.PH_UI?.prompt?.(
    window.LANG === 'en' ? 'Save your current team in PokéHub.' : 'Guarda tu equipo actual en PokéHub.',
    {
      title: 'PokeHub',
      confirmLabel: window.t ? window.t('common.saveTeam') : 'Guardar equipo',
      fields: [
        { id: 'name', label: window.t ? window.t('common.teamNamePrompt') : 'Nombre del equipo:', value: 'Mi equipo' },
        { id: 'format', label: window.t ? window.t('common.teamFormatPrompt') : 'Formato (OU, UU, Doubles...)', value: 'OU' },
      ],
    }
  ) ?? Promise.resolve(null));

  if (!values?.name) return;
  const name = values.name;
  const format = values.format || 'OU';

  const saved = await window.PH_API?.teams.save(name, format, code);
  if (saved) {
    window.PH_UI?.toast?.(
      `${saved.name}: ${window.t ? window.t('common.teamSaved') : 'Equipo guardado correctamente.'}`,
      'success'
    );
  } else {
    await window.PH_UI?.alert?.(
      window.t ? window.t('common.teamSaveError') : 'No se pudo guardar. ¿Está el servidor corriendo?',
      'PokeHub'
    );
  }
}

// Añadir botón "Guardar equipo" al constructor cuando se carga
document.addEventListener('DOMContentLoaded', () => {
  // Botón guardar en la topbar del constructor
  const topbar = document.querySelector('.tb-topbar .tb-actions');
  if (topbar) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-secondary';
    saveBtn.textContent = `💾 ${window.t ? window.t('common.saveTeam') : 'Guardar equipo'}`;
    saveBtn.addEventListener('click', saveCurrentTeam);
    topbar.prepend(saveBtn);
  }

  // Cargar equipos cuando se navega a la sección
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.section === 'equipos') {
        setTimeout(loadSavedTeams, 50);
      }
    });
  });

  // Botón de actualizar
  document.getElementById('btn-refresh-teams')?.addEventListener('click', loadSavedTeams);
});

document.addEventListener('langchange', () => {
  const saveBtn = document.querySelector('.tb-topbar .tb-actions .btn-secondary');
  if (saveBtn) saveBtn.textContent = `💾 ${window.t ? window.t('common.saveTeam') : 'Guardar equipo'}`;
  if (document.querySelector('#section-equipos.section.active')) {
    loadSavedTeams();
  }
});
