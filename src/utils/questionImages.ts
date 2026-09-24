import { supabase } from "../services/supabaseClient";
import type { ImageAssetType } from "../types";

const MAX_SOURCE_SIZE = 8 * 1024 * 1024;
const MAX_COMPRESSED_SIZE = 220 * 1024;
const MAX_DIMENSION = 1280;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("El archivo no parece ser una imagen válida."));
    };
    image.src = objectUrl;
  });
}

async function compressQuestionImage(file: File): Promise<Blob> {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen.");
  }
  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error("La imagen original debe pesar menos de 8 MB.");
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Este navegador no permite procesar la imagen.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let compressed: Blob | null = null;
  for (const quality of [0.84, 0.72, 0.6, 0.48]) {
    compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (compressed && compressed.size <= MAX_COMPRESSED_SIZE) break;
  }
  if (!compressed || compressed.size > MAX_COMPRESSED_SIZE) {
    throw new Error("La imagen sigue siendo muy pesada al comprimirla. Prueba con otra más pequeña.");
  }
  return compressed;
}

export async function uploadImageToR2(file: File, assetType: ImageAssetType = "question"): Promise<string> {
  if (!["question", "subject-seal", "quiz-card"].includes(assetType)) {
    throw new Error("Tipo de imagen no permitido.");
  }
  if (!supabase) throw new Error("Supabase debe estar configurado para cargar imágenes.");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error("Inicia sesión como profesor para cargar imágenes.");
  }

  const image = await compressQuestionImage(file);
  const response = await fetch("/api/images/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ contentType: image.type, size: image.size, assetType }),
  });
  const result: unknown = await response.json().catch(() => ({}));
  const uploadData = result && typeof result === "object" ? result as { error?: unknown; uploadUrl?: unknown; imageUrl?: unknown } : {};
  if (!response.ok) {
    throw new Error(typeof uploadData.error === "string" ? uploadData.error : "No se pudo preparar la carga de la imagen.");
  }
  if (typeof uploadData.uploadUrl !== "string" || typeof uploadData.imageUrl !== "string") {
    throw new Error("El servidor devolvió una respuesta de carga no válida.");
  }

  const uploadResponse = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": image.type },
    body: image,
  });
  if (!uploadResponse.ok) {
    throw new Error("No se pudo guardar la imagen en Cloudflare R2. Revisa la configuración CORS del bucket.");
  }
  return uploadData.imageUrl;
}
