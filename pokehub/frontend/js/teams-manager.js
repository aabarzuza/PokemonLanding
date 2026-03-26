/* =========================================
   TEAMS-MANAGER.JS
   Gestión de equipos guardados en el servidor.
   ========================================= */

async function loadSavedTeams() {
  const container = document.getElementById('saved-teams-list');
  if (!container) return;
  container.innerHTML = '<div class="api-loading"><div class="api-spinner"></div><span>Cargando equipos...</span></div>';

  const teams = await window.PH_API?.teams.getAll() || [];

  if (!teams.length) {
    container.innerHTML = `
      <div class="teams-empty">
        <div style="font-size:32px;margin-bottom:12px">🛡️</div>
        <div style="font-size:14px;color:var(--text-muted)">No tienes equipos guardados todavía.</div>
        <div style="font-size:13px;color:var(--text-hint);margin-top:6px">Crea uno en el Constructor y guárdalo aquí.</div>
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
          <button class="btn-team-load" data-id="${team.id}" title="Cargar en el constructor">⬆ Cargar</button>
          <button class="btn-team-delete" data-id="${team.id}" title="Eliminar">🗑</button>
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
      if (!confirm('¿Eliminar este equipo?')) return;
      await window.PH_API.teams.delete(btn.dataset.id);
      loadSavedTeams();
    });
  });
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
}

/* Guardar equipo actual desde el constructor */
async function saveCurrentTeam() {
  const code = typeof exportShowdown === 'function' ? exportShowdown() : '';
  if (!code.trim()) {
    alert('El equipo está vacío. Añade al menos un Pokémon.');
    return;
  }

  const name   = prompt('Nombre del equipo:', 'Mi equipo');
  if (!name) return;
  const format = prompt('Formato (OU, UU, Doubles...)', 'OU') || 'OU';

  const saved = await window.PH_API?.teams.save(name, format, code);
  if (saved) {
    alert(`✅ Equipo "${saved.name}" guardado correctamente.`);
  } else {
    alert('⚠️ No se pudo guardar. ¿Está el servidor corriendo?');
  }
}

// Añadir botón "Guardar equipo" al constructor cuando se carga
document.addEventListener('DOMContentLoaded', () => {
  // Botón guardar en la topbar del constructor
  const topbar = document.querySelector('.tb-topbar .tb-actions');
  if (topbar) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-secondary';
    saveBtn.textContent = '💾 Guardar equipo';
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
