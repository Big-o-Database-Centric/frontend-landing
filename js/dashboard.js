/*
 * BIG O — dashboard.js
 * Behaviour extracted verbatim from the inline <script> at the bottom of
 * big_o_dashboard/code.html, with one addition: the "Cerrar sesión"
 * (logout) button now navigates back to login.html.
 */

// Micro-interactions for dashboard elements
document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Navigation: logout invalida la sesión en el backend (borra la fila de
// Sessions vía sp_Logout) y luego vuelve al login. Redirige igual aunque la
// red falle, para no dejar al usuario atrapado en el dashboard.
document.querySelectorAll('[data-nav="logout"]').forEach(btn => {
    btn.addEventListener('click', () => {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .catch(() => {})
            .finally(() => { window.location.href = '/views/login.html'; });
    });
});
