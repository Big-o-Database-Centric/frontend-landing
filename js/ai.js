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
    if (!response.ok) throw Object.assign(new Error('Request failed'), { status: response.status });
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
        body: JSON.stringify({ messages: messages.slice(-10), maxTokens: 256 }),
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

  document.querySelectorAll('[data-nav="logout"]').forEach((button) => button.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    redirectLogin();
  }));

  load();
});
