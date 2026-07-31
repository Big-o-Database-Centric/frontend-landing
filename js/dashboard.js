const engines = ['mysql', 'postgresql', 'sqlserver', 'mongodb'];

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('database-list');
  const metrics = document.getElementById('engine-metrics');
  const message = document.getElementById('dashboard-message');
  const provisionDialog = document.getElementById('provision-dialog');
  const credentialsDialog = document.getElementById('credentials-dialog');
  const credentialsContent = document.getElementById('credentials-content');

  const showMessage = (text) => { message.textContent = text; message.classList.remove('hidden'); };
  const redirectLogin = () => { window.location.href = '/views/login.html'; };
  const api = async (path, options = {}) => {
    const response = await fetch(path, { credentials: 'include', ...options });
    if (response.status === 401) { redirectLogin(); throw new Error('Unauthorized'); }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || body.error || 'Request failed');
    return body;
  };

  const render = (databases) => {
    const totals = Object.fromEntries(engines.map((engine) => [engine, 0]));
    databases.forEach((database) => { if (Object.hasOwn(totals, database.Engine)) totals[database.Engine] += 1; });
    metrics.replaceChildren(...engines.map((engine) => {
      const card = document.createElement('article');
      card.className = 'glass p-stack-md rounded-xl neon-glow flex flex-col gap-2';
      card.innerHTML = `<h3 class="font-title-sm text-primary">${engine === 'sqlserver' ? 'SQL Server' : engine[0].toUpperCase() + engine.slice(1)}</h3><p class="text-2xl text-primary-fixed-dim">${totals[engine]} <span class="text-sm font-normal text-on-surface-variant">Bases de datos</span></p>`;
      return card;
    }));
    document.getElementById('database-total').textContent = `${databases.length} total`;
    if (!databases.length) { list.innerHTML = '<p class="glass p-6 rounded-xl text-on-surface-variant">No databases yet. Provision your first database to begin.</p>'; return; }
    list.replaceChildren(...databases.map((database) => {
      const row = document.createElement('article');
      row.className = 'glass p-container-margin rounded-xl';
      const state = database.State || 'active';
      const usage = database.QuotaBytes ? `${(database.QuotaBytes / 1024 / 1024).toFixed(0)} MB limit` : 'Quota unavailable';
      row.innerHTML = `<div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div class="flex gap-2 items-center"><h3 class="font-title-sm text-primary"></h3><span class="text-xs text-on-surface-variant">${state}</span></div><p class="font-code-sm text-on-surface-variant"></p></div><div class="text-right"><p class="text-xs text-on-surface-variant">Storage</p><p class="font-code-sm">${usage}</p></div></div>`;
      row.querySelector('h3').textContent = `${database.DatabaseName} · ${database.Engine}`;
      row.querySelector('.font-code-sm.text-on-surface-variant').textContent = database.HostName ? `${database.HostName}:${database.Port} · ${database.DatabaseUser}` : 'Provisioning connection…';
      return row;
    }));
  };

  const load = async () => {
    try {
      const [user, databases] = await Promise.all([api('/api/me'), api('/api/managed-databases')]);
      document.getElementById('user-name').textContent = user.Name;
      document.getElementById('user-email').textContent = user.Email;
      render(databases);
    } catch (error) { if (error.message !== 'Unauthorized') showMessage(error.message); }
  };

  document.getElementById('open-provision-dialog').addEventListener('click', () => provisionDialog.showModal());
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
    button.closest('dialog').close();
    if (button.closest('dialog') === credentialsDialog) credentialsContent.textContent = '';
  }));
  document.getElementById('provision-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = document.getElementById('provision-submit');
    const formMessage = document.getElementById('provision-message');
    submit.disabled = true; formMessage.classList.add('hidden');
    try {
      const result = await api('/api/managed-databases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ engine: document.getElementById('engine').value, databaseName: document.getElementById('database-name').value.trim() }) });
      credentialsContent.textContent = `Engine: ${result.engine}\nHost: ${result.host}\nPort: ${result.port}\nDatabase: ${result.databaseName}\nUsername: ${result.username}\nPassword: ${result.password}`;
      provisionDialog.close(); credentialsDialog.showModal(); event.target.reset(); await load();
    } catch (error) { formMessage.textContent = error.message; formMessage.classList.remove('hidden'); }
    finally { submit.disabled = false; }
  });
  document.getElementById('copy-credentials').addEventListener('click', async () => { await navigator.clipboard.writeText(credentialsContent.textContent); });
  document.querySelectorAll('[data-nav="logout"]').forEach((button) => button.addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined); redirectLogin(); }));
  load();
});
