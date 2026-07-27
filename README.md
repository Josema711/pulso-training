# Pulso

Aplicación web privada y local-first para registrar entrenamientos manuales, conservar el historial y recibir recomendaciones prudentes de progresión basadas exclusivamente en los datos registrados.

## Características

- Sesión activa recuperable con autoguardado en IndexedDB.
- Series con carga independiente, repeticiones, RIR, RPE, tipo y estado.
- Biblioteca editable, cardio, WODs, cambio físico, historial y gráficas.
- Volumen, 1RM estimado, récords, estancamientos y coach de progresión explicable.
- Copias completas JSON, informes CSV y sincronización privada opcional con Firebase.
- Interfaz responsive en español con temas oscuro, claro y automático.

## Desarrollo local

Requiere Node.js 20.19 o 22.12 en adelante.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local. Los datos se guardan en el perfil del navegador utilizado.

## Calidad y build

```bash
npm test
npm run lint
npm run build
```

El build estático se genera en `dist/`. Vite usa `base: './'` y la aplicación usa `HashRouter`, por lo que funciona tanto en un dominio raíz como en `https://usuario.github.io/nombre-repositorio/` y admite recargas directas sin 404.

## Publicar en GitHub Pages paso a paso

### 1. Crear el repositorio en GitHub

1. Entra en [github.com/new](https://github.com/new).
2. Escribe un nombre, por ejemplo `pulso-training`.
3. Selecciona **Public**. GitHub Pages también admite repositorios privados en determinados planes.
4. No marques **Add a README**, **Add .gitignore** ni **Choose a license**: el proyecto ya contiene esos archivos.
5. Pulsa **Create repository**.

### 2. Subir el proyecto usando solo la web de GitHub

1. Abre el repositorio en GitHub y entra en la pestaña **Code**.
2. Pulsa **Add file → Upload files**.
3. Arrastra desde el Explorador de archivos todo el contenido del proyecto. No subas las carpetas `node_modules`, `dist` ni `.git`.
4. Para conservar las carpetas que empiezan por punto, arrastra la carpeta completa `.github` al recuadro de subida. No uses el selector **choose your files**, porque Windows puede ocultarla.
5. Espera a que termine la lista de archivos, escribe un mensaje en **Commit changes**, elige **Commit directly to the main branch** y confirma.
6. Para una actualización, puedes arrastrar de nuevo la carpeta `src` completa y los archivos raíz modificados. GitHub sustituirá los archivos que tengan la misma ruta.

### 3. Configurar Firebase

1. Abre [Firebase Console](https://console.firebase.google.com/) y selecciona el proyecto `pulso-training`.
2. En **Build → Authentication → Get started → Sign-in method**, abre **Google**, actívalo, elige un correo de asistencia y guarda.
3. En **Authentication → Settings → Authorized domains**, añade `josema711.github.io`. Es imprescindible para que el acceso funcione desde GitHub Pages.
4. En **Build → Firestore Database**, pulsa **Create database**, elige una región cercana y crea la base.
5. En **Firestore Database → Rules**, reemplaza todo el contenido por el del archivo `firestore.rules` de este repositorio y pulsa **Publish**. Subir el archivo a GitHub no publica las reglas automáticamente.
6. Estas reglas aíslan los datos: una cuenta autenticada solo puede acceder a su propia carpeta.

### 4. Activar GitHub Pages

1. Abre el repositorio en GitHub.
2. Entra en **Settings**.
3. En el menú lateral, abre **Pages**.
4. En **Build and deployment → Source**, selecciona **GitHub Actions**.
5. No elijas una carpeta ni la opción de desplegar desde una rama: el workflow ya genera y publica `dist/`.

### 5. Comprobar el despliegue

1. Abre la pestaña **Actions** del repositorio.
2. Entra en la ejecución llamada **Publicar en GitHub Pages**.
3. Espera a que los trabajos `build` y `deploy` aparezcan en verde.
4. La URL estará disponible en **Settings → Pages** y tendrá esta forma:

   `https://TU_USUARIO.github.io/pulso-training/`

La primera publicación puede tardar unos minutos. El workflow ejecuta `npm ci`, pruebas, ESLint y el build de producción antes de desplegar. Si cualquiera de esas comprobaciones falla, GitHub no publica una versión defectuosa.

### 6. Publicar futuras actualizaciones desde GitHub Web

Repite **Code → Add file → Upload files**, arrastra los archivos o carpetas modificados y crea el commit directamente en `main`. Cada commit vuelve a publicar automáticamente. También puedes iniciar el workflow desde **Actions → Publicar en GitHub Pages → Run workflow**.

### Configuración técnica incluida

- Vite usa `base: './'`, compatible con cualquier nombre de repositorio.
- React utiliza `HashRouter`, por lo que actualizar o abrir una ruta interna no provoca errores 404.
- `.github/workflows/deploy.yml` publica únicamente después de superar pruebas, lint y build.
- La configuración pública de Firebase está incluida; no es una contraseña. La privacidad depende de las reglas de Firestore y de la autenticación.

## Copias de seguridad

En **Ajustes**, pulsa **Continuar con Google** para activar la copia automática. Pulso mantiene IndexedDB como caché sin conexión y guarda una copia completa en Firestore. También puedes descargar un JSON manual en **Ajustes → Importar y exportar**; es recomendable conservar alguno periódicamente como segunda protección.

## Privacidad y límites

Pulso solo envía la copia de progreso a Firebase cuando el usuario conecta una cuenta de Google. No incluye analítica ni publicidad. Ningún servicio gratuito puede prometer disponibilidad perpetua, por lo que las copias JSON siguen disponibles. Las estimaciones y recomendaciones no son instrucciones médicas y no sustituyen el criterio profesional.

## Licencia

[MIT](LICENSE)
