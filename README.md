# Quiz Ayudantías — Ingeniería de Software

Aplicación web para crear y realizar quizzes durante ayudantías. Incluye un panel docente para administrar asignaturas y quizzes, una vista de proyección para dirigir sesiones, acceso de estudiantes desde el celular y práctica individual.

## Funciones

- **Docencia:** acceso mediante enlace de un solo uso enviado por correo. Solo las cuentas autorizadas en `teacher_access` pueden administrar su catálogo.
- **Catálogo:** creación de asignaturas y quizzes, edición de preguntas, publicación y archivo. El editor admite selección única o múltiple, verdadero/falso, respuesta corta y ordenamiento.
- **Sesiones en vivo:** el docente inicia una sala y comparte su código o QR. Los estudiantes se unen con un apodo; las preguntas, respuestas y resultados se transmiten por Supabase Realtime.
- **Práctica individual:** quizzes locales de ejemplo y quizzes remotos habilitados para práctica pública.
- **Tarjetas de logro:** al completar un quiz se puede generar y descargar una tarjeta como imagen.
- **Imágenes:** el editor comprime imágenes en el navegador y puede cargarlas a Cloudflare R2 mediante una URL temporal emitida por la API del proyecto.

Las salas y los votos se mantienen en canales Realtime y no se guardan como historial de sesión. El catálogo docente se almacena en Supabase; las imágenes cargadas a R2 usan URLs públicas. Consulta la configuración de estos servicios antes de publicar la aplicación.

## Tecnologías

- React 19 y Vite
- Supabase Auth, Postgres y Realtime
- Cloudflare R2 para imágenes (opcional)
- `qrcode`, `lucide-react`, `three.js` y Web Audio API
- Oxlint

## Requisitos

- Node.js 20.19+ o 22.12+ y npm (requisito de Vite 8)
- Un proyecto Supabase para habilitar acceso docente, catálogo compartido y salas en tiempo real
- (Opcional) Vercel y Cloudflare R2 para la API de carga de imágenes

## Desarrollo local

```bash
npm install
```

Copia `.env.example` a `.env` y configura las variables públicas de Supabase. Sin ellas, la app usa el catálogo de ejemplo integrado para el modo local; las funciones que requieren Supabase no estarán disponibles.

```bash
npm run dev
```

Vite muestra la URL local, normalmente `http://localhost:5173`.

Comandos disponibles:

```bash
npm run dev      # Servidor de desarrollo Vite
npm run lint     # Análisis estático con Oxlint
npm run build    # Compilación de producción en dist/
npm run preview  # Vista local de la compilación
```

## Variables de entorno

Las variables requeridas dependen de las funciones que vayas a usar:

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase para el navegador |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon/publishable de Supabase |
| `VITE_APP_URL` | URL de retorno de autenticación; usa el origen actual si se omite |
| `SUPABASE_URL` | URL de Supabase para la función de carga en Vercel |
| `SUPABASE_ANON_KEY` | Clave pública usada por la función para validar la sesión |
| `R2_ACCOUNT_ID` | Identificador de la cuenta Cloudflare |
| `R2_ACCESS_KEY_ID` | Identificador de la clave de API R2 |
| `R2_SECRET_ACCESS_KEY` | Secreto de la clave de API R2 |
| `R2_BUCKET_NAME` | Bucket destino |
| `R2_PUBLIC_BASE_URL` | Dominio HTTPS público del bucket o dominio personalizado |

Las credenciales de R2 solo se configuran en el entorno servidor de Vercel; nunca deben llevar el prefijo `VITE_`. No uses una clave Supabase `service_role` en el cliente.

## Configuración de Supabase

Ejecuta las migraciones en orden desde el SQL Editor de Supabase:

1. `supabase/migrations/20260920000100_teacher_quiz_catalog.sql` crea el catálogo docente y el control de acceso.
2. `supabase/migrations/20260921000100_subject_seal_logo.sql` agrega el sello opcional por asignatura.
3. `supabase/migrations/20260921000200_public_practice_quizzes.sql` habilita la lectura pública de quizzes autorizados para práctica.

Luego:

1. Desactiva el registro público en Supabase Auth y configura la URL de producción como **Site URL**.
2. Agrega las URL local y de producción a **URL Configuration → Redirect URLs**.
3. Crea o invita la cuenta docente desde Supabase Auth.
4. Autoriza su cuenta en `teacher_access`, reemplazando el correo:

   ```sql
   insert into public.teacher_access (user_id)
   select id from auth.users where lower(email) = lower('profesor@universidad.cl')
   on conflict (user_id) do nothing;
   ```

5. Configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_APP_URL`. En Vercel configura también `SUPABASE_URL` y `SUPABASE_ANON_KEY` para la API. Reinicia Vite después de cambiar variables locales.

La configuración detallada de RLS, Auth y almacenamiento está en [supabase/README.md](supabase/README.md).

## Carga de imágenes con Cloudflare R2

La carga usa la función `api/images/upload-url.js`, disponible como función serverless en Vercel. El servidor verifica el token Supabase y que la cuenta pertenezca a `teacher_access` antes de emitir una URL de carga temporal. El endpoint no se ejecuta con `npm run dev`; para desarrollo local con la API usa `vercel dev`.

Configura las cinco variables `R2_*` de la tabla en Vercel. El bucket debe permitir lectura pública mediante `R2_PUBLIC_BASE_URL` (dominio personalizado recomendado). Configura CORS en R2 para permitir los orígenes local y de producción, los métodos `GET` y `PUT`, y la cabecera `Content-Type`. El tamaño máximo aceptado es 220 KB por imagen WebP. Después de cambiar variables, vuelve a desplegar.

## Despliegue

El proyecto se puede desplegar en Vercel como aplicación Vite. Usa:

- Comando de instalación: `npm install`
- Comando de compilación: `npm run build`
- Directorio de salida: `dist`

Configura las variables de entorno correspondientes a Supabase y, si habilitas carga de imágenes, las variables de R2. La carpeta `api/` contiene la función serverless de Vercel.

## Estructura del proyecto

```text
api/images/                 Función Vercel para preparar cargas a R2
public/assets/              Recursos estáticos e imágenes incluidas
src/components/common/      Controles y componentes compartidos
src/components/quiz/        Componentes de preguntas, tiempo y resultados
src/config/                 Constantes y aviso de privacidad
src/data/                   Quizzes de ejemplo y catálogo local
src/modes/                  Hub, panel docente, proyector, jugador y práctica
src/services/               Integración con Supabase, Realtime y certificados
src/utils/                  Sesiones, URLs, respuestas e imágenes
supabase/migrations/         Esquema y políticas de base de datos
```

## Privacidad y datos

Los estudiantes se unen con un apodo y no necesitan una cuenta. La app conserva información de sesión local para permitir que un jugador vuelva a su sala desde el mismo dispositivo. Los votos y el estado en vivo se transmiten por Realtime; el proyecto no guarda un historial de las salas. Los quizzes del catálogo docente se guardan en Supabase y las imágenes subidas a R2 son accesibles mediante su URL pública. Evita incluir datos personales en apodos, preguntas o imágenes.
