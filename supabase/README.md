# Supabase para el catálogo docente

La app usa Supabase Auth por enlace de correo y guarda asignaturas/quizzes en tablas privadas. Los estudiantes siguen entrando mediante código y apodo, sin autenticarse. Si las variables Supabase no están configuradas, la biblioteca se mantiene en `localStorage`.

El editor admite selección única/múltiple, verdadero/falso, respuesta corta con variantes aceptadas y ordenamiento. Las imágenes nuevas se reducen en el navegador, se suben a Cloudflare R2 y el quiz guarda su URL pública. Las preguntas antiguas con imágenes Base64 siguen siendo compatibles. Cada quiz también puede guardar su propio título, subtítulo e imagen de tarjeta en los metadatos existentes; esto no requiere otra migración SQL.

## Puesta en marcha

1. Ejecuta `migrations/20260920000100_teacher_quiz_catalog.sql` en el SQL Editor del proyecto Supabase.
2. Para guardar el estampado personalizado por asignatura, ejecuta también `migrations/20260921000100_subject_seal_logo.sql`.
3. En Auth, desactiva el registro público, establece la URL pública de producción como **Site URL** y agrega las URL de desarrollo y producción a **URL Configuration → Redirect URLs**. La app usa `VITE_APP_URL` como destino de retorno (con `window.location.origin` como fallback).
4. Crea/invita la cuenta del profesor desde el panel de Supabase Auth.
5. Autoriza explícitamente su UUID en el SQL Editor (reemplaza el correo):

   ```sql
   insert into public.teacher_access (user_id)
   select id from auth.users where lower(email) = lower('profesor@universidad.cl')
   on conflict (user_id) do nothing;
   ```

   Confirma que la sentencia insertó una fila. La app solo concede el catálogo a cuentas presentes en `teacher_access`.
6. Configura `.env` desde `.env.example` con Project URL, la clave pública anon/publishable y `VITE_APP_URL` (en producción, la URL de Vercel). No uses nunca `service_role` en el frontend ni en una variable `VITE_*`. En Vercel, define `VITE_APP_URL` en Environment Variables y vuelve a desplegar para que Vite la incorpore al build.
7. Reinicia Vite después de cambiar variables. El primer inicio docente migra el catálogo local existente si la cuenta todavía no tiene asignaturas remotas.

## Cloudflare R2 para imágenes

1. Crea un bucket R2 de clase **Standard** y habilita acceso público de lectura usando un dominio personalizado (por ejemplo, `images.tudominio.cl`). Configura ese dominio como `R2_PUBLIC_BASE_URL`; las imágenes de preguntas serán accesibles a cualquier persona que tenga el enlace.
2. Crea un token de API de R2 limitado al bucket, con permiso de lectura/escritura de objetos. En Vercel agrega `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` y `R2_PUBLIC_BASE_URL`. No agregues `VITE_` a estas claves.
3. En Vercel agrega también `SUPABASE_URL` y `SUPABASE_ANON_KEY` con los mismos valores que sus variables `VITE_` correspondientes. La función `/api/images/upload-url` valida el token de sesión y consulta `teacher_access` antes de emitir una URL temporal de carga.
4. En la configuración CORS del bucket permite el origen exacto de producción y el origen local, método `PUT`, y cabecera `Content-Type`. Ejemplo:

   ```json
   [
     {
       "AllowedOrigins": ["https://quiz-ayudantias.vercel.app", "http://localhost:5173"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. Vuelve a desplegar Vercel después de agregar las variables. Para probar también la función API localmente, usa `vercel dev`; el servidor de desarrollo puro de Vite no ejecuta las funciones `/api`.

Los estampados por asignatura y las imágenes de tarjetas se guardan en el mismo bucket, bajo `subjects/<id-del-profesor>/` y `quiz-cards/<id-del-profesor>/`, respectivamente. Si una asignatura no tiene estampado personalizado, se mantiene `/assets/seal_logo.jpg`.

Las políticas RLS y los grants se aplican en la migración: el rol `anon` no obtiene acceso a estas tablas; una cuenta autenticada solo puede leer y escribir sus propias filas si además está habilitada en `teacher_access`.

## Límite actual

La persistencia remota de catálogo ya está conectada. Las salas usan canales Realtime efímeros: el código determina el canal y el host reenvía el estado actual cuando se une un estudiante. No se guarda historial/auditoría de sesiones activas ni votos estudiantiles.
