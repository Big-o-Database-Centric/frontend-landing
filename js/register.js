/*
 * BIG O — register.js
 * Behaviour extracted verbatim from the inline <script> at the bottom of
 * big_o_register/code.html, with one addition: submitting the form now
 * navigates to dashboard.html, mirroring the login flow, so the
 * register -> dashboard step is connected.
 */
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.parentElement.querySelector('label').classList.add('text-primary-fixed-dim');
    });
    input.addEventListener('blur', () => {
        input.parentElement.parentElement.querySelector('label').classList.remove('text-primary-fixed-dim');
    });
});

// Subtle parallax effect on the card
const card = document.querySelector('.glass-card');
document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Navigation: after (mock) account creation, continue on to the dashboard.
const registerForm = document.querySelector('form');
if (registerForm) {
    registerForm.addEventListener('submit', () => {
        window.location.href = 'dashboard.html';
    });
}
