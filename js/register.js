document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
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
    [nameInput, emailInput, passwordInput].forEach((input) => input?.addEventListener('input', clearMessage));
    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!name || !email || !password) { showMessage('Completa todos los campos.'); return; }
        if (password.length < 8) { showMessage('La contraseña debe tener al menos 8 caracteres.'); return; }
        const button = form.querySelector('button[type="submit"]');
        const original = button.innerHTML;
        button.disabled = true;
        clearMessage();
        try {
            const response = await fetch('/api/auth/register', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
            const body = await response.json().catch(() => ({}));
            if (!response.ok || !body.Success) throw new Error(body.Message || body.message || 'No se pudo crear la cuenta.');
            window.location.href = '/views/login.html';
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = original;
        }
    });
});
