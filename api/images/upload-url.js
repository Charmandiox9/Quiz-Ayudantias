import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_COMPRESSED_SIZE = 220 * 1024;
const IMAGE_CONTENT_TYPE = "image/webp";

let r2Client;

function json(res, status, body) {
  return res.status(status).json(body);
}

function getR2Client() {
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

async function authorizeTeacher(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  if (!user?.id) return null;

  const accessUrl = new URL(`${supabaseUrl}/rest/v1/teacher_access`);
  accessUrl.searchParams.set("select", "user_id");
  accessUrl.searchParams.set("user_id", `eq.${user.id}`);
  const accessResponse = await fetch(accessUrl, { headers });
  if (!accessResponse.ok) return null;
  const access = await accessResponse.json();
  return Array.isArray(access) && access.length > 0 ? user.id : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método no permitido." });
  }

  try {
    const userId = await authorizeTeacher(req);
    if (!userId) return json(res, 401, { error: "La sesión no es válida o la cuenta no tiene acceso docente." });

    const { contentType, size } = req.body || {};
    if (contentType !== IMAGE_CONTENT_TYPE || !Number.isInteger(size) || size < 1 || size > MAX_COMPRESSED_SIZE) {
      return json(res, 400, { error: "La imagen debe ser WebP y pesar como máximo 220 KB." });
    }

    const client = getR2Client();
    if (!client) return json(res, 503, { error: "Falta configurar Cloudflare R2 en las variables de entorno de Vercel." });

    const bucket = process.env.R2_BUCKET_NAME;
    const objectKey = `questions/${userId}/${randomUUID()}.webp`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: IMAGE_CONTENT_TYPE });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");

    return json(res, 200, {
      uploadUrl,
      imageUrl: `${publicBaseUrl}/${objectKey.split("/").map(encodeURIComponent).join("/")}`,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);
    return json(res, 500, { error: "No se pudo preparar la carga de la imagen." });
  }
}
