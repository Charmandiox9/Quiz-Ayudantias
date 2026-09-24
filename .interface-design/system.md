# Interface system — Quiz Ayudantías

## Direction
Academic teaching workbench: calm, direct and readable from a classroom computer before a session. The interface should help the professor move from course to quiz to launch without mixing authoring controls with live-game controls.

## Domain cues
- Course / asignatura
- Quiz / activity
- Question and answer key
- Draft and published state
- Classroom projection
- Live room and joining code
- Individual practice and review

## Signature
The professor's content is organized as an explicit path: overview counts → subject navigation → searchable, filterable quiz library → publish or launch actions. A live quiz receives a fresh room code for each run, so the reusable content stays separate from the classroom session. Manual room entry stays available in a compact disclosure below the library.

## Palette
Use the existing institutional palette in `src/index.css`:
- Navy `--color-primary` (`#1E2761`) identifies course structure, titles and primary actions.
- Amber `--color-accent` (`#D97706`) marks creation, publication and classroom activity.
- Slate surfaces and text (`--color-bg`, `--color-surface`, `--color-text-*`) keep long question content quiet and readable.
- Green and red are semantic answer feedback only (`--color-success*`, `--color-danger*`).

Avoid introducing extra accent hues for decoration. Quiz option colors remain the existing A–E palette because they encode answer labels in the classroom flow.

## Hierarchy and type
- Page title names the current work area; subject title names the selected collection.
- Quiz title is the primary label within a quiz row; status and question count are supporting metadata.
- Use the existing Inter/system sans stack and scale from `src/index.css`; use weight and color before adding more font sizes.
- Keep codes and compact numeric values in the existing monospace stack.

## Layout and spacing
- Use an 8px spacing rhythm, with 4px for small icon/label gaps.
- Desktop library: narrow subject navigation beside the wider quiz list; collapse to one column below 760px. The subject list may stay in view while browsing a long library.
- Show a compact count strip above the library and keep search, status filters and result count together.
- Group form fields by question; put answer-key controls directly beside each alternative.
- Keep the launch actions adjacent to the quiz they run.

## Surfaces and controls
- Use white cards on the slate-tinted page canvas with quiet borders and the existing subtle shadow treatment.
- Reuse `Card`, `Button`, `Badge` and existing theme tokens. Avoid one-off palette values when a semantic token exists.
- Use native inputs and a native `<dialog>` for modal forms so keyboard focus and Escape handling remain platform behavior.
- Keep empty states actionable: explain what is missing and provide the next creation action.

## Interaction states
- Draft quizzes expose the publish action; published quizzes expose host and practice actions.
- Multi-select questions clearly say that several alternatives may be chosen and require explicit submission.
- Show validation errors next to the relevant form and preserve entered values after an error.
- Respect keyboard focus visibility and provide hit areas appropriate for touch use.

## Current limitations
- This system documents the teacher library. Shared teacher accounts, cross-device persistence and further question types are not yet implemented.
- The authenticated teacher view requires an enabled account, so visual verification of that screen depends on access to one.
