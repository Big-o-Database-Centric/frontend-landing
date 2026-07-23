/*
 * BIG O — register.js
 * Flujo de registro de la landing.
 *
 * Estado actual: la creación de cuenta sigue simulada, porque el backend
 * NestJS aún no es alcanzable desde el navegador (falta el reverse proxy
 * /api/ en el VPS). Lo real: la validación de campos y el feedback de los
 * botones OAuth. Cuando el backend esté conectado, el bloque "SIMULACIÓN"
 * se reemplaza por un fetch('/api/auth/register').
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const message = document.getElementById('form-message');

    // Resalta la etiqueta del campo enfocado (comportamiento visual original).
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.parentElement.querySelector('label')?.classList.add('text-primary-fixed-dim');
        });
        input.addEventListener('blur', () => {
            input.parentElement.parentElement.querySelector('label')?.classList.remove('text-primary-fixed-dim');
        });
    });

    // Parallax sutil de la tarjeta.
    const card = document.querySelector('.glass-card');
    if (card) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
    }

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
    function validate(name, email, password) {
        if (!name) return 'Ingresa tu nombre.';
        if (!email) return 'Ingresa tu correo.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no tiene un formato válido.';
        if (!password) return 'Ingresa una contraseña.';
        if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        return null;
    }

    [nameInput, emailInput, passwordInput].forEach(input => {
        input?.addEventListener('input', clearMessage);
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const error = validate(name, email, password);
            if (error) {
                showMessage(error);
                const firstInvalid = !name ? nameInput : !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? emailInput : passwordInput;
                firstInvalid.focus();
                return;
            }

            clearMessage();

            // ----- SIMULACIÓN (reemplazar por fetch('/api/auth/register') cuando el proxy esté listo) -----
            window.location.href = '/views/dashboard.html';
            // ----- FIN SIMULACIÓN -----
        });
    }

    // Los botones OAuth ahora son enlaces (<a href="/api/auth/...">): la
    // navegación al backend la maneja el navegador, sin JS.
});
