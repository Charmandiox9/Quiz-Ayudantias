# Progress Log

## Session: 2026-09-20

### Follow-up: guardar sistema visual
- **Status:** complete
- Actions taken:
  - Documenté la dirección visual, jerarquía, paleta, distribución, controles e interacciones del panel para reutilizarlos al ampliar la biblioteca.
- Files created/modified:
  - `.interface-design/system.md`

### Phase 1: Descubrimiento y modelo
- **Status:** complete
- Actions taken:
  - Revisé el catálogo, el enrutamiento, los tres modos de ejecución, el servicio realtime y el estado actual de Supabase.
  - Definí el modelo Asignatura → Quiz → Pregunta y la necesidad de una versión fija por sesión.
  - Registré la decisión de iniciar con adaptador local y reservar sincronización multiusuario para Supabase Auth/RLS.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 2: Biblioteca docente y selección de quiz
- **Status:** complete
- Actions taken:
  - Añadí `quizCatalog.js`, con catálogo inicial derivado de las ayudantías existentes y persistencia local versionada.
  - Reemplacé el Hub directo por biblioteca de asignaturas, selector de quizzes, formularios para crear asignaturas/quizzes (varias preguntas), publicar y lanzar host/práctica.
  - Conservé el acceso manual a sala y el acceso rápido QR mediante los callbacks existentes.
- Files created/modified:
  - `src/data/quizCatalog.js`
  - `src/modes/HubScreen.jsx`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 3: Modelo de preguntas y ejecución
- **Status:** complete
- Actions taken:
  - Añadí selección única, verdadero/falso y selección múltiple al editor.
  - Reutilicé un evaluador común en práctica y host; extendí la respuesta realtime para índices o listas de índices y conservé compatibilidad con la etiqueta heredada.
  - Extendí la interfaz de celular para mostrar textos de verdadero/falso y confirmar respuestas de selección múltiple.
  - Extendí la tarjeta de pregunta, la visualización de respuestas correctas y el carrusel de errores para respuestas con varios índices.
- Files created/modified:
  - `src/utils/answers.js`
  - `src/data/quizCatalog.js`
  - `src/modes/HubScreen.jsx`
  - `src/modes/HostScreen.jsx`
  - `src/modes/PlayerScreen.jsx`
  - `src/modes/SoloScreen.jsx`
  - `src/components/quiz/QuestionCard.jsx`
  - `src/components/quiz/VoteBars.jsx`
  - `src/components/quiz/MistakesCarousel.jsx`

### Phase 4: Publicación y persistencia multiusuario
- **Status:** complete
- Actions taken:
  - Añadí login docente por enlace de correo y verificación separada del permiso en `teacher_access`.
  - Añadí migración SQL, políticas RLS/grants y servicio de carga/guardado remoto de asignaturas y quizzes.
  - Conecté el Hub al catálogo remoto, manteniendo el adaptador local y migrando el catálogo local al primer acceso remoto vacío.
  - Separé acceso docente del ingreso manual de estudiantes sin cuenta y documenté la configuración de Supabase.
  - Completé borrador/publicado/archivado, restauración como borrador y snapshot inmutable del quiz/version al arrancar host o práctica.
  - Decidí mantener salas activas efímeras en Realtime: el código identifica el canal y el host reenvía el estado actual al alumno que entra. No hay historial/auditoría de salas.
- Files created/modified:
  - `src/App.jsx`, `src/modes/HubScreen.jsx`, `src/modes/TeacherAccessScreen.jsx`
  - `src/services/teacherCatalogService.js`
  - `supabase/migrations/20260920000100_teacher_quiz_catalog.sql`, `supabase/README.md`
  - `.env.example`, `task_plan.md`, `findings.md`, `progress.md`

## Verification Notes
- `node --check` para los módulos `.js` de catálogo/Supabase y `git diff --check`: sin errores; Git avisó que normalizará LF a CRLF en futuras escrituras.
- No ejecuté lint/build: no existe `node_modules`; `npm`, `vite` y `oxlint` no están disponibles y no instalé dependencias.

### Phase 5: Revisión y entrega
- **Status:** complete
- Actions taken:
  - Revisé compatibilidad con el catálogo inicial y los flujos actuales de Host, práctica y estudiantes.
  - Ejecuté checks sintácticos de módulos JS y whitespace.
- Remaining:
  - La migración ya se aplicó en el proyecto Supabase `Quizzes` (rama `main`, producción).
  - Falta habilitar la cuenta docente prevista en `public.teacher_access` antes del primer acceso al catálogo remoto.

### Aplicación de migración Supabase
- **Status:** complete
- Actions taken:
  - Ejecuté `20260920000100_teacher_quiz_catalog.sql` en el SQL Editor del proyecto `Quizzes`.
  - El editor respondió `Success. No rows returned`.
  - No inserté filas en `teacher_access`, porque eso concedería permisos docentes y no se especificó la identidad que debe habilitarse.

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Not run | — | — | — | — |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| — | — | — | — |

## Session: 2026-09-24 — Historial de sesiones

### Phase 1: Descubrimiento y alcance
- **Status:** complete
- Confirmé que las sesiones actuales son efímeras en Realtime y que Host mantiene la clasificación final.
- Alcance inicial: guardar sesiones completadas con snapshots de quiz/asignatura y clasificación; acceso privado para la cuenta docente; no conservar ID de dispositivo ni detalle por respuesta.

### Phase 2: Persistencia y consulta
- **Status:** complete
- Añadí migración Supabase con políticas RLS de lectura, inserción y borrado para el docente autorizado.
- Añadí guardado de resultados al terminar el quiz y una vista del historial en el Hub, con clasificación expandible y borrado por sesión.
- Guardé snapshots de quiz/asignatura, fecha, código de sala y clasificación; excluí identificadores de dispositivo y respuestas individuales.

### Phase 3: Integración y verificación
- **Status:** complete
- Documenté la nueva migración en README y actualicé el aviso de privacidad sobre los datos retenidos y la eliminación manual.
- `npm run typecheck`, `npm run lint`, `npm run build` y `git diff --check` pasan. Vite mantiene su advertencia existente por bundles mayores a 500 kB.
- **Pendiente de entorno:** ejecutar `supabase/migrations/20260924000100_quiz_session_history.sql` en el SQL Editor de producción; no se ejecutó una migración remota desde este workspace.

## Session: 2026-09-24 — Estadísticas y exportación

### Phase 1: Diseño y datos
- **Status:** complete
- Definí métricas agregadas por pregunta: respuestas recibidas y correctas. No se guardan respuestas individuales.
- Añadí migración incremental `20260924000200_session_question_stats.sql`; sesiones previas reciben un array vacío.

### Phase 2: Integración
- **Status:** complete
- `HostScreen` acumula métricas al recibir el primer voto válido de cada jugador y las incluye al finalizar.
- El Hub presenta conteos y porcentaje de acierto por pregunta dentro de cada sesión.
- Añadí CSV UTF-8 con BOM para resultados de participantes y estadísticas por pregunta/sesión.
- README y aviso de privacidad describen los datos nuevos.

### Phase 3: Verificación
- **Status:** complete
- `npm run typecheck`, `npm run lint`, `npm run build` y `git diff --check` pasan.
- Vite conserva la advertencia de tamaño de bundle mayor a 500 kB.
- **Pendiente de entorno:** ejecutar `supabase/migrations/20260924000200_session_question_stats.sql` después de la migración de historial en Supabase.
