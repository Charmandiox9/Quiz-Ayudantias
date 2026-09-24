export const PRIVACY_POLICY = {
  lawReference: "Ley N° 21.719 sobre Proteccion de Datos Personales (Chile)",
  purpose: "Actividad pedagogica y evaluacion formativa en aula.",
  principles: [
    {
      title: "Minimizacion de Datos",
      description: "El sistema no recopila ni solicita datos personales sensibles, tales como RUT, nombres completos, correo electronico ni datos biometricos.",
    },
    {
      title: "Alias Efimeros",
      description: "La participacion se realiza mediante un apodo de libre eleccion y no requiere asociar la cuenta del estudiante con su identidad real. Al completar un quiz en vivo, el apodo, el puntaje y los aciertos se conservan en el historial privado del docente.",
    },
    {
      title: "Limitacion del Plazo de Conservacion",
      description: "El docente puede eliminar sesiones desde el historial. La clasificación final y los conteos agregados de respuestas por pregunta se conservan en Supabase hasta que el docente elimine la sesión; no se guardan las respuestas individuales ni el identificador del dispositivo.",
    },
    {
      title: "Sin Rastreo Comercial",
      description: "No se emplean cookies publicitarias, trackers de telemetria invasiva ni venta de datos a terceros.",
    },
  ],
  legalNotice: "Esta aplicacion se diseno bajo los principios de privacidad desde el diseno y por defecto conforme al marco normativo de la Ley N° 21.719 de Chile.",
};
