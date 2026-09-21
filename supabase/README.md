# Supabase para el catálogo docente

La app usa Supabase Auth por enlace de correo y guarda asignaturas/quizzes en tablas privadas. Los estudiantes siguen entrando mediante código y apodo, sin autenticarse. Si las variables Supabase no están configuradas, la biblioteca se mantiene en `localStorage`.

## Puesta en marcha

1. Ejecuta `migrations/20260920000100_teacher_quiz_catalog.sql` en el SQL Editor del proyecto Supabase.
2. En Auth, desactiva el registro público, establece la URL pública de producción como **Site URL** y agrega las URL de desarrollo y producción a **URL Configuration → Redirect URLs**. La app usa `VITE_APP_URL` como destino de retorno (con `window.location.origin` como fallback).
3. Crea/invita la cuenta del profesor desde el panel de Supabase Auth.
4. Autoriza explícitamente su UUID en el SQL Editor (reemplaza el correo):

   ```sql
   insert into public.teacher_access (user_id)
   select id from auth.users where lower(email) = lower('profesor@universidad.cl')
   on conflict (user_id) do nothing;
   ```

   Confirma que la sentencia insertó una fila. La app solo concede el catálogo a cuentas presentes en `teacher_access`.
5. Configura `.env` desde `.env.example` con Project URL, la clave pública anon/publishable y `VITE_APP_URL` (en producción, la URL de Vercel). No uses nunca `service_role` en el frontend ni en una variable `VITE_*`. En Vercel, define `VITE_APP_URL` en Environment Variables y vuelve a desplegar para que Vite la incorpore al build.
6. Reinicia Vite después de cambiar variables. El primer inicio docente migra el catálogo local existente si la cuenta todavía no tiene asignaturas remotas.

Las políticas RLS y los grants se aplican en la migración: el rol `anon` no obtiene acceso a estas tablas; una cuenta autenticada solo puede leer y escribir sus propias filas si además está habilitada en `teacher_access`.

## Límite actual

La persistencia remota de catálogo ya está conectada. Las salas usan canales Realtime efímeros: el código determina el canal y el host reenvía el estado actual cuando se une un estudiante. No se guarda historial/auditoría de sesiones activas ni votos estudiantiles.
