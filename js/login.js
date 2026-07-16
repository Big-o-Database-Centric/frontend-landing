/*
 * BIG O — login.js
 * Behaviour extracted verbatim from the inline <script> at the bottom of
 * big_o_login/code.html, with one addition: after the mock "Authenticated"
 * state, the page now navigates to dashboard.html so the login -> dashboard
 * flow is actually connected (per the requested navigation wiring).
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const icon = input.previousElementSibling.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.classList.add('text-primary-fixed-dim');
                icon.style.transition = 'color 0.3s ease';
            }
        });
        input.addEventListener('blur', () => {
            const icon = input.previousElementSibling.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.classList.remove('text-primary-fixed-dim');
            }
        });
    });

    // Smooth form interaction
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        const btn = form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span> <span class="font-label-xs text-label-xs uppercase tracking-widest">Verifying...</span>`;
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined text-on-primary">check_circle</span> <span class="font-label-xs text-label-xs uppercase tracking-widest">Authenticated</span>`;
            btn.classList.replace('bg-primary-fixed-dim', 'bg-green-500');

            // Navigation: send the (mock) authenticated user to the dashboard.
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        }, 1500);
    });
});
