# Pulso

Aplicación web privada y local-first para registrar entrenamientos manuales, conservar el historial y recibir recomendaciones prudentes de progresión basadas exclusivamente en los datos registrados.

## Características

- Sesión activa recuperable con autoguardado en IndexedDB.
- Series con carga independiente, repeticiones, RIR, RPE, tipo y estado.
- Biblioteca editable, cardio, WODs, cambio físico, historial y gráficas.
- Volumen, 1RM estimado, récords, estancamientos y coach de progresión explicable.
- Copias completas JSON e informes CSV; sin cuentas, nube ni backend.
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

### 2. Enlazar y subir este proyecto

Abre PowerShell o una terminal dentro de la carpeta del proyecto y ejecuta lo siguiente. Sustituye `TU_USUARIO` y `pulso-training` si elegiste otro nombre:

```bash
git add .
git commit -m "Primera versión de Pulso"
git remote add origin https://github.com/TU_USUARIO/pulso-training.git
git push -u origin main
```

Si utilizas SSH en lugar de HTTPS, el remoto equivalente es:

```bash
git remote add origin git@github.com:TU_USUARIO/pulso-training.git
```

Si `git commit` solicita tu identidad, configúrala una vez y repite el commit:

```bash
git config --global user.name "Tu nombre"
git config --global user.email "tu-email@example.com"
```

### 3. Activar GitHub Pages

1. Abre el repositorio en GitHub.
2. Entra en **Settings**.
3. En el menú lateral, abre **Pages**.
4. En **Build and deployment → Source**, selecciona **GitHub Actions**.
5. No elijas una carpeta ni la opción de desplegar desde una rama: el workflow ya genera y publica `dist/`.

### 4. Comprobar el despliegue

1. Abre la pestaña **Actions** del repositorio.
2. Entra en la ejecución llamada **Publicar en GitHub Pages**.
3. Espera a que los trabajos `build` y `deploy` aparezcan en verde.
4. La URL estará disponible en **Settings → Pages** y tendrá esta forma:

   `https://TU_USUARIO.github.io/pulso-training/`

La primera publicación puede tardar unos minutos. El workflow ejecuta `npm ci`, pruebas, ESLint y el build de producción antes de desplegar. Si cualquiera de esas comprobaciones falla, GitHub no publica una versión defectuosa.

### 5. Publicar futuras actualizaciones

Después de modificar la aplicación:

```bash
npm test
npm run lint
npm run build
git add .
git commit -m "Describe aquí el cambio"
git push
```

Cada `push` a `main` vuelve a publicar automáticamente. También puedes iniciar el workflow manualmente desde **Actions → Publicar en GitHub Pages → Run workflow**.

### Configuración técnica incluida

- Vite usa `base: './'`, compatible con cualquier nombre de repositorio.
- React utiliza `HashRouter`, por lo que actualizar o abrir una ruta interna no provoca errores 404.
- `.github/workflows/deploy.yml` publica únicamente después de superar pruebas, lint y build.
- La aplicación es completamente estática: no necesita secretos, variables de entorno, servidor ni base de datos remota.

## Copias de seguridad

En **Ajustes → Importar y exportar**, pulsa **Descargar copia JSON**. Para restaurarla, selecciona **Importar copia JSON**, revisa la vista previa y elige fusionar o reemplazar. Haz copias periódicas: borrar los datos del navegador elimina la base local.

## Privacidad y límites

Pulso no envía datos a servidores y no incluye autenticación ni sincronización. Por esa misma razón, los datos no aparecen automáticamente en otro dispositivo. Las estimaciones y recomendaciones no son instrucciones médicas y no sustituyen el criterio profesional.

## Licencia

[MIT](LICENSE)
