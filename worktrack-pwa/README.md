# Work Hard · Tracker

App de seguimiento de entrenamiento, alimentación y salud, instalable como app en tu celular (PWA).

## Instalar en tu celular — paso a paso

No necesitas saber programar ni instalar nada en tu computador. Solo necesitas una cuenta gratuita de **GitHub** y una de **Vercel**.

### Paso 1 — Sube estos archivos a GitHub

1. Entra a [github.com](https://github.com) y crea una cuenta gratuita (si no tienes).
2. Haz clic en el botón verde **"New"** (o el ícono **+** arriba a la derecha → **New repository**).
3. Ponle un nombre, por ejemplo `work-hard-tracker`. Déjalo como **Public**. Clic en **Create repository**.
4. En la página del repositorio recién creado, haz clic en **"uploading an existing file"** (o **Add file → Upload files**).
5. Arrastra **toda la carpeta** `worktrack-pwa` completa (o todos sus archivos y carpetas: `src/`, `public/`, `package.json`, `vite.config.js`, `index.html`, `.gitignore`) a la zona de carga. Chrome permite arrastrar carpetas completas.
6. Baja y haz clic en **Commit changes**.

### Paso 2 — Despliega en Vercel (gratis)

1. Entra a [vercel.com](https://vercel.com) y crea una cuenta gratuita usando **"Continue with GitHub"** (así quedan conectadas automáticamente).
2. Haz clic en **"Add New..." → "Project"**.
3. Busca y selecciona el repositorio `work-hard-tracker` que acabas de subir → **Import**.
4. Vercel detecta automáticamente que es un proyecto Vite. No necesitas cambiar nada. Haz clic en **Deploy**.
5. Espera 1-2 minutos. Al terminar te da una URL, algo como `https://work-hard-tracker.vercel.app`.

### Paso 3 — Instálala en tu celular

**Android (Chrome):**
1. Abre la URL que te dio Vercel en Chrome.
2. Aparecerá un aviso **"Agregar Work Hard · Tracker a la pantalla de inicio"**, o desde el menú (⋮) elige **"Instalar app"**.
3. Listo, queda como app con ícono propio.

**iPhone (Safari):**
1. Abre la URL en Safari (tiene que ser Safari, no Chrome, para que funcione la instalación en iOS).
2. Toca el botón de **Compartir** (el cuadrado con flecha hacia arriba).
3. Baja y toca **"Agregar a pantalla de inicio"**.
4. Confirma. Queda instalada como app, con su ícono, y abre en pantalla completa sin la barra del navegador.

### Actualizar la app más adelante

Si le pido a Claude más cambios a la app, solo debes volver a subir los archivos actualizados a GitHub (Paso 1) — Vercel vuelve a desplegar automáticamente en cuanto detecta el cambio, sin que tengas que hacer nada en Vercel.

## Notas técnicas

- Los datos (peso, comidas, mediciones, exámenes) se guardan en el propio celular mediante `localStorage`, es decir quedan solo en ese dispositivo/navegador. Si borras datos de navegación de esa app o cambias de celular, no se transfieren automáticamente.
- Es una PWA: funciona offline una vez cargada, con ícono y pantalla completa como una app nativa, pero no pasa por la App Store / Google Play.
