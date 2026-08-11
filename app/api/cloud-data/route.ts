import { env } from "cloudflare:workers";

function user(request: Request) {
  const id = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  return id && email ? { id, email } : null;
}

function unauthorized() {
  return Response.json({ error: "请先使用 ChatGPT 登录后再保存云端数据", signIn: "/signin-with-chatgpt?return_to=%2F" }, { status: 401 });
}

export async function GET(request: Request) {
  const current = user(request); if (!current) return unauthorized();
  const latest = await env.DB.prepare("SELECT id, object_key, created_at FROM snapshots WHERE owner_id = ? ORDER BY created_at DESC LIMIT 1").bind(current.id).first<{ id: string; object_key: string; created_at: number }>();
  const uploads = await env.DB.prepare("SELECT id, dataset_type, filename, bytes, row_count, status, created_at FROM uploads WHERE owner_id = ? ORDER BY created_at DESC LIMIT 20").bind(current.id).all();
  let snapshot = null;
  if (latest) {
    const object = await env.FILES.get(latest.object_key);
    if (object) snapshot = await object.json();
  }
  return Response.json({ user: { email: current.email }, snapshot, uploads: uploads.results, latestAt: latest?.created_at ?? null });
}

export async function POST(request: Request) {
  const current = user(request); if (!current) return unauthorized();
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");
  if (!(file instanceof File) || !["business", "promo", "snapshot"].includes(kind)) return Response.json({ error: "上传参数不完整" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return Response.json({ error: "单个文件不能超过25MB" }, { status: 413 });
  const id = crypto.randomUUID(), now = Date.now();
  const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 100) || "data.bin";
  const objectKey = `${current.id}/${kind}/${now}-${id}-${safeName}`;
  await env.FILES.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { ownerId: current.id, kind } });
  if (kind === "snapshot") {
    await env.DB.prepare("INSERT INTO snapshots (id, owner_id, object_key, created_at) VALUES (?, ?, ?, ?)").bind(id, current.id, objectKey, now).run();
  } else {
    const rowCount = Number(form.get("rowCount") ?? 0) || 0;
    await env.DB.prepare("INSERT INTO uploads (id, owner_id, dataset_type, filename, object_key, bytes, row_count, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'stored', ?)").bind(id, current.id, kind, file.name, objectKey, file.size, rowCount, now).run();
  }
  return Response.json({ ok: true, id, kind, createdAt: now }, { status: 201 });
}
