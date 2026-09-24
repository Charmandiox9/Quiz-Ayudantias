# Findings & Decisions

## Requirements
- El profesor puede crear varias asignaturas y organizar varios quizzes dentro de cada una.
- Puede crear quizzes, publicarlos y luego ejecutarlos.
- La ejecución debe conservar los modos actuales: host/proyector, práctica individual y participación desde celular.
- Debe ampliarse el modelo de pregunta/respuesta más allá de alternativas de selección única.
- Los estudiantes pueden seguir entrando con alias y código de sala.

## Research Findings
- `src/data/index.js` mantiene un catálogo estático de ayudantías JavaScript; cada módulo guarda metadatos y `questions` con `{id, topic, q, opts, ans, exp}`.
- `src/modes/HubScreen.jsx` mezcla selección de ayudantía, comienzo del host y comienzo de práctica en la pantalla principal.
- `src/App.jsx` mantiene el enrutamiento superior entre Hub/Host/Player/Solo/FastJoin y restaura sesiones de estudiante por código.
- `HostScreen.jsx`, `PlayerScreen.jsx` y `SoloScreen.jsx` reciben directamente un objeto de ayudantía. `QuestionCard.jsx` muestra alternativas y recibe un índice seleccionado.
- `RealtimeQuizService` transmite eventos `player:vote` y estados del juego por sala; el voto actual se representa como etiqueta/opción.
- El estudiante no renderiza el enunciado; recibe el índice total/estado del host y vota A–D, así que el host actual sigue controlando el contenido del quiz.
- `HostScreen` calcula puntaje comparando la etiqueta votada con `OPTION_LABELS[currentQuestion.ans]`; este cálculo y `QuestionCard` serán los puntos de cambio al incorporar respuesta genérica.
- La URL rápida `?join=CODIGO` resuelve hoy códigos contra el catálogo estático. Quizzes propios compartidos con estudiantes necesitan resolución de sesión desde Supabase o un mensaje inicial de sesión que permita asociar la sala a un quiz.
- `session.js` usa `sessionStorage` para el alias/ID y encaja con conservar la sesión del estudiante como efímera.
- La primera rebanada usó `localStorage`; posteriormente se agregó un adaptador Supabase privado para compartir el catálogo entre dispositivos cuando se configura Auth/RLS.
- Cada inicio de host recibe un código aleatorio para evitar que dos sesiones simultáneas del mismo quiz usen el mismo canal. El alumno aún resuelve metadatos desde el catálogo heredado; la fase Supabase debe asociar el código a una sesión publicada.
- Supabase solo está inicializado con una clave anon opcional; no existe inicio de sesión docente ni tablas para cursos/quizzes. `schema_card_downloads.sql` es únicamente persistencia de certificados.
- El almacenamiento local ya se usa para sesión/dispositivo y es un patrón disponible, pero no permite que el profesor administre su contenido desde otro dispositivo.
- Los quizzes nuevos guardan cada pregunta con `type` (`single_choice`, `true_false`, `multiple_select`); las respuestas correctas se guardan como índice o lista de índices respectivamente.
- El protocolo en vivo mantiene compatibilidad con `optionLabel` y añade `answer` (índice o lista), además de publicar al jugador el tipo y los textos de alternativas.
- La selección múltiple usa calificación exacta (todas las correctas y ninguna incorrecta) y suma puntos completos; no ofrece puntaje parcial todavía.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Entidades del dominio: Asignatura → Quiz → Pregunta; Sesión referencia versión publicada | Hace explícitos el catálogo docente y la ejecución temporal. |
| Catálogo existente se transforma en quizzes sembrados | Evita perder Ayudantía 2 y 3 al introducir el nuevo flujo. |
| La UI y los modos consumirán una estructura canónica Quiz; `ayudantia` podrá adaptarse de forma transitoria | Reduce el tamaño de una migración de golpe y concentra compatibilidad. |
| El almacenamiento local es solo adaptador inicial; la distribución entre dispositivos exige Supabase Auth, tablas y RLS | No se debe permitir CRUD compartido mediante la clave anon sin identidad/autorización de profesor. |
| En el primer incremento se implementa biblioteca y creación de quizzes compatibles con selección única; multitype se agrega verticalmente después | El host/celular/práctica dependen hoy de respuesta por índice y hay que evolucionarlos coordinadamente. |
| El acceso docente inicial es por enlace de correo y requiere una fila explícita en `teacher_access` | Separa identidad autenticada de autorización al catálogo. |
| El rol `anon` no tiene grants para las tablas del catálogo | El catálogo y la pauta son contenido privado del profesor. |

## Issues
| Issue | Resolution |
|-------|------------|
| El proyecto Supabase del usuario aún debe configurarse y autorizar la cuenta docente | Se añadieron la migración e instrucciones; falta ejecutarlas en el backend real del propietario. |
| No existe `node_modules` en el checkout | No se ejecutaron lint/build ni se instalaron dependencias; volver a validar cuando el entorno tenga dependencias disponibles. |

## Phase 4 Findings
- Supabase Auth es opcional para desarrollo local. Con URL y clave pública configuradas, el Hub solicita magic link y habilita el catálogo solo si el UUID autenticado está en `teacher_access`.
- `teacherCatalogService.js` guarda preguntas y pauta en filas protegidas por RLS; `anon` no recibe grants para estas tablas.
- El primer acceso remoto sin asignaturas migra el catálogo local existente. El guardado actual hace upsert y no incluye borrado.
- El catálogo docente remoto ya está conectado; las salas usan canales Realtime efímeros, sin registro/auditoría persistente, aunque el host reenvía el estado actual cuando llega un estudiante.

## Resources
- `src/App.jsx`
- `src/modes/HubScreen.jsx`
- `src/modes/HostScreen.jsx`
- `src/modes/PlayerScreen.jsx`
- `src/modes/SoloScreen.jsx`
- `src/components/quiz/QuestionCard.jsx`
- `src/services/realtimeService.js`
- `src/data/index.js`
- `supabase/schema_card_downloads.sql`
