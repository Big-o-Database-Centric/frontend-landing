# BIG O — Database Manager (modularizado)

Proyecto original exportado como 4 páginas HTML independientes (`code.html`
por carpeta), cada una con su propio Tailwind config y estilos embebidos
repetidos. Este paquete conserva exactamente el mismo diseño, estructura y
clases HTML/Tailwind, pero organiza el CSS/JS en archivos compartidos y
conecta la navegación entre pantallas.

## Estructura

```
big_o_database_manager/
├── index.html          Landing page (antes: big_o_landing_page/code.html)
├── login.html           Login       (antes: big_o_login/code.html)
├── register.html         Registro    (antes: big_o_register/code.html)
├── dashboard.html        Consola     (antes: big_o_dashboard/code.html)
├── css/
│   ├── base.css          Reset + tipografía base (antes embebido solo en dashboard)
│   └── components.css    Glassmorphism, glow, pulsos — compartido por las 4 páginas
├── js/
│   ├── tailwind-config.js  Config Tailwind única (antes duplicada 4 veces)
│   ├── landing.js
│   ├── login.js
│   ├── register.js
│   └── dashboard.js
└── docs/
    └── DESIGN.md          Sistema de diseño original (colores, tipografía, etc.)
```

## Qué se modularizó

- **Tailwind config**: las 4 páginas tenían el mismo objeto de configuración
  (colores, spacing, tipografía) copiado y pegado, con pequeñas diferencias
  de claves faltantes entre ellas. Ahora vive en un solo archivo
  `js/tailwind-config.js` (unión de las 4 versiones, ningún token se pierde).
- **CSS**: el `<style>` embebido (que solo existía en `big_o_dashboard`) se
  movió a `css/base.css`. Las clases de vidrio/neón (`glass`, `glass-panel`,
  `glass-card`, `neon-glow`, `cyan-glow`, `btn-hover-glow`, `status-pulse`,
  `pulse-active`, `animate-pulse-cyan`) —que las otras 3 páginas ya usaban
  en su HTML pero cuya definición faltaba en el export original— se
  consolidaron en `css/components.css` con los mismos valores que ya usaba
  el dashboard, para que las 4 pantallas se vean consistentes con sus
  capturas de referencia (`screen.png`) sin tocar ninguna clase ni marcado.
- **JavaScript**: cada `<script>` embebido al final de página se movió a su
  propio archivo en `js/`, con el mismo comportamiento exacto que tenía.

## Navegación conectada

- **index.html**: "Login" → `login.html`; "Sign Up", "Deploy Console" y
  "Get Started Free" → `register.html`.
- **login.html**: logo "BIG O" → `index.html`; "Create local account" →
  `register.html`; al enviar el formulario (simulado), redirige a
  `dashboard.html`.
- **register.html**: logo "BIG O" → `index.html`; "Log in" → `login.html`;
  al enviar el formulario (simulado), redirige a `dashboard.html`.
- **dashboard.html**: logo "BIG O" → `index.html`; botón "Cerrar sesión" →
  `login.html`.

Enlaces sin página equivalente en este proyecto (Features, Pricing, Docs,
Forgot password, Terms, Privacy, Status, etc.) se dejaron como `href="#"`,
igual que en el original, ya que no existe una pantalla a la cual apuntar.

## Chat de IA administrada

El chat se encuentra en `/views/ai.html` y requiere una sesión vigente de Big O:

1. Iniciar sesión y abrir la opción **IA** desde el dashboard (o navegar a
   `/views/ai.html`). Si la sesión expiró, la página vuelve al login.
2. Comprobar el modelo y el indicador «N de M disponibles hoy».
3. Escribir un mensaje de hasta 4.000 caracteres y pulsar **Enviar**. Mientras espera, el
   formulario muestra «Generando respuesta…» y bloquea envíos duplicados.
4. Pulsar **Nueva conversación** para eliminar el transcript y el contexto local. Recargar
   también lo elimina; no se guarda en `localStorage` ni `sessionStorage`.

Big O administra centralmente la credencial de PolyService. Los usuarios registrados nunca
la configuran ni la reciben. El navegador llama exclusivamente a
`/api/ai/capabilities` y `/api/ai/chat` con la cookie httpOnly de Big O; jamás llama al
proveedor directamente.

Mensajes seguros esperados:

| Situación | Mensaje visible |
|---|---|
| Contenido inválido (`400`) | `Revisa el contenido del mensaje.` |
| Cuota agotada (`429`) | `Alcanzaste el límite de uso de IA.` |
| Proveedor no disponible (`502` o `503`) | `El servicio de IA no está disponible.` |
| Tiempo de espera (`504`) | `El servicio de IA tardó demasiado.` |
| Otro error | `No fue posible consultar la IA. Intenta de nuevo.` |

El detalle del contrato HTTP está en [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md).

### Verificación local

```powershell
npm.cmd run build:css
npx.cmd playwright test
```

## Nota importante

Ninguna clase de Tailwind, estructura HTML, texto ni imagen fue modificada.
Los únicos cambios de comportamiento son la extracción de CSS/JS a archivos
externos, la definición de las clases de vidrio/glow que faltaban (para que
coincidan con el diseño mostrado en los `screen.png` originales), y el
cableado de navegación solicitado.
