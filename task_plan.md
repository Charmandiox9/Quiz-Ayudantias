# Plan: asignaturas y quizzes configurables

## Goal
Permitir que el profesor organice quizzes dentro de asignaturas, los cree y publique, y pueda ejecutarlos con los modos actuales; ampliar gradualmente los tipos de preguntas con una evaluación compartida.

## Current Phase
Complete — listo para configurar Supabase

## Phases

### Phase 1: Descubrimiento y modelo — complete
- [x] Revisar navegación, datos, modos actuales y persistencia.
- [x] Definir los conceptos Asignatura, Quiz, Pregunta y Sesión.
- [x] Registrar límites de la primera entrega en `findings.md`.
- **Status:** complete

### Phase 2: Biblioteca docente y selección de quiz — complete
- [x] Crear un repositorio de quizzes con adaptador local persistente y catálogo inicial migrado.
- [x] Añadir navegación Asignaturas → quizzes → acciones para crear y ejecutar.
- [x] Permitir crear asignaturas y quizzes en borrador, publicarlos y agregar varias preguntas.
- [x] Enrutar los modos existentes al quiz seleccionado, manteniendo el enlace/código de sala.
- **Status:** complete

### Phase 3: Modelo de preguntas y ejecución — complete
- [x] Introducir preguntas discriminadas por tipo con validación común.
- [x] Implementar selección única, verdadero/falso y selección múltiple en editor, práctica, host y celular.
- [x] Generalizar voto/respuesta en tiempo real y puntaje sin romper el protocolo actual.
- [x] Preservar explicación, temas, revisión de errores y resultados.
- **Status:** complete

### Phase 4: Publicación y persistencia multiusuario — complete
- [x] Añadir persistencia Supabase para asignaturas y quizzes con autenticación del profesor y RLS.
- [x] Mantener entrada de estudiantes mediante alias/código sin exigir cuenta.
- [x] Documentar configuración y migración inicial de datos locales.
- [x] Definir sesiones activas efímeras por canal Realtime; al entrar un alumno el host reenvía el estado actual, sin crear una tabla de sesiones.
- [x] Completar publicación/archivo/restauración y congelar el snapshot/version del quiz al abrir una sesión.
- **Status:** complete

### Phase 5: Revisión y entrega — complete
- [x] Revisar cambios y compatibilidad con quizzes existentes.
- [x] Ejecutar verificaciones disponibles; build/lint no se pueden ejecutar sin dependencias ni npm.
- [x] Actualizar plan y describir configuración pendiente.
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Tratar cada ayudantía existente como un quiz inicial dentro de una asignatura "Ingeniería de Software" | Conserva el contenido y da al catálogo estático una ruta de migración al nuevo modelo. |
| Mantener almacenamiento local cuando no hay Supabase y usar catálogo remoto protegido cuando está configurado | Permite desarrollo sin backend y sincronización docente entre dispositivos sin escrituras anónimas. |
| Una sesión ejecuta una versión inmutable del quiz | Editar/publicar contenido no debe alterar una partida activa. |
| Soportar selección única, verdadero/falso y selección múltiple con una respuesta común de índice(s) | Mantiene la evaluación simple y reutilizable en práctica y host; la selección múltiple usa coincidencia exacta en esta entrega. |
| El acceso docente inicial es por enlace y requiere una fila explícita en `teacher_access` | Separa identidad autenticada de autorización al catálogo. |
| El rol `anon` no tiene grants para las tablas del catálogo | El catálogo y la pauta son contenido privado del profesor. |
| Las salas en vivo son efímeras en Realtime; al unirse un estudiante, el host reenvía el estado actual | No se necesita duplicar en Postgres la sesión necesaria para los modos actuales; no hay historial/auditoría de salas. |

## Current Delivery Scope
- Implementado: biblioteca local de asignaturas y quizzes, borradores, publicación, varias preguntas con tres tipos y acceso a host/práctica.
- Implementado: selección única, verdadero/falso y selección múltiple con corrección exacta en práctica y en sala en vivo.
- Implementado para uso docente entre dispositivos al configurar Supabase: Auth por enlace, autorización, RLS y sincronización del catálogo.
- Las sesiones host/práctica usan una copia/version fija del quiz; las salas en vivo no mantienen historial persistente.
- Pendiente: puntaje parcial para selección múltiple, edición posterior del contenido y más tipos como respuesta corta, ordenar y relacionar.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| None | — | — |

## Phase 6: Historial de sesiones — complete
- [x] Añadir tabla Supabase con RLS para sesiones completadas y resultados finales.
- [x] Guardar una sesión al terminar un quiz, solo para el docente autenticado.
- [x] Añadir vista de historial en el Hub con fecha, quiz, sala y clasificación.
- [x] Documentar y validar la nueva migración y sus límites de privacidad.
- **Status:** complete — la migración SQL aún debe ejecutarse en el proyecto Supabase de producción.

### Decisions for Phase 6
- Registrar por ahora solo sesiones completadas; una salida temprana o abandono no se agrega al historial.
- Guardar la clasificación final con apodos, puntaje y respuestas correctas; no guardar identificadores de dispositivo ni respuestas individuales.
- El historial requiere Supabase y cuenta docente autorizada; el modo local sigue siendo efímero.
- El docente puede eliminar sesiones individuales; el historial se conserva hasta que lo elimine.
