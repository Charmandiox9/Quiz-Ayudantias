interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  send(body: unknown): ApiResponse;
  json(body: unknown): ApiResponse;
}

function fail(res: ApiResponse, status: number, error: string): ApiResponse {
  return res.status(status).json({ error });
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return fail(res, 405, "Método no permitido.");
  }

  const rawUrl = req.query?.url;
  const requestedUrl = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;
  let publicBase: URL;
  let imageUrl: URL;
  try {
    publicBase = new URL(process.env.R2_PUBLIC_BASE_URL || "");
    imageUrl = new URL(requestedUrl || "");
  } catch {
    return fail(res, 400, "La dirección de la imagen no es válida.");
  }

  const basePath = publicBase.pathname.replace(/\/$/, "");
  if (
    publicBase.protocol !== "https:" ||
    imageUrl.origin !== publicBase.origin ||
    !imageUrl.pathname.startsWith(`${basePath}/`) ||
    imageUrl.username || imageUrl.password
  ) {
    return fail(res, 400, "La imagen no pertenece al almacenamiento configurado.");
  }

  try {
    const upstream = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) return fail(res, upstream.status === 404 ? 404 : 502, "No se pudo obtener la imagen.");
    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (!contentType?.startsWith("image/")) return fail(res, 415, "El recurso no es una imagen.");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    return res.status(200).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    console.error("R2 image proxy error:", error);
    return fail(res, 502, "No se pudo obtener la imagen.");
  }
}
