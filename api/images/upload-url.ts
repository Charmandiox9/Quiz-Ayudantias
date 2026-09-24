import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_COMPRESSED_SIZE = 220 * 1024;
const IMAGE_CONTENT_TYPE = "image/webp";

interface ApiRequest {
  method?: string;
  headers: { authorization?: string | string[] };
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
}

let r2Client: S3Client | null = null;

function json(res: ApiResponse, status: number, body: unknown): ApiResponse {
  return res.status(status).json(body);
}

function getR2Client(): S3Client | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_BASE_URL) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
  }
  return r2Client;
}

function getPublicBaseUrl() {
  try {
    const publicUrl = new URL(process.env.R2_PUBLIC_BASE_URL || "");
    if (
      publicUrl.protocol !== "https:" ||
      publicUrl.hostname.toLowerCase().endsWith(".r2.cloudflarestorage.com")
    ) return null;
    return publicUrl.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function authorizeTeacher(req: ApiRequest): Promise<string | null> {
  const header = req.headers.authorization;
  const authorization = typeof header === "string" ? header : "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
  if (!userResponse.ok) return null;
  const user: unknown = await userResponse.json();
  if (!user || typeof user !== "object" || !("id" in user) || typeof user.id !== "string") return null;

  const accessUrl = new URL(`${supabaseUrl}/rest/v1/teacher_access`);
  accessUrl.searchParams.set("select", "user_id");
  accessUrl.searchParams.set("user_id", `eq.${user.id}`);
  const accessResponse = await fetch(accessUrl, { headers });
  if (!accessResponse.ok) return null;
  const access: unknown = await accessResponse.json();
  return Array.isArray(access) && access.length > 0 ? user.id : null;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método no permitido." });
  }

  try {
    const userId = await authorizeTeacher(req);
    if (!userId) return json(res, 401, { error: "La sesión no es válida o la cuenta no tiene acceso docente." });

    const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
    const contentType = body.contentType;
    const size = body.size;
    const assetType = body.assetType ?? "question";
    if (contentType !== IMAGE_CONTENT_TYPE || typeof size !== "number" || !Number.isInteger(size) || size < 1 || size > MAX_COMPRESSED_SIZE) {
      return json(res, 400, { error: "La imagen debe ser WebP y pesar como máximo 220 KB." });
    }
    if (assetType !== "question" && assetType !== "subject-seal" && assetType !== "quiz-card") {
      return json(res, 400, { error: "El destino de la imagen no es válido." });
    }

    const client = getR2Client();
    if (!client) return json(res, 503, { error: "Falta configurar Cloudflare R2 en las variables de entorno de Vercel." });
    const publicBaseUrl = getPublicBaseUrl();
    if (!publicBaseUrl) {
      return json(res, 503, { error: "R2_PUBLIC_BASE_URL debe ser el dominio público del bucket (r2.dev o dominio personalizado), no el endpoint S3 *.r2.cloudflarestorage.com." });
    }

    const bucket = process.env.R2_BUCKET_NAME;
    const assetFolder = assetType === "subject-seal" ? "subjects" : assetType === "quiz-card" ? "quiz-cards" : "questions";
    const objectKey = `${assetFolder}/${userId}/${randomUUID()}.webp`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: IMAGE_CONTENT_TYPE });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    return json(res, 200, {
      uploadUrl,
      imageUrl: `${publicBaseUrl}/${objectKey.split("/").map(encodeURIComponent).join("/")}`,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);
    return json(res, 500, { error: "No se pudo preparar la carga de la imagen." });
  }
}
