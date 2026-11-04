// Guarda y entrega el avance de cada equipo usando Netlify Blobs.
// POST /api/progreso   -> la actividad envía el avance de un equipo (uno por dispositivo)
// GET  /api/progreso   -> el panel del docente lee el avance de todos
// DELETE /api/progreso -> el docente borra los datos (requiere la clave DOCENTE_CLAVE)
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export default async (req) => {
  const store = getStore({ name: "progreso-productos-notables", consistency: "strong" });

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }
    if (!b || !/^equipo-[1-9]$/.test(String(b.id))) return json({ error: "Equipo inválido" }, 400);
    const dev = /^[a-z0-9]{8,20}$/.test(String(b.dev || "")) ? b.dev : null;
    // Un registro por equipo y dispositivo: dos dispositivos ya no se sobrescriben entre sí
    const key = dev ? `${b.id}__${dev}` : b.id;
    const seq = Number(b.seq) || 0;
    const started = Number(b.started) || 0;

    // Ignorar envíos atrasados que lleguen después de uno más reciente
    const prev = await store.get(key, { type: "json" });
    if (prev && dev && (prev.started || 0) === started && (prev.seq || 0) > seq) {
      return json({ ok: true, ignorado: true });
    }

    const registro = {
      id: b.id,
      dev,
      seq,
      equipo: String(b.equipo || b.id).slice(0, 60),
      total: Number(b.total) || 0,
      max: Number(b.max) || 0,
      nodoActual: Number(b.nodoActual) || 1,
      nodos: Array.isArray(b.nodos) ? b.nodos.slice(0, 7) : [],
      started: started || null,
      finished: b.finished || null,
      codigo: b.codigo || null,
      actualizado: Date.now(),
    };
    await store.setJSON(key, registro);
    return json({ ok: true });
  }

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const registros = (await Promise.all(blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
    return json({ equipos: registros, ahora: Date.now() });
  }

  if (req.method === "DELETE") {
    const clave = process.env.DOCENTE_CLAVE;
    if (!clave || req.headers.get("x-clave") !== clave) return json({ error: "Clave incorrecta" }, 401);
    const { blobs } = await store.list();
    await Promise.all(blobs.map((x) => store.delete(x.key)));
    return json({ ok: true });
  }

  return json({ error: "Método no permitido" }, 405);
};

export const config = { path: "/api/progreso" };
