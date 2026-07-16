// Micro-interaction: Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('py-stack-sm', 'bg-surface/95');
        nav.classList.remove('py-stack-md', 'bg-surface/80');
    } else {
        nav.classList.add('py-stack-md', 'bg-surface/80');
        nav.classList.remove('py-stack-sm', 'bg-surface/95');
    }
});

// Micro-interaction: Card parallax-ish movement on mousemove
document.querySelectorAll('.glass-panel').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Navigation: route primary calls-to-action to the registration/login flow.
// Delegación de eventos + preventDefault para garantizar la navegación
// aunque el script se cargue en cualquier orden.
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-nav]');
    if (!target) return;
    e.preventDefault();
    const nav = target.getAttribute('data-nav');
    if (nav === 'register') {
        window.location.href = '/views/register.html';
    } else if (nav === 'login') {
        window.location.href = '/views/login.html';
    }
});
