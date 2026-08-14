let engines = [];
let maxPerUser = 3;
const DEFAULT_ENGINES = ['mysql', 'postgresql', 'mongodb'];
const MONGO_PROVISION_API_BASE = 'https://mongo.szapatar.dev';

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('database-list');
  const metrics = document.getElementById('engine-metrics');
  const message = document.getElementById('dashboard-message');
  const provisionDialog = document.getElementById('provision-dialog');
  const credentialsDialog = document.getElementById('credentials-dialog');
  const credentialsContent = document.getElementById('credentials-content');
  const engineSelect = document.getElementById('engine');
  const openProvision = document.getElementById('open-provision-dialog');
  const limitMessage = document.getElementById('database-limit');
  const apiKeyInput = document.getElementById('api-key');
  const adminApiKeyInput = document.getElementById('admin-api-key');
  const statsDialog = document.getElementById('stats-dialog');
  const statsContent = document.getElementById('stats-content');
  const n8nDialog = document.getElementById('n8n-dialog');
  const n8nProgress = document.getElementById('n8n-progress');
  const n8nMessage = document.getElementById('n8n-message');
  const n8nCredentialContainer = document.getElementById('n8n-credential-container');
  const n8nCredentialLink = document.getElementById('n8n-credential-link');
  const credentialStorageKey = 'big-o:managed-database-credentials';
  const publicApiKeyStorageKey = 'big-o:mongodb-api-key';
  const adminApiKeyStorageKey = 'big-o:mongodb-admin-api-key';
  const credentialLifetimeMs = 10 * 60 * 1000;

  const showMessage = (text) => { message.textContent = text; message.classList.remove('hidden'); };
  const redirectLogin = () => { window.location.href = '/views/login.html'; };
  const engineName = (engine) => ({ mysql: 'MySQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB', sqlserver: 'SQL Server' }[engine] || engine);
  const syncApiKeyField = () => {
    const isMongoDb = engineSelect.value === 'mongodb';
    apiKeyInput.closest('label').classList.toggle('hidden', !isMongoDb);
    apiKeyInput.disabled = !isMongoDb;
    apiKeyInput.required = isMongoDb;
    document.getElementById('database-name').pattern = isMongoDb
      ? '[a-z][a-z0-9_-]{2,62}'
      : '[a-z][a-z0-9_]{2,62}';

    // Clear API key value and stored key when switching away from MongoDB
    if (!isMongoDb) {
      apiKeyInput.value = '';
      clearPublicApiKey();
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

  const api = async (path, options = {}) => {
    const response = await fetch(path, { credentials: 'include', ...options });
    if (response.status === 401) { redirectLogin(); throw new Error('Unauthorized'); }
    return parseApiResponse(response);
  };

  const publicApi = async (path, options = {}) => {
    const response = await fetch(`${MONGO_PROVISION_API_BASE}${path}`, options);
    return parseApiResponse(response);
  };

  const consumingCapacity = (database) => ['pending', 'active', 'deleting'].includes(database.State || 'active');
  const updateLimit = (databases) => {
    const used = databases.filter(consumingCapacity).length;
    const reached = used >= maxPerUser;
    openProvision.disabled = reached;
    openProvision.setAttribute('aria-disabled', String(reached));
    limitMessage.textContent = reached
      ? `Alcanzaste el máximo de ${maxPerUser} bases de datos activas. Elimina una para crear otra.`
      : `Puedes crear hasta ${maxPerUser} bases de datos activas.`;
    limitMessage.classList.remove('hidden');
    document.getElementById('database-total').textContent = `${used} de ${maxPerUser} bases en uso`;
  };

  const render = (databases) => {
    const totals = Object.fromEntries(engines.map((engine) => [engine, 0]));
    databases.forEach((database) => { if (Object.hasOwn(totals, database.Engine)) totals[database.Engine] += 1; });
    metrics.replaceChildren(...engines.map((engine) => {
      const card = document.createElement('article');
      card.className = 'glass p-stack-md rounded-xl neon-glow flex flex-col gap-2';
      card.innerHTML = `<h3 class="font-title-sm text-primary">${engineName(engine)}</h3><p class="text-2xl text-primary-fixed-dim">${totals[engine]} <span class="text-sm font-normal text-on-surface-variant">Bases de datos</span></p>`;
      return card;
    }));
    updateLimit(databases);
    if (!databases.length) {
      list.innerHTML = '<p class="glass p-6 rounded-xl text-on-surface-variant">Aún no tienes bases de datos. Crea la primera para comenzar.</p>';
      return;
    }
    list.replaceChildren(...databases.map((database) => {
      const row = document.createElement('article');
      row.className = 'glass p-container-margin rounded-xl';
      const state = database.State || 'active';
      const usage = database.QuotaBytes ? `${(database.QuotaBytes / 1024 / 1024).toFixed(0)} MB limit` : 'Quota unavailable';
      const id = database.DatabaseId || database.id || database._id || '';
      const engine = database.Engine || database.engine || 'mongodb';
      const canDelete = ['active', 'failed'].includes(state);
      const canRotate = engine === 'mongodb' && state === 'active';
      row.innerHTML = `<div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div class="flex gap-2 items-center"><h3 class="font-title-sm text-primary"></h3><span class="text-xs text-on-surface-variant">${state}</span></div><p class="connection font-code-sm text-on-surface-variant"></p></div><div class="flex items-end gap-4 md:items-center"><div class="text-right"><p class="text-xs text-on-surface-variant">Storage</p><p class="font-code-sm">${usage}</p></div>${canDelete ? `<button type="button" data-delete-id="${id}" data-engine="${engine}" class="px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/10">Eliminar</button>` : ''}${canRotate ? `<button type="button" data-rotate-id="${id}" data-engine="${engine}" class="px-3 py-2 rounded-lg text-sm text-primary-fixed-dim hover:bg-primary-container/10">Rotar credenciales</button>` : ''}</div></div>`;
      row.querySelector('h3').textContent = `${database.DatabaseName || database.database || 'Database'} · ${engineName(engine)}`;
      row.querySelector('.connection').textContent = database.HostName ? `${database.HostName}:${database.Port} · ${database.DatabaseUser}` : state === 'deleting' ? 'Eliminando conexión…' : 'Provisioning connection…';
      return row;
    }));
  };

  const renderEngineOptions = () => {
    engineSelect.replaceChildren(...engines.map((engine) => {
      const option = document.createElement('option');
      option.value = engine;
      option.textContent = engineName(engine);
      return option;
    }));
    syncApiKeyField();
  };

  const formatCredentials = (result) => {
    const database = result.database || result.databaseName || 'unknown';
    const username = result.username || 'unknown';
    const password = result.password || 'unknown';
    const connectionString = result.connectionString || result.connection || 'N/A';
    const engine = result.engine || 'mongodb';
    return `Engine: ${engine}\nDatabase: ${database}\nUsername: ${username}\nPassword: ${password}\nConnection: ${connectionString}`;
  };
  const clearCredentials = () => sessionStorage.removeItem(credentialStorageKey);
  const clearPublicApiKey = () => sessionStorage.removeItem(publicApiKeyStorageKey);
  const restorePublicApiKey = () => sessionStorage.getItem(publicApiKeyStorageKey) || '';
  const savePublicApiKey = (key) => sessionStorage.setItem(publicApiKeyStorageKey, key);
  const setPublicApiKeyInput = () => {
    if (apiKeyInput) apiKeyInput.value = restorePublicApiKey();
  };
  const showCredentials = (content) => {
    credentialsContent.textContent = content;
    if (!credentialsDialog.open) credentialsDialog.showModal();
  };
  const saveCredentials = (content) => {
    sessionStorage.setItem(credentialStorageKey, JSON.stringify({ content, expiresAt: Date.now() + credentialLifetimeMs }));
  };
  const restoreCredentials = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(credentialStorageKey) || 'null');
      if (!saved || !saved.content || saved.expiresAt < Date.now()) { clearCredentials(); return; }
      showCredentials(saved.content);
    } catch { clearCredentials(); }
  };
  const clearAdminApiKey = () => sessionStorage.removeItem(adminApiKeyStorageKey);
  const restoreAdminApiKey = () => sessionStorage.getItem(adminApiKeyStorageKey) || '';
  const saveAdminApiKey = (key) => sessionStorage.setItem(adminApiKeyStorageKey, key);
  const setAdminApiKeyInput = () => {
    if (adminApiKeyInput) adminApiKeyInput.value = restoreAdminApiKey();
  };
  const loadStats = async () => {
    try {
      const apiKey = restoreAdminApiKey();
      if (!apiKey) {
        statsContent.innerHTML = '<p class="text-error">Ingresa tu API key de administrador en el campo correspondiente.</p>';
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

  const resetN8nDialog = () => {
    n8nProgress.classList.add('hidden');
    n8nProgress.textContent = '';
    n8nMessage.classList.add('hidden');
    n8nMessage.textContent = '';
    n8nCredentialContainer.classList.add('hidden');
    n8nCredentialLink.href = '#';
    n8nCredentialLink.textContent = '';
  };

  const setN8nLoading = (active) => {
    n8nProgress.classList.toggle('hidden', !active);
    n8nProgress.textContent = active ? 'Provisionando cuenta N8N…' : '';
  };

  const showN8nError = (text) => {
    n8nMessage.textContent = text;
    n8nMessage.classList.remove('hidden');
  };

  const showN8nCredential = (credentialUrl) => {
    n8nCredentialLink.href = credentialUrl;
    n8nCredentialLink.textContent = credentialUrl;
    n8nCredentialContainer.classList.remove('hidden');
  };

  const provisionN8n = async () => {
    resetN8nDialog();
    setN8nLoading(true);
    try {
      const result = await api('/api/n8n/provision', { method: 'POST' });
      if (result.credential) {
        showN8nCredential(result.credential);
      } else {
        showN8nError('No se recibió el enlace de invitación.');
      }
    } catch (error) {
      if (error.message !== 'Unauthorized') showN8nError(error.message);
    } finally {
      setN8nLoading(false);
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
  const setProvisioning = (active) => {
    const submit = document.getElementById('provision-submit');
    const name = document.getElementById('database-name');
    const progress = document.getElementById('provision-progress');
    submit.disabled = active;
    engineSelect.disabled = active;
    name.disabled = active;
    progress.textContent = active ? `Creando ${engineName(engineSelect.value)}… Esto puede tardar unos segundos; puedes esperar en esta pantalla.` : '';
    progress.classList.toggle('hidden', !active);
    provisionDialog.setAttribute('aria-busy', String(active));
  };

  const load = async () => {
    try {
      const [user, databases, capabilities] = await Promise.all([api('/api/me'), api('/api/managed-databases'), api('/api/managed-databases/capabilities')]);
      document.getElementById('user-name').textContent = user.Name;
      document.getElementById('user-email').textContent = user.Email;
      engines = capabilities.engines && capabilities.engines.length > 0 ? capabilities.engines : DEFAULT_ENGINES;
      maxPerUser = capabilities.maxPerUser || 3;
      renderEngineOptions();
      render(databases);
      restoreCredentials();
      setPublicApiKeyInput();
    } catch (error) { if (error.message !== 'Unauthorized') showMessage(error.message); }
  };

  openProvision.addEventListener('click', () => provisionDialog.showModal());
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
    const dialog = button.closest('dialog');
    dialog.close();
    if (dialog === credentialsDialog) { credentialsContent.textContent = ''; clearCredentials(); }
  }));
  engineSelect.addEventListener('change', syncApiKeyField);
  // Initialize API key field visibility based on selected engine
  syncApiKeyField();
  document.getElementById('provision-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formMessage = document.getElementById('provision-message');
    setProvisioning(true);
    formMessage.classList.add('hidden');
    try {
      const databaseName = document.getElementById('database-name').value.trim();
      const apiKey = document.getElementById('api-key').value.trim();
      let result;

      if (engineSelect.value === 'mongodb') {
        if (!apiKey) throw new Error('API key is required to provision a MongoDB database.');
        result = await publicApi('/databases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
          body: JSON.stringify({ databaseName })
        });
        savePublicApiKey(apiKey);
      } else {
        result = await api('/api/managed-databases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ engine: engineSelect.value, databaseName })
        });
      }

      const credentials = formatCredentials(result);
      saveCredentials(credentials);
      provisionDialog.close();
      showCredentials(credentials);
      event.target.reset();
      await load();
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.classList.remove('hidden');
    } finally { setProvisioning(false); }
  });
  list.addEventListener('click', async (event) => {
    // Handle delete button
    const deleteButton = event.target.closest('[data-delete-id]');
    if (deleteButton) {
      if (!deleteButton || !window.confirm('¿Eliminar esta base de datos y todos sus datos? Esta acción no se puede deshacer.')) return;
      const engine = deleteButton.dataset.engine;
      const deleteId = deleteButton.dataset.deleteId;
      deleteButton.disabled = true;
      deleteButton.textContent = 'Eliminando…';
      try {
        if (engine === 'mongodb') {
          const apiKey = restorePublicApiKey();
          if (!apiKey) throw new Error('Para eliminar una base MongoDB ingresa primero la API key en el formulario de creación.');
          await publicApi(`/databases/${deleteId}`, { method: 'DELETE', headers: { 'X-API-Key': apiKey } });
        } else {
          await api(`/api/managed-databases/${deleteId}`, { method: 'DELETE' });
        }
        await load();
        showMessage('La base de datos fue eliminada y liberó capacidad para crear otra.');
      } catch (error) {
        deleteButton.disabled = false;
        deleteButton.textContent = 'Eliminar';
        showMessage(error.message);
      }
      return;
    }

    // Handle rotate credentials button
    const rotateButton = event.target.closest('[data-rotate-id]');
    if (rotateButton) {
      if (!rotateButton) return;
      const engine = rotateButton.dataset.engine;
      const rotateId = rotateButton.dataset.rotateId;
      rotateButton.disabled = true;
      rotateButton.textContent = 'Rotando…';
      try {
        if (engine === 'mongodb') {
          const apiKey = restorePublicApiKey();
          if (!apiKey) throw new Error('Para rotar credenciales de una base MongoDB ingresa primero la API key en el formulario de creación.');
          const result = await publicApi(`/databases/${rotateId}/credentials/reset`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey }
          });
          const credentials = formatCredentials(result);
          saveCredentials(credentials);
          showCredentials(credentials);
        } else {
          throw new Error('La rotación de credenciales solo está disponible para bases de datos MongoDB.');
        }
      } catch (error) {
        rotateButton.disabled = false;
        rotateButton.textContent = 'Rotar credenciales';
        showMessage(error.message);
      } finally {
        rotateButton.disabled = false;
        rotateButton.textContent = 'Rotar credenciales';
      }
      return;
    }
  });
  document.getElementById('copy-credentials').addEventListener('click', async () => { await navigator.clipboard.writeText(credentialsContent.textContent); });
  const openStatsBtn = document.getElementById('open-stats-dialog');
  if (openStatsBtn) {
    openStatsBtn.addEventListener('click', async () => {
      statsDialog.showModal();
      await loadStats();
    });
  }

  const openN8nBtn = document.getElementById('open-n8n-dialog');
  if (openN8nBtn) {
    openN8nBtn.addEventListener('click', () => {
      n8nDialog.showModal();
      provisionN8n();
    });
  }

  document.getElementById('copy-n8n-credential')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(n8nCredentialLink.textContent);
  });
  document.getElementById('admin-api-key').addEventListener('change', (e) => {
    const apiKey = e.target.value.trim();
    if (apiKey) {
      saveAdminApiKey(apiKey);
    } else {
      clearAdminApiKey();
    }
  });
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      dialog.close();
      if (dialog === credentialsDialog) {
        credentialsContent.textContent = '';
        clearCredentials();
      } else if (dialog === statsDialog) {
        statsContent.innerHTML = '<p class="text-on-surface-variant">Cargando...</p>';
      } else if (dialog === n8nDialog) {
        resetN8nDialog();
      }
    });
  });
  document.querySelectorAll('[data-nav="logout"]').forEach((button) => button.addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined); redirectLogin(); }));
  // Initialize admin API key input on load
  setAdminApiKeyInput();
  load();
});
