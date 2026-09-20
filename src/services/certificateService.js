import { supabase, isSupabaseConfigured } from "./supabaseClient";

const LOCAL_STORAGE_KEY = "quiz_card_downloads";

/**
 * Servicio de registro y auditoria de certificados descargados.
 * Cumple con la Ley N° 21.719 (Proteccion de Datos Personales en Chile):
 * No almacena datos sensibles, RUTs ni correos electronicos.
 */
export const certificateService = {
  /**
   * Registra una descarga en Supabase (si esta configurado) y en el almacenamiento local.
   */
  async recordDownload({ serialId, quizTitle, accuracy, score, nickname = "Estudiante" }) {
    const timestamp = new Date().toISOString();
    const record = {
      serial_id: serialId,
      quiz_title: quizTitle,
      accuracy: Number(accuracy),
      score: Number(score),
      player_nickname: (nickname || "Estudiante").slice(0, 30),
      downloaded_at: timestamp,
    };

    // 1. Guardar siempre en almacenamiento local (para persistencia offline / fallback)
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      const updated = [record, ...existing.filter((item) => item.serial_id !== serialId)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch {
      // Manejo silencioso de cuotas de localStorage
    }

    // 2. Guardar en Supabase si esta disponible
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("card_downloads").upsert(
          [
            {
              id: serialId,
              quiz_title: quizTitle,
              accuracy: Number(accuracy),
              score: Number(score),
              player_nickname: (nickname || "Estudiante").slice(0, 30),
              downloaded_at: timestamp,
            },
          ],
          { onConflict: "id", ignoreDuplicates: true }
        );

        if (error) {
          // Si la tabla aun no existe o hay restriccion RLS, registramos advertencia sin bloquear la app
          console.info("Informacion: Registro remoto en Supabase pendiente de creacion de tabla card_downloads.");
        }
      } catch {
        // Fallback silencioso para no interrumpir la experiencia de usuario
      }
    }

    return record;
  },

  /**
   * Obtiene la lista de certificados descargados localmente.
   */
  getLocalDownloads() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  },
};
