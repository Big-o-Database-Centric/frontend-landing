# BIG O — Database Manager (UI export de Stitch)

Este proyecto fue exportado originalmente desde Stitch como dos páginas HTML
independientes, cada una con su Tailwind config y JavaScript embebidos
inline. Esta versión reorganiza los mismos dos diseños en una estructura de
archivos más mantenible, **sin modificar el diseño, el HTML visible ni el
comportamiento** de ninguna de las dos pantallas.

## Estructura

```
big_o_database_manager/
├── index.html              → Landing page (antes: big_o_landing_page/code.html)
├── dashboard.html           → Consola / dashboard (antes: big_o_dashboard/code.html)
├── assets/
│   ├── css/
│   │   └── dashboard.css    → Estilos custom del dashboard (.glass, .neon-glow, .pulse-active, keyframes)
│   └── js/
│       ├── tailwind.config.js  → Config de Tailwind (colores, tipografía, spacing) compartida por ambas páginas
│       ├── landing.js          → Interacciones del landing (scroll navbar + parallax de tarjetas)
│       └── dashboard.js        → Interacciones del dashboard (parallax de tarjetas .glass)
├── docs/
│   ├── DESIGN.md             → Documento de sistema de diseño (colores, tipografía, spacing, componentes)
│   ├── screen-landing.png    → Captura de referencia del landing
│   └── screen-dashboard.png  → Captura de referencia del dashboard
└── README.md                 → Este archivo
```

## Qué se movió y por qué

- **Config de Tailwind (`tailwind.config.js`)**: era idéntica, copiada y
  pegada en ambos archivos HTML. Se extrajo a un único archivo compartido
  para eliminar la duplicación. Esto es puramente aditivo (mismos valores,
  mismo efecto) y no altera ningún estilo visual.
- **CSS del dashboard (`assets/css/dashboard.css`)**: es el contenido
  exacto del bloque `<style>` que existía solo en `dashboard.html`
  (reglas `.glass`, `.neon-glow`, `.pulse-active`, la animación
  `@keyframes pulse` y el ajuste de `.material-symbols-outlined`).
- **JavaScript de cada página**: los `<script>` inline al final de cada
  HTML se movieron a `landing.js` y `dashboard.js` respectivamente, sin
  cambiar ni una línea de lógica.
- **Comentarios de sección**: se añadieron encabezados HTML (`<!-- ... -->`)
  para delimitar claramente Navbar / Hero / Features / Stats / CTA / Footer
  en el landing, y Sidebar / Header / Métricas / Lista de DBs / Gráficos /
  Footer / Nav móvil en el dashboard. Estos comentarios ya existían
  parcialmente en el original; se completaron y uniformaron.

## Nota importante sobre fidelidad visual

El `dashboard.css` **solo se enlaza desde `dashboard.html`**, tal como en
el proyecto original. El motivo es que `index.html` (landing) usa en su
markup clases como `.glass-panel`, `.neon-glow` y `.status-pulse`, pero
en el archivo original de Stitch **nunca existió una hoja de estilos que
las definiera** — es decir, esas clases ya eran visualmente inertes en el
diseño original (no producían ningún glow ni efecto). Para no alterar
"absolutamente nada del diseño", esta reorganización preserva ese mismo
comportamiento: si en algún momento se decide que esas clases deberían
tener efecto (por ejemplo, aplicar el mismo glow que usa `.neon-glow` en
el dashboard), habría que decidirlo como un cambio de diseño explícito,
no como parte de esta modularización.

## Cómo previsualizar

Ambos archivos son HTML estático que carga Tailwind vía CDN (Play CDN) y
Google Fonts, por lo que solo necesitas abrirlos con un servidor local
(por rutas relativas a `assets/`), por ejemplo:

```bash
cd big_o_database_manager
python3 -m http.server 8080
# luego abrir http://localhost:8080/index.html y /dashboard.html
```
