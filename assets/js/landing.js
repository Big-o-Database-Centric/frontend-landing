/**
 * BIG O — Landing page micro-interactions
 * -----------------------------------------------------------------------
 * Extracted verbatim from the inline <script> at the bottom of
 * "big_o_landing_page/code.html". Behavior is unchanged.
 */

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
