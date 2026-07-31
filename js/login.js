document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const message = document.getElementById('form-message');
    const showMessage = (text, isError = true) => {
        message.textContent = text;
        message.classList.remove('hidden');
        message.classList.toggle('text-red-400', isError);
        message.classList.toggle('text-primary-fixed-dim', !isError);
    };
    const clearMessage = () => { message.textContent = ''; message.classList.add('hidden'); };
    [emailInput, passwordInput].forEach((input) => input?.addEventListener('input', clearMessage));
    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) { showMessage('Ingresa tu correo y contraseña.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMessage('El correo no tiene un formato válido.'); return; }
        const button = form.querySelector('button[type="submit"]');
        const original = button.innerHTML;
        button.disabled = true;
        clearMessage();
        try {
            const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(body.message || body.error || 'No se pudo iniciar sesión.');
            window.location.href = '/views/dashboard.html';
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = original;
        }
    });
    const oauthError = new URLSearchParams(window.location.search).get('error');
    if (oauthError) showMessage(oauthError === 'oauth_email_not_verified' ? 'Tu correo no está verificado con el proveedor.' : 'No se pudo iniciar sesión con el proveedor.');
});
