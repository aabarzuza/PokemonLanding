(function () {
  // Escapa texto para poder meterlo en plantillas HTML sin riesgo de inyectar etiquetas.
  function esc(value) {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // This function creates the root HTML for custom dialogs and toasts.
  function ensureUIRoot() {
    let root = document.getElementById('ph-ui-root');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'ph-ui-root';
    root.innerHTML = `
      <div id="ph-toast-stack" class="ph-toast-stack"></div>
      <div id="ph-dialog-backdrop" class="ph-dialog-backdrop hidden">
        <div class="ph-dialog-card" role="dialog" aria-modal="true">
          <div class="ph-dialog-brand">POKEHUB</div>
          <div id="ph-dialog-title" class="ph-dialog-title"></div>
          <div id="ph-dialog-message" class="ph-dialog-message"></div>
          <div id="ph-dialog-fields" class="ph-dialog-fields"></div>
          <div id="ph-dialog-actions" class="ph-dialog-actions"></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    return root;
  }

  // This function shows a temporary floating message.
  function toast(message, type = 'info') {
    ensureUIRoot();
    const stack = document.getElementById('ph-toast-stack');
    if (!stack) return;

    const item = document.createElement('div');
    item.className = `ph-toast is-${type}`;
    item.textContent = message;
    stack.appendChild(item);

    setTimeout(() => item.classList.add('is-visible'), 10);
    setTimeout(() => {
      item.classList.remove('is-visible');
      setTimeout(() => item.remove(), 180);
    }, 2800);
  }

  // This function opens a custom dialog instead of the browser alert box.
  function openDialog({ title, message = '', fields = [], actions = [] }) {
    ensureUIRoot();

    const backdrop = document.getElementById('ph-dialog-backdrop');
    const titleEl = document.getElementById('ph-dialog-title');
    const messageEl = document.getElementById('ph-dialog-message');
    const fieldsEl = document.getElementById('ph-dialog-fields');
    const actionsEl = document.getElementById('ph-dialog-actions');

    if (!backdrop || !titleEl || !messageEl || !fieldsEl || !actionsEl) return Promise.resolve(null);

    titleEl.textContent = title || 'PokeHub';
    messageEl.textContent = message || '';
    fieldsEl.innerHTML = fields.map((field) => `
      <label class="ph-dialog-field">
        ${field.label ? `<span class="ph-dialog-field-label">${esc(field.label)}</span>` : ''}
        <input class="ph-dialog-input" data-ph-field="${esc(field.id)}" value="${esc(field.value || '')}" placeholder="${esc(field.placeholder || '')}" />
      </label>
    `).join('');

    return new Promise((resolve) => {
      function close(value) {
        backdrop.classList.add('hidden');
        actionsEl.innerHTML = '';
        backdrop.onclick = null;
        resolve(value);
      }

      actionsEl.innerHTML = actions.map((action, index) => `
        <button class="${action.primary ? 'btn-primary' : 'btn-secondary'}" data-ph-action="${index}" type="button">${esc(action.label)}</button>
      `).join('');

      backdrop.classList.remove('hidden');

      actionsEl.querySelectorAll('[data-ph-action]').forEach((button) => {
        button.addEventListener('click', () => {
          const action = actions[Number(button.dataset.phAction)];
          const values = {};
          fieldsEl.querySelectorAll('[data-ph-field]').forEach((input) => {
            values[input.dataset.phField] = input.value.trim();
          });
          close(action?.onSelect ? action.onSelect(values) : values);
        }, { once: true });
      });

      backdrop.onclick = (event) => {
        if (event.target === backdrop) {
          const cancelAction = actions.find((action) => action.cancel);
          close(cancelAction?.onSelect ? cancelAction.onSelect({}) : null);
        }
      };

      fieldsEl.querySelector('[data-ph-field]')?.focus();
    });
  }

  window.PH_UI = {
    toast,
    alert(message, title = 'POKEHUB') {
      return openDialog({
        title,
        message,
        actions: [
          { label: 'OK', primary: true, onSelect: () => true },
        ],
      });
    },
    confirm(message, title = 'POKEHUB') {
      return openDialog({
        title,
        message,
        actions: [
          { label: window.t ? window.t('common.delete') : 'Eliminar', primary: true, onSelect: () => true },
          { label: window.t ? window.t('common.back') : 'Volver', cancel: true, onSelect: () => false },
        ],
      });
    },
    prompt(message, { title = 'POKEHUB', fields = [], confirmLabel = 'OK' } = {}) {
      return openDialog({
        title,
        message,
        fields,
        actions: [
          { label: confirmLabel, primary: true, onSelect: (values) => values },
          { label: window.t ? window.t('common.back') : 'Volver', cancel: true, onSelect: () => null },
        ],
      });
    },
  };

  document.addEventListener('DOMContentLoaded', ensureUIRoot);
})();
