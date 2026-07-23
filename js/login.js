/*
 * BIG O — login.js
 * Flujo de inicio de sesión de la landing.
 *
 * Estado actual: la verificación de credenciales sigue siendo simulada
 * (setTimeout), porque el backend NestJS todavía no es alcanzable desde el
 * navegador (falta el reverse proxy /api/ en el VPS). Lo que SÍ es real:
 * la validación de los campos antes de continuar y el feedback de los
 * botones OAuth. Cuando el backend esté conectado, el bloque marcado
 * "SIMULACIÓN" se reemplaza por un fetch('/api/auth/login').
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const message = document.getElementById('form-message');

    // Glow del icono al enfocar cada input (comportamiento visual original).
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            const icon = input.previousElementSibling?.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.classList.add('text-primary-fixed-dim');
                icon.style.transition = 'color 0.3s ease';
            }
        });
        input.addEventListener('blur', () => {
            const icon = input.previousElementSibling?.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.remove('text-primary-fixed-dim');
        });
    });

    // Muestra un mensaje en la zona de estado del formulario.
    function showMessage(text, isError = true) {
        if (!message) return;
        message.textContent = text;
        message.classList.remove('hidden');
        message.classList.toggle('text-red-400', isError);
        message.classList.toggle('text-primary-fixed-dim', !isError);
    }

    function clearMessage() {
        if (!message) return;
        message.textContent = '';
        message.classList.add('hidden');
    }

    // Devuelve el mensaje de error de validación, o null si los datos son válidos.
    function validate(email, password) {
        if (!email && !password) return 'Ingresa tu correo y contraseña.';
        if (!email) return 'Ingresa tu correo.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no tiene un formato válido.';
        if (!password) return 'Ingresa tu contraseña.';
        return null;
    }

    // Limpia el mensaje en cuanto el usuario corrige los campos.
    [emailInput, passwordInput].forEach(input => {
        input?.addEventListener('input', clearMessage);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const error = validate(email, password);
        if (error) {
            showMessage(error);
            (!email ? emailInput : passwordInput).focus();
            return;
        }

        clearMessage();

        // ----- SIMULACIÓN (reemplazar por fetch('/api/auth/login') cuando el proxy esté listo) -----
        const btn = form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span> <span class="font-label-xs text-label-xs uppercase tracking-widest">Verifying...</span>`;
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined text-on-primary">check_circle</span> <span class="font-label-xs text-label-xs uppercase tracking-widest">Authenticated</span>`;
            btn.classList.replace('bg-primary-fixed-dim', 'bg-green-500');
            setTimeout(() => {
                window.location.href = '/views/dashboard.html';
            }, 600);
        }, 1500);
        // ----- FIN SIMULACIÓN -----
    });

    // Los botones OAuth ahora son enlaces (<a href="/api/auth/...">): la
    // navegación al backend la maneja el navegador, sin JS.

    // Muestra el error devuelto por un callback OAuth fallido (?error=...).
    const oauthError = new URLSearchParams(window.location.search).get('error');
    if (oauthError === 'oauth_email_not_verified') {
        showMessage('Tu correo no está verificado con el proveedor. Usa correo y contraseña.');
    } else if (oauthError) {
        showMessage('No se pudo iniciar sesión con el proveedor. Intenta de nuevo.');
    }
});
