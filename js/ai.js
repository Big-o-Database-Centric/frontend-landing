const messages = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-message');
  const submit = document.getElementById('ai-submit');
  const transcript = document.getElementById('ai-transcript');
  const progress = document.getElementById('ai-progress');
  const errorRegion = document.getElementById('ai-error');
  const modelLabel = document.getElementById('ai-model');
  const remainingLabel = document.getElementById('ai-remaining');
  const n8nDialog = document.getElementById('n8n-dialog');
  const n8nProgress = document.getElementById('n8n-progress');
  const n8nMessage = document.getElementById('n8n-message');
  const n8nCredentialContainer = document.getElementById('n8n-credential-container');
  const n8nCredentialLink = document.getElementById('n8n-credential-link');
  let dailyLimit = 0;
  let busy = false;
  let conversationVersion = 0;

  const redirectLogin = () => { window.location.href = '/views/login.html'; };

  const api = async (path, options = {}) => {
    const response = await fetch(path, { credentials: 'include', ...options });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      redirectLogin();
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    if (!response.ok) {
      throw Object.assign(new Error(body?.error?.message || body?.message || `${response.status} ${response.statusText}`), {
        status: response.status,
        code: body?.error?.code || body?.code,
      });
    }
    return body;
  };

  const safeError = (status) => ({
    400: 'Revisa el contenido del mensaje.',
    429: 'Alcanzaste el límite de uso de IA.',
    502: 'El servicio de IA no está disponible.',
    503: 'El servicio de IA no está disponible.',
    504: 'El servicio de IA tardó demasiado.',
  }[status] || 'No fue posible consultar la IA. Intenta de nuevo.');

  const clearError = () => {
    errorRegion.textContent = '';
    errorRegion.classList.add('hidden');
  };

  const showError = (text) => {
    errorRegion.textContent = text;
    errorRegion.classList.remove('hidden');
  };

  const updateRemaining = (remaining) => {
    remainingLabel.textContent = `${remaining} de ${dailyLimit} disponibles hoy`;
  };

  const requestHistory = () => {
    const history = [];
    let contentLength = 0;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      const content = typeof message.content === 'string' ? message.content.trim() : '';
      if (!content || content.length > 4000 || history.length === 10 || contentLength + content.length > 12000) break;
      history.unshift({ role: message.role, content });
      contentLength += content.length;
    }
    return history;
  };

  const emptyState = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-empty-state my-auto max-w-md self-center text-center';
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined mb-3 text-3xl text-primary-fixed-dim/70';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'forum';
    const title = document.createElement('p');
    title.className = 'font-title-sm text-on-surface';
    title.textContent = 'Inicia una conversación';
    const copy = document.createElement('p');
    copy.className = 'mt-2 font-body-sm text-on-surface-variant';
    copy.textContent = 'Escribe una pregunta técnica. Tu mensaje y la respuesta solo viven en esta pestaña.';
    wrapper.append(icon, title, copy);
    return wrapper;
  };

  const renderMessage = (message) => {
    transcript.querySelector('.ai-empty-state')?.remove();
    const article = document.createElement('article');
    article.className = `ai-message ai-message-${message.role}`;
    const label = document.createElement('p');
    label.className = 'mb-2 font-label-xs uppercase tracking-[0.16em] text-on-surface-variant';
    label.textContent = message.role === 'assistant' ? 'Big O IA' : 'Tú';
    const content = document.createElement('p');
    content.className = 'whitespace-pre-wrap break-words font-body-sm text-on-surface';
    content.textContent = message.content;
    article.append(label, content);
    transcript.append(article);
    transcript.scrollTop = transcript.scrollHeight;
  };

  const setBusy = (active) => {
    busy = active;
    input.disabled = active;
    submit.disabled = active;
    progress.textContent = active ? 'Generando respuesta…' : '';
    progress.classList.toggle('hidden', !active);
    form.setAttribute('aria-busy', String(active));
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

  const n8nErrorMessage = (error) => {
    const details = `${error.code || ''} ${error.message || ''}`.toLowerCase();
    const accountExists = error.code === 'N8N_ACCOUNT_EXISTS'
      || (error.status === 500 && /(already|exist|ya tiene|cuenta existente)/.test(details) && /(account|cuenta|n8n)/.test(details));
    return accountExists
      ? 'Ya tienes una cuenta N8N.'
      : 'No fue posible provisionar tu cuenta N8N. Intenta de nuevo.';
  };

  const provisionN8n = async () => {
    resetN8nDialog();
    setN8nLoading(true);
    try {
      const result = await api('/api/n8n/provision', { method: 'POST' });
      if (result.credential) {
        n8nCredentialLink.href = result.credential;
        n8nCredentialLink.textContent = result.credential;
        n8nCredentialContainer.classList.remove('hidden');
      } else {
        n8nMessage.textContent = 'No se recibió el enlace de invitación.';
        n8nMessage.classList.remove('hidden');
      }
    } catch (error) {
      if (error.message !== 'Unauthorized') {
        n8nMessage.textContent = n8nErrorMessage(error);
        n8nMessage.classList.remove('hidden');
      }
    } finally {
      setN8nLoading(false);
    }
  };

  const load = async () => {
    try {
      const [profile, capabilities] = await Promise.all([api('/api/me'), api('/api/ai/capabilities')]);
      document.getElementById('user-name').textContent = profile.Name;
      document.getElementById('user-email').textContent = profile.Email;
      modelLabel.textContent = capabilities.defaultModel;
      dailyLimit = capabilities.perUser.perDay;
      updateRemaining(capabilities.remaining.today);
    } catch (error) {
      if (error.status !== 401) showError('No fue posible cargar la capacidad de IA. Recarga la página.');
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    const content = input.value.trim();
    if (!content || content.length > input.maxLength) return;

    clearError();
    const userMessage = { role: 'user', content };
    messages.push(userMessage);
    renderMessage(userMessage);
    input.value = '';
    const submittedVersion = conversationVersion;
    setBusy(true);

    try {
      const result = await api('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestHistory(), maxTokens: 256 }),
      });
      updateRemaining(result.remaining.today);
      if (conversationVersion === submittedVersion) {
        const assistantMessage = { role: 'assistant', content: result.message.content };
        messages.push(assistantMessage);
        renderMessage(assistantMessage);
      }
    } catch (error) {
      if (error.status !== 401 && conversationVersion === submittedVersion) showError(safeError(error.status));
    } finally {
      setBusy(false);
      input.focus();
    }
  });

  document.getElementById('ai-new-conversation').addEventListener('click', () => {
    messages.length = 0;
    conversationVersion += 1;
    transcript.replaceChildren(emptyState());
    input.value = '';
    clearError();
    input.focus();
  });

  document.querySelectorAll('[data-open-n8n-dialog]').forEach((button) => button.addEventListener('click', () => {
    n8nDialog.showModal();
    provisionN8n();
  }));

  document.getElementById('copy-n8n-credential').addEventListener('click', async () => {
    await navigator.clipboard.writeText(n8nCredentialLink.textContent);
  });

  n8nDialog.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
    n8nDialog.close();
    resetN8nDialog();
  }));

  document.querySelectorAll('[data-nav="logout"]').forEach((button) => button.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    redirectLogin();
  }));

  load();
});
