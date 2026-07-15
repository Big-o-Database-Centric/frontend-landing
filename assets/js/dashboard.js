/**
 * BIG O — Dashboard micro-interactions
 * -----------------------------------------------------------------------
 * Extracted verbatim from the inline <script> at the bottom of
 * "big_o_dashboard/code.html". Behavior is unchanged.
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
