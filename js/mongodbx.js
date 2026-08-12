// MongoDB management functionality
const MONGODB_API_BASE = 'https://mongo.szapatar.dev';
const credentialStorageKey = 'big-o:mongodb-credentials';
const apiKeyStorageKey = 'big-o:mongodb-api-key';
const credentialLifetimeMs = 10 * 60 * 1000; // 10 minutes

document.addEventListener('DOMContentLoaded', () => {
  const statsContent = document.getElementById('mongodb-stats');
  const mongodbList = document.getElementById('mongodb-list');
  const provisionDialog = document.getElementById('provision-mongo-dialog');
  const credentialsDialog = document.getElementById('mongo-credentials-dialog');
  const credentialsContent = document.getElementById('mongo-credentials-content');
  const refreshStatsBtn = document.getElementById('refresh-stats');
  const openProvisionBtn = document.getElementById('open-provision-mongo');
  const copyCredentialsBtn = document.getElementById('mongo-copy-credentials');

  const showMessage = (text, elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
      element.classList.remove('hidden');
    }
  };

  const parseApiResponse = async (response) => {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMessage = body?.error?.message || body?.message || `${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return body;
  };

  const publicApi = async (path, options = {}) => {
    const response = await fetch(`${MONGODB_API_BASE}${path}`, {
      credentials: 'include',
      ...options
    });
    return parseApiResponse(response);
  };

  const clearCredentials = () => {
    sessionStorage.removeItem(credentialStorageKey);
  };

  const clearApiKey = () => {
    sessionStorage.removeItem(apiKeyStorageKey);
  };

  const restoreApiKey = () => {
    return sessionStorage.getItem(apiKeyStorageKey) || '';
  };

  const saveApiKey = (key) => {
    sessionStorage.setItem(apiKeyStorageKey, key);
  };

  const setApiKeyInput = () => {
    const apiKeyInput = document.getElementById('mongo-api-key');
    if (apiKeyInput) {
      apiKeyInput.value = restoreApiKey();
    }
  };

  const showCredentials = (content) => {
    credentialsContent.textContent = content;
    if (!credentialsDialog.open) {
      credentialsDialog.showModal();
    }
  };

  const saveCredentials = (content) => {
    sessionStorage.setItem(credentialStorageKey, JSON.stringify({
      content,
      expiresAt: Date.now() + credentialLifetimeMs
    }));
  };

  const restoreCredentials = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(credentialStorageKey) || 'null');
      if (!saved || !saved.content || saved.expiresAt < Date.now()) {
        clearCredentials();
        return;
      }
      showCredentials(saved.content);
    } catch {
      clearCredentials();
    }
  };

  const loadStats = async () => {
    try {
      const apiKey = restoreApiKey();
      if (!apiKey) {
        statsContent.innerHTML = '<p class="text-error">Ingresa tu API key de MongoDB en el formulario de provisionado.</p>';
        return;
      }

      const stats = await publicApi('/admin/stats', {
        method: 'GET',
        headers: { 'X-API-Key': apiKey }
      });
      displayStats(stats);
    } catch (error) {
      statsContent.innerHTML = `<p class="text-error">Error al cargar estadísticas: ${error.message}</p>`;
    }
  };

  const displayStats = (stats) => {
    statsContent.innerHTML = `
      <div class="space-y-2">
        <p><strong>Total de bases de datos:</strong> ${stats.totalDatabases || 0}</p>
        <p><strong>Bases activas:</strong> ${stats.activeDatabases || 0}</p>
        <p><strong>Bases eliminadas:</strong> ${stats.deletedDatabases || 0}</p>
      </div>
      <div class="mt-4 p-3 bg-surface-container-high rounded">
        <h3 class="font-title-sm text-primary mb-2">Por equipo</h3>
        ${(stats.teamStats || []).map(team => `
          <div class="space-y-1">
            <p><strong>${team.team || 'Desconocido'}:</strong></p>
            <p class="ml-4">Activas: ${team.activeDatabases || 0} | Eliminadas: ${team.deletedDatabases || 0} | Total: ${team.totalDatabases || 0}</p>
          </div>
        `).join('')}
      </div>
    `;
  };

  const loadDatabases = async () => {
    try {
      const apiKey = restoreApiKey();
      if (!apiKey) {
        mongodbList.innerHTML = '<p class="text-on-surface-variant">Ingresa tu API key de MongoDB en el formulario de provisionado para ver tus bases de datos.</p>';
        return;
      }

      const databases = await publicApi('/databases', {
        method: 'GET',
        headers: { 'X-API-Key': apiKey }
      });
      renderDatabases(databases);
    } catch (error) {
      mongodbList.innerHTML = `<p class="text-error">Error al cargar bases de datos: ${error.message}</p>`;
    }
  };

  const renderDatabases = (databases) => {
    if (!databases.length) {
      mongodbList.innerHTML = '<p class="glass p-6 rounded-xl text-on-surface-variant">Aún no tienes bases de datos MongoDB. Crea la primera para comenzar.</p>';
      return;
    }

    mongodbList.innerHTML = ''; // Clear loading message

    databases.forEach((database) => {
      const row = document.createElement('article');
      row.className = 'glass p-container-margin rounded-xl';

      const state = database.State || 'active';
      const usage = database.QuotaBytes ? `${(database.QuotaBytes / 1024 / 1024).toFixed(0)} MB limit` : 'Quota unavailable';
      const id = database.DatabaseId || database.id || database._id || '';

      row.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex gap-2 items-center">
              <h3 class="font-title-sm text-primary">${database.DatabaseName || database.database || 'Database'} · MongoDB</h3>
              <span class="text-xs text-on-surface-variant">${state}</span>
            </div>
            <p class="connection font-code-sm text-on-surface-variant">
              ${database.HostName ? `${database.HostName}:${database.Port} · ${database.DatabaseUser}` :
                state === 'deleting' ? 'Eliminando conexión…' : 'Provisioning connection…'}
            </p>
          </div>
          <div class="flex items-end gap-4 md:items-center">
            <div class="text-right">
              <p class="text-xs text-on-surface-variant">Storage</p>
              <p class="font-code-sm">${usage}</p>
            </div>
            ${['active', 'failed'].includes(state) ?
              `<button type="button" data-delete-id="${id}" class="px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/10">Eliminar</button>` : ''}
          </div>
        </div>
      `;

      mongodbList.appendChild(row);
    });

    // Add event listeners to delete buttons
    mongodbList.querySelectorAll('[data-delete-id]').forEach(button => {
      button.addEventListener('click', async (event) => {
        const deleteId = event.target.dataset.deleteId;
        if (!deleteId || !window.confirm('¿Eliminar esta base de datos MongoDB y todos sus datos? Esta acción no se puede deshacer.')) {
          return;
        }

        try {
          const apiKey = restoreApiKey();
          if (!apiKey) {
            throw new Error('Para eliminar una base MongoDB ingresa primero la API key en el formulario de creación.');
          }

          event.target.disabled = true;
          event.target.textContent = 'Eliminando…';

          await publicApi(`/databases/${deleteId}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': apiKey }
          });

          await loadDatabases();
          showMessage('La base de datos fue eliminada y liberó capacidad para crear otra.', 'provision-mongo-message');
        } catch (error) {
          event.target.disabled = false;
          event.target.textContent = 'Eliminar';
          showMessage(error.message, 'provision-mongo-message');
        }
      });
    });
  };

  // Event listeners
  refreshStatsBtn.addEventListener('click', loadStats);
  openProvisionBtn.addEventListener('click', () => provisionDialog.showModal());
  copyCredentialsBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(credentialsContent.textContent);
    showMessage('Credenciales copiadas al portapapeles', 'provision-mongo-message');
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      dialog.close();
      if (dialog === credentialsDialog) {
        credentialsContent.textContent = '';
        clearCredentials();
      }
    });
  });

  document.getElementById('provision-mongo-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formMessage = document.getElementById('provision-mongo-message');
    formMessage.classList.add('hidden');

    try {
      const databaseName = document.getElementById('mongo-db-name').value.trim();
      const apiKey = document.getElementById('mongo-api-key').value.trim();

      if (!apiKey) {
        throw new Error('API key is required to provision a MongoDB database.');
      }

      const result = await publicApi('/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ databaseName })
      });

      saveApiKey(apiKey);
      provisionDialog.close();

      const credentials = `Engine: mongodb\nDatabase: ${result.database || result.databaseName || 'unknown'}\nUsername: ${result.username || 'unknown'}\nPassword: ${result.password || 'unknown'}\nConnection: ${result.connectionString || result.connection || 'N/A'}`;

      saveCredentials(credentials);
      showCredentials(credentials);
      event.target.reset();

      await loadStats();
      await loadDatabases();
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.classList.remove('hidden');
    }
  });

  // Initialize
  setApiKeyInput();
  loadStats();
  loadDatabases();
});