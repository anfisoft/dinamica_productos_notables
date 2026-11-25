// Examen final de factorización (Casos I, II, III, IV y VI) — Razonamiento Matemático
// Las preguntas se generan y se califican aquí, en el servidor: el navegador nunca recibe las respuestas.
// Datos guardados en Netlify Blobs (privado). Rutas:
//   POST /api/examen  { accion, ... }
// Acciones del estudiante: buscar, iniciar, pista, responder, evento
// Acciones del docente (encabezado x-clave = DOCENTE_CLAVE): config, guardarConfig, guardarLista, verLista,
//   resultados, reingreso, cerrar, borrarExamenes
import { getStore } from "@netlify/blobs";
import { randomBytes } from "node:crypto";

/* ===================== Utilidades de formato algebraico ===================== */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sp = (n) => String(n).split("").map((d) => SUP[+d]).join("");
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuf = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const M = (c, v) => ({ c, v: v || {} });
const mul = (a, b) => { const v = { ...a.v }; for (const k in b.v) v[k] = (v[k] || 0) + b.v[k]; return M(a.c * b.c, v); };
const pw = (a, k) => { let r = M(1); for (let i = 0; i < k; i++) r = mul(r, a); return r; };
const sc = (a, k) => M(a.c * k, a.v);
const lit = (m) => Object.keys(m.v).sort().filter((k) => m.v[k] > 0).map((k) => k + (m.v[k] > 1 ? sp(m.v[k]) : "")).join("");
const fm = (m) => { const s = lit(m), c = Math.abs(m.c); return c === 1 && s ? s : String(c) + s; };
function fP(ts) { let out = ""; ts.filter((t) => t.c !== 0).forEach((t, i) => { out += i === 0 ? (t.c < 0 ? "−" : "") + fm(t) : (t.c < 0 ? " − " : " + ") + fm(t); }); return out || "0"; }
const X = (v, e = 1, c = 1) => M(c, { [v]: e });
const N = (n) => M(n);
const bin = (...ts) => "(" + fP(ts) + ")";
const VARS = [["x", "y"], ["a", "b"], ["m", "n"], ["p", "q"]];

// Opción múltiple: la correcta + distractores distintos, barajados. Guarda el índice correcto.
function mc(base, correcta, distractores) {
  const vistos = new Set([correcta]); const ds = [];
  for (const d of distractores) { if (!vistos.has(d)) { vistos.add(d); ds.push(d); } if (ds.length === 3) break; }
  const ops = shuf([correcta, ...ds]);
  return { ...base, tipo: "mc", opciones: ops, correcta: ops.indexOf(correcta) };
}
const num = (base, valor) => ({ ...base, tipo: "num", correcta: valor });

/* ===================== Generadores por nivel ===================== */
// Cada nivel: 3 preguntas = 1 + 2 + 2 puntos = 5 puntos. Las de 2 puntos tienen 2 pistas (−1 punto cada una).

function nivel1() { // Caso I · Factor común
  const qs = [];
  { // 1 pt: factor común máximo con dos variables
    const [u, w] = pick(VARS); const g = ri(2, 6), e = ri(1, 2), f = ri(1, 2);
    let c1, c2, c3; do { c1 = ri(1, 5); c2 = ri(1, 6); c3 = ri(1, 5); } while (gcd(gcd(c1, c2), c3) !== 1);
    const F = M(g, { [u]: e, [w]: f });
    const t1 = M(g * c1, { [u]: e + 2, [w]: f }), t2 = M(-g * c2, { [u]: e + 1, [w]: f + 1 }), t3 = M(g * c3, { [u]: e, [w]: f + 2 });
    const inner = [M(c1, { [u]: 2 }), M(-c2, { [u]: 1, [w]: 1 }), M(c3, { [w]: 2 })];
    const correcta = fP([F]) + bin(...inner);
    qs.push(mc({ pts: 1, caso: "I", enunciado: `Factoriza completamente: ${fP([t1, t2, t3])}`, _expr: fP([t1, t2, t3]) }, correcta, [
      fP([M(g, { [u]: e + 1, [w]: f })]) + bin(...inner),
      fP([F]) + bin(inner[0], sc(inner[1], -1), inner[2]),
      fP([F]) + bin(...inner.map((t) => sc(t, g))),
    ]));
  }
  { // 2 pts: numérica, suma de coeficientes del paréntesis
    const v = pick(["x", "a", "m", "t"]); const g = ri(2, 9), k = ri(1, 3);
    let a, b, c; do { a = ri(1, 9); b = ri(1, 9); c = ri(1, 9); } while (gcd(gcd(a, b), c) !== 1);
    const t1 = X(v, k + 2, g * a), t2 = X(v, k + 1, -g * b), t3 = X(v, k, g * c);
    qs.push(num({ pts: 2, caso: "I",
      enunciado: `Factoriza ${fP([t1, t2, t3])} sacando el factor común máximo. El resultado tendrá la forma (factor común)·(A${v}² + B${v} + C). ¿Cuánto vale A + B + C? (Toma en cuenta los signos.)`,
      pistas: [
        `El factor común máximo es ${fP([X(v, k, g)])}: ${g} es el MCD de ${g * a}, ${g * b} y ${g * c}, y ${fP([X(v, k)])} es la menor potencia de ${v} que aparece en los tres términos.`,
        `Divide cada término entre ${fP([X(v, k, g)])}. Por ejemplo, ${fP([t1])} ÷ ${fP([X(v, k, g)])} = ${fP([X(v, 2, a)])}. Haz lo mismo con los otros dos términos y suma los tres coeficientes con su signo.`,
      ], _p: { a, b, c } }, a - b + c));
  }
  { // 2 pts: factor común polinomio
    const L = pick(["a", "b", "m", "n"]), y = pick(["x", "y", "t"]); let c, v; do { c = ri(2, 9); v = ri(2, 9); } while (gcd(c, v) !== 1); const p = ri(1, 9);
    const B = bin(X(y), N(p));
    const expr = `${fP([X(L, 1, c)])}${B} − ${v}${B}`;
    const correcta = `${B}${bin(X(L, 1, c), N(-v))}`;
    qs.push(mc({ pts: 2, caso: "I", enunciado: `Factoriza: ${expr}`, _expr: expr,
      pistas: [
        `El binomio ${B} aparece completo en los dos términos: ese binomio es el factor común.`,
        `Al sacar ${B}, del primer término queda ${fP([X(L, 1, c)])} y del segundo queda −${v}. Esos dos forman el otro factor.`,
      ] }, correcta, [
      `${B}${bin(X(L, 1, c), N(v))}`,
      `${bin(X(y), N(-p))}${bin(X(L, 1, c), N(-v))}`,
      `${bin(X(L, 1, c), N(-v))}${B}²`,
    ]));
  }
  return qs;
}

function nivel2() { // Caso II · Agrupación
  const qs = [];
  { // 1 pt
    const p = ri(2, 9), k = ri(2, 6);
    const ts = [X("x", 2, k), X("x", 1, p * k), M(1, { x: 1, y: 1 }), X("y", 1, p)];
    qs.push(mc({ pts: 1, caso: "II", enunciado: `Factoriza por agrupación: ${fP(ts)}`, _expr: fP(ts) },
      `${bin(X("x"), N(p))}${bin(X("x", 1, k), X("y"))}`, [
      `${bin(X("x"), N(p))}${bin(X("x", 1, k), X("y", 1, -1))}`,
      `${bin(X("x"), N(-p))}${bin(X("x", 1, k), X("y"))}`,
      `${bin(X("x"), X("y"))}${bin(X("x", 1, k), N(p))}`,
    ]));
  }
  { // 2 pts: agrupación con signos
    let m, n, r, s; do { m = ri(2, 5); n = ri(1, 7); r = ri(2, 5); s = ri(1, 7); } while (gcd(m, n) !== 1 || gcd(r, s) !== 1);
    const ts = [M(m * r, { a: 1, b: 1 }), X("a", 1, -n * r), X("b", 1, -m * s), N(n * s)];
    const f1 = (sg) => bin(X("b", 1, m), N(sg * n)), f2 = (sg) => bin(X("a", 1, r), N(sg * s));
    qs.push(mc({ pts: 2, caso: "II", enunciado: `Factoriza por agrupación: ${fP(ts)}`, _expr: fP(ts),
      pistas: [
        `Agrupa de dos en dos: (${fP([ts[0], ts[1]])}) + (${fP([ts[2], ts[3]])}). En el primer grupo, el factor común es ${fP([X("a", 1, r)])}.`,
        `Del primer grupo sale ${fP([X("a", 1, r)])}${f1(-1)}. En el segundo grupo saca −${s} como factor común para que aparezca el mismo binomio ${f1(-1)}.`,
      ] }, `${f1(-1)}${f2(-1)}`, [`${f1(1)}${f2(-1)}`, `${f1(-1)}${f2(1)}`, `${f1(1)}${f2(1)}`]));
  }
  { // 2 pts: numérica
    const a = ri(2, 9), b = ri(2, 9);
    const ts = [X("x", 3), X("x", 2, -a), X("x", 1, b), N(-a * b)];
    qs.push(num({ pts: 2, caso: "II",
      enunciado: `La expresión ${fP(ts)} se puede factorizar como (x − a)(x² + b), con a y b números enteros positivos. ¿Cuánto vale a + b?`,
      pistas: [
        `Agrupa así: (${fP([ts[0], ts[1]])}) + (${fP([ts[2], ts[3]])}) y saca el factor común de cada grupo.`,
        `Del primer grupo queda x²(x − ${a}). Del segundo, saca ${b}: el binomio que se repite es (x − ${a}).`,
      ], _p: { a, b } }, a + b));
  }
  return qs;
}

function nivel3() { // Caso III · Trinomio cuadrado perfecto
  const qs = [];
  { // 1 pt: cuál es TCP
    const v = pick(["x", "y", "m"]); const p = ri(1, 4), q = ri(1, 7);
    const tcp = fP([X(v, 2, p * p), X(v, 1, 2 * p * q), N(q * q)]);
    let r, s; do { r = ri(1, 6); s = ri(2, 8); } while (r === s || Math.sqrt(r * s) % 1 === 0);
    const opts = [
      fP([X(v, 2), X(v, 1, r + s), N(r * s)]),          // parece TCP pero el último no es cuadrado
      fP([X(v, 2, p * p), X(v, 1, p * q), N(q * q)]),    // término central sin duplicar
      fP([X(v, 2, p * p), X(v, 1, 2 * p * q), N(-q * q)]), // último negativo
    ];
    qs.push(mc({ pts: 1, caso: "III", enunciado: `¿Cuál de estas expresiones es un trinomio cuadrado perfecto?`, _tcp: true }, tcp, opts));
  }
  { // 2 pts: valor de k
    const v = pick(["x", "y", "a"]); const p = ri(2, 6); let q; do { q = ri(1, 9); } while (q === p);
    qs.push(num({ pts: 2, caso: "III",
      enunciado: `¿Qué valor positivo debe tener k para que ${fP([X(v, 2, p * p)])} + k${v} + ${q * q} sea un trinomio cuadrado perfecto?`,
      pistas: [
        `En un trinomio cuadrado perfecto, los extremos son cuadrados: ${fP([X(v, 2, p * p)])} = (${fP([X(v, 1, p)])})² y ${q * q} = ${q}².`,
        `El término central es el doble del producto de esas dos raíces: 2 · ${fP([X(v, 1, p)])} · ${q}. Su coeficiente es k.`,
      ], _p: { p, q } }, 2 * p * q));
  }
  { // 2 pts: contexto
    let a, b; do { a = ri(2, 4); b = ri(1, 7); } while (gcd(a, b) !== 1); const x0 = ri(2, 8); const P = 4 * (a * x0 + b);
    qs.push(num({ pts: 2, caso: "III",
      enunciado: `Una sala de servidores cuadrada tiene un área de (${fP([X("x", 2, a * a), X("x", 1, 2 * a * b), N(b * b)])}) m². Si su perímetro es de ${P} m, ¿cuánto vale x?`,
      pistas: [
        `El área es un trinomio cuadrado perfecto. Factorízalo: el resultado (algo)² te dice cuánto mide el lado de la sala.`,
        `El lado mide (${fP([X("x", 1, a), N(b)])}) m. Como el perímetro es 4 veces el lado: 4(${fP([X("x", 1, a), N(b)])}) = ${P}. Despeja x.`,
      ], _p: { a, b, P } }, x0));
  }
  return qs;
}

function nivel4() { // Caso IV · Diferencia de cuadrados
  const qs = [];
  { // 1 pt
    const [u, w] = pick(VARS); let p, q; do { p = ri(2, 9); q = ri(1, 9); } while (gcd(p, q) !== 1);
    const e = fP([X(u, 2, p * p), X(w, 2, -q * q)]);
    qs.push(mc({ pts: 1, caso: "IV", enunciado: `Factoriza: ${e}`, _expr: e }, `${bin(X(u, 1, p), X(w, 1, q))}${bin(X(u, 1, p), X(w, 1, -q))}`, [
      `${bin(X(u, 1, p), X(w, 1, -q))}²`, `${bin(X(u, 1, p), X(w, 1, q))}²`, `${bin(X(u, 1, p * p), X(w, 1, q * q))}${bin(X(u, 1, p * p), X(w, 1, -q * q))}`,
    ]));
  }
  { // 2 pts: análisis de error (factor común + diferencia de cuadrados)
    let k, p, q; do { k = ri(2, 5); p = ri(2, 5); q = ri(1, 9); } while (gcd(p, q) !== 1);
    const e = fP([X("x", 2, k * p * p), N(-k * q * q)]);
    const mal = `${k}${bin(X("x", 1, p * p), N(q))}${bin(X("x", 1, p * p), N(-q))}`;
    qs.push(mc({ pts: 2, caso: "IV",
      enunciado: `Un compañero escribió: ${e} = ${k}(${fP([X("x", 2, p * p), N(-q * q)])}) = ${mal}. Tiene un error. ¿Cuál es la factorización correcta?`, _expr: e,
      pistas: [
        `El primer paso está bien: el factor común es ${k} y queda ${k}(${fP([X("x", 2, p * p), N(-q * q)])}). El error está en el segundo paso.`,
        `Para la diferencia de cuadrados necesitas las raíces: √(${fP([X("x", 2, p * p)])}) = ${fP([X("x", 1, p)])} (no ${fP([X("x", 1, p * p)])}) y √${q * q} = ${q}.`,
      ] }, `${k}${bin(X("x", 1, p), N(q))}${bin(X("x", 1, p), N(-q))}`, [mal, `${k}${bin(X("x", 1, p), N(-q))}²`, `${bin(X("x", 1, p), N(q))}${bin(X("x", 1, p), N(-q))}`]));
  }
  { // 2 pts: (x + a)² − b²
    let a, b; do { a = ri(1, 6); b = ri(2, 7); } while (a === b);
    qs.push(num({ pts: 2, caso: "IV",
      enunciado: `La expresión (x + ${a})² − ${b * b} se puede factorizar como (x + p)(x + q), con p mayor que q. ¿Cuánto vale p?`,
      pistas: [
        `Es una diferencia de cuadrados A² − B², donde A = (x + ${a}) y B = ${b}.`,
        `A² − B² = (A + B)(A − B) = (x + ${a} + ${b})(x + ${a} − ${b}). Simplifica cada factor y elige el mayor número.`,
      ], _p: { a, b } }, a + b));
  }
  return qs;
}

function nivel5() { // Caso VI · x² + bx + c
  const qs = [];
  { // 1 pt
    const v = pick(["x", "y", "m", "t"]); let r, s; do { r = ri(-9, 9); s = ri(-9, 9); } while (!r || !s || r === s || r + s === 0);
    const e = fP([X(v, 2), X(v, 1, r + s), N(r * s)]);
    const f = (a, b) => `${bin(X(v), N(a))}${bin(X(v), N(b))}`;
    qs.push(mc({ pts: 1, caso: "VI", enunciado: `Factoriza: ${e}`, _expr: e }, f(r, s), [f(-r, -s), f(r, -s), f(-r, s)]));
  }
  { // 2 pts: contar valores de c
    const b = ri(7, 14);
    qs.push(num({ pts: 2, caso: "VI",
      enunciado: `¿Cuántos valores enteros positivos distintos de c hacen que x² + ${b}x + c se pueda factorizar como (x + r)(x + s), con r y s números enteros positivos?`,
      pistas: [
        `Al multiplicar (x + r)(x + s) = x² + (r + s)x + r·s. Entonces r + s = ${b} y c = r · s. Cada pareja de enteros positivos que sume ${b} produce un valor de c.`,
        `Haz la lista: 1 + ${b - 1}, 2 + ${b - 2}, 3 + ${b - 3}, … La pareja 1 + ${b - 1} y la pareja ${b - 1} + 1 dan el mismo c, así que no las cuentes dos veces.`,
      ], _p: { b } }, Math.floor(b / 2)));
  }
  { // 2 pts: contexto
    let r, s; do { r = ri(2, 9); s = ri(2, 9); } while (r === s);
    const b = r + s, c = r * s;
    qs.push(mc({ pts: 2, caso: "VI",
      enunciado: `Un rack de servidores rectangular ocupa un área de (x² + ${b}x + ${c}) dm². Uno de sus lados mide (x + ${r}) dm. ¿Cuánto mide el otro lado?`,
      _expr: `x² + ${b}x + ${c}`, _side: r,
      pistas: [
        `El área de un rectángulo es lado × lado, así que x² + ${b}x + ${c} = (x + ${r})(x + ?). Factoriza el trinomio.`,
        `Busca el número que sumado con ${r} da ${b} y multiplicado por ${r} da ${c}.`,
      ] }, `(x + ${s}) dm`, [`(x − ${s}) dm`, `(x + ${c}) dm`, `(x + ${b}) dm`]));
  }
  return qs;
}

function nivel6() { // Integrador
  const qs = [];
  { // 1 pt: identificar el caso
    const CASOS = { I: "Caso I · Factor común", II: "Caso II · Agrupación de términos", III: "Caso III · Trinomio cuadrado perfecto", IV: "Caso IV · Diferencia de cuadrados", VI: "Caso VI · Trinomio x² + bx + c", NO: "No se puede factorizar en los números reales" };
    const tipo = pick(["I", "II", "III", "IV", "VI", "VI", "NO", "NO"]);
    let e;
    if (tipo === "I") { const g = ri(2, 6); e = fP([X("x", 3, g * ri(1, 4)), X("x", 2, -g * ri(1, 5))]); }
    if (tipo === "II") { const k = ri(2, 7), L = pick(["m", "a", "n"]); e = fP([X("x", 1, k), X("y", 1, k), M(1, { [L]: 1, x: 1 }), M(1, { [L]: 1, y: 1 })]); }
    if (tipo === "III") { let p, q; do { p = ri(2, 5); q = ri(1, 7); } while (gcd(p, q) !== 1); e = fP([X("x", 2, p * p), X("x", 1, 2 * p * q), N(q * q)]); }
    if (tipo === "IV") { let p, q; do { p = ri(2, 9); q = ri(1, 9); } while (gcd(p, q) !== 1); e = fP([X("y", 2, p * p), N(-q * q)]); }
    if (tipo === "VI") { let r, s; do { r = ri(1, 8); s = ri(2, 9); } while (r === s || Math.sqrt(r * s) % 1 === 0); e = fP([X("x", 2), X("x", 1, r + s), N(r * s)]); }
    if (tipo === "NO") { const q = ri(2, 9); e = fP([X("x", 2), N(q * q)]); }
    const otros = shuf(Object.keys(CASOS).filter((k) => k !== tipo)).slice(0, 3).map((k) => CASOS[k]);
    qs.push(mc({ pts: 1, caso: "Integrador", enunciado: `¿Qué caso de factorización se aplica a ${e}? Si no se puede factorizar en los números reales, elige esa opción.`, _caso: tipo, _e: e }, CASOS[tipo], otros));
  }
  { // 2 pts: factorización completa con dos casos
    const k = ri(2, 6), a = ri(2, 9), variante = pick(["IV", "III"]);
    if (variante === "IV") {
      const e = fP([X("x", 2, k), N(-k * a * a)]);
      qs.push(mc({ pts: 2, caso: "Integrador", enunciado: `Factoriza completamente: ${e}`, _expr: e,
        pistas: [`Empieza por el factor común: ${k} divide a los dos términos.`, `Después del factor común queda ${fP([X("x", 2), N(-a * a)])}, que es una diferencia de cuadrados.`] },
        `${k}${bin(X("x"), N(a))}${bin(X("x"), N(-a))}`, [`${k}${bin(X("x"), N(-a))}²`, `${bin(X("x"), N(a))}${bin(X("x"), N(-a))}`, `${k}${bin(X("x"), N(a * a))}${bin(X("x"), N(-a * a))}`]));
    } else {
      const e = fP([X("x", 2, k), X("x", 1, 2 * k * a), N(k * a * a)]);
      qs.push(mc({ pts: 2, caso: "Integrador", enunciado: `Factoriza completamente: ${e}`, _expr: e,
        pistas: [`Empieza por el factor común: ${k} divide a los tres términos.`, `Después del factor común queda ${fP([X("x", 2), X("x", 1, 2 * a), N(a * a)])}, que es un trinomio cuadrado perfecto.`] },
        `${k}${bin(X("x"), N(a))}²`, [`${bin(X("x"), N(a))}²`, `${k}${bin(X("x"), N(-a))}²`, `${k}${bin(X("x"), N(a))}${bin(X("x"), N(-a))}`]));
    }
  }
  { // 2 pts: agrupación + diferencia de cuadrados
    let p, q; do { p = ri(1, 6); q = ri(2, 7); } while (p === q);
    const ts = [X("x", 3), X("x", 2, p), X("x", 1, -q * q), N(-p * q * q)];
    qs.push(num({ pts: 2, caso: "Integrador",
      enunciado: `Factoriza completamente ${fP(ts)}. ¿Cuál es el mayor valor de x que hace que la expresión valga cero?`,
      pistas: [
        `Agrupa así: (${fP([ts[0], ts[1]])}) + (${fP([ts[2], ts[3]])}). Saca factor común en cada grupo: aparece el binomio (x + ${p}).`,
        `Queda (x + ${p})(x² − ${q * q}), y x² − ${q * q} es una diferencia de cuadrados. Un producto vale cero cuando alguno de sus factores vale cero.`,
      ], _p: { p, q } }, q));
  }
  return qs;
}

export const NIVELES = [
  { titulo: "Caso I · Factor común", gen: nivel1 },
  { titulo: "Caso II · Agrupación de términos", gen: nivel2 },
  { titulo: "Caso III · Trinomio cuadrado perfecto", gen: nivel3 },
  { titulo: "Caso IV · Diferencia de cuadrados", gen: nivel4 },
  { titulo: "Caso VI · Trinomio x² + bx + c", gen: nivel5 },
  { titulo: "Nivel final · Integrador", gen: nivel6 },
];

export function generarExamen() {
  const preguntas = [];
  NIVELES.forEach((N, n) => N.gen().forEach((q, i) => preguntas.push({ ...q, id: `n${n + 1}p${i + 1}`, nivel: n + 1, pistasUsadas: 0, respuesta: null, puntos: null })));
  return preguntas;
}

/* ===================== Servidor ===================== */
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const err = (msg, status = 400) => json({ error: msg }, status);
const MAT = /^\d{4}-\d{4}$/;
const DEF_CONFIG = { codigo: "", abierto: false, duracionMin: 120 };

function vistaPublica(ex) { // lo único que el navegador del estudiante puede ver
  const i = ex.preguntas.findIndex((q) => q.respuesta === null);
  const q = i >= 0 ? ex.preguntas[i] : null;
  return {
    nombre: ex.nombre, matricula: ex.matricula, fin: ex.fin || null, limite: ex.limite, ahora: Date.now(),
    niveles: NIVELES.map((N, n) => ({ titulo: N.titulo, total: 3, respondidas: ex.preguntas.filter((p) => p.nivel === n + 1 && p.respuesta !== null).length })),
    pregunta: q && !ex.fin ? {
      id: q.id, nivel: q.nivel, numero: i + 1, total: ex.preguntas.length, pts: q.pts, tipo: q.tipo, enunciado: q.enunciado,
      opciones: q.tipo === "mc" ? q.opciones : undefined,
      pistasDisponibles: q.pistas ? q.pistas.length : 0, pistas: q.pistas ? q.pistas.slice(0, q.pistasUsadas) : [],
    } : null,
  };
}

function finalizar(ex, motivo, cuando) {
  if (ex.fin) return;
  ex.preguntas.forEach((q) => { if (q.respuesta === null) { q.respuesta = "—"; q.puntos = 0; q.correcta_ok = false; } });
  ex.fin = cuando || Date.now(); ex.motivo = motivo;
}

const calificar = (q, resp) => {
  let ok = false;
  if (q.tipo === "mc") ok = Number(resp) === q.correcta;
  else { const n = Number(String(resp).replace(/[−–]/g, "-").replace(/\s/g, "")); ok = Number.isFinite(n) && n === q.correcta; }
  return { ok, puntos: ok ? Math.max(0, q.pts - q.pistasUsadas) : 0 };
};

export default async (req) => {
  if (req.method !== "POST") return err("Método no permitido", 405);
  const store = getStore({ name: "examen-final-factorizacion", consistency: "strong" });
  let b; try { b = await req.json(); } catch { return err("Solicitud inválida"); }
  const accion = String(b.accion || "");
  const config = { ...DEF_CONFIG, ...((await store.get("config", { type: "json" })) || {}) };

  /* ---------- Docente ---------- */
  const DOCENTE = ["config", "guardarConfig", "guardarLista", "verLista", "resultados", "reingreso", "cerrar", "borrarExamenes"];
  if (DOCENTE.includes(accion)) {
    const clave = process.env.DOCENTE_CLAVE;
    if (!clave || req.headers.get("x-clave") !== clave) return err("Clave incorrecta", 401);
    if (accion === "config") return json({ config });
    if (accion === "guardarConfig") {
      const nuevo = { ...config };
      if (typeof b.codigo === "string") nuevo.codigo = b.codigo.trim().toUpperCase().slice(0, 12);
      if (typeof b.abierto === "boolean") nuevo.abierto = b.abierto;
      if (Number.isInteger(b.duracionMin) && b.duracionMin >= 10 && b.duracionMin <= 240) nuevo.duracionMin = b.duracionMin;
      if (nuevo.abierto && !nuevo.codigo) return err("Define un código de acceso antes de abrir el examen.");
      await store.setJSON("config", nuevo); return json({ config: nuevo });
    }
    if (accion === "guardarLista") {
      if (!Array.isArray(b.lista) || !b.lista.length) return err("La lista está vacía.");
      const lista = {};
      for (const e of b.lista.slice(0, 200)) { const m = String(e.matricula || "").trim(), n = String(e.nombre || "").trim().replace(/\s+/g, " ").slice(0, 80); if (MAT.test(m) && n) lista[m] = n; }
      if (!Object.keys(lista).length) return err("No se encontró ninguna matrícula válida.");
      await store.setJSON("lista", lista); return json({ total: Object.keys(lista).length });
    }
    if (accion === "verLista") return json({ lista: (await store.get("lista", { type: "json" })) || {} });
    if (accion === "resultados" || accion === "cerrar") {
      const { blobs } = await store.list({ prefix: "ex/" });
      const exs = (await Promise.all(blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
      const ahora = Date.now();
      for (const ex of exs) {
        let cambio = false;
        if (!ex.fin && ahora > ex.limite) { finalizar(ex, "tiempo", ex.limite); cambio = true; }
        if (!ex.fin && accion === "cerrar") { finalizar(ex, "cerrado", ahora); cambio = true; }
        if (cambio) await store.setJSON("ex/" + ex.matricula, ex);
      }
      if (accion === "cerrar") { config.abierto = false; await store.setJSON("config", config); }
      const lista = (await store.get("lista", { type: "json" })) || {};
      const out = exs.map((ex) => ({ ...ex, token: undefined, preguntas: ex.preguntas.map((q) => ({
        id: q.id, nivel: q.nivel, caso: q.caso, pts: q.pts, tipo: q.tipo, enunciado: q.enunciado, opciones: q.opciones,
        correcta: q.tipo === "mc" ? q.opciones[q.correcta] : q.correcta,
        respuesta: q.tipo === "mc" && q.respuesta !== null && q.respuesta !== "—" ? q.opciones[q.respuesta] : q.respuesta,
        ok: !!q.correcta_ok, pistasUsadas: q.pistasUsadas, puntos: q.puntos })) }));
      return json({ examenes: out, lista, config, ahora });
    }
    if (accion === "reingreso") {
      const m = String(b.matricula || ""); const ex = await store.get("ex/" + m, { type: "json" });
      if (!ex) return err("Ese estudiante no ha iniciado el examen.");
      ex.reingreso = true; await store.setJSON("ex/" + m, ex); return json({ ok: true });
    }
    if (accion === "borrarExamenes") {
      const { blobs } = await store.list({ prefix: "ex/" });
      await Promise.all(blobs.map((x) => store.delete(x.key)));
      return json({ ok: true, borrados: blobs.length });
    }
  }

  /* ---------- Estudiante ---------- */
  const m = String(b.matricula || "").trim();
  if (!MAT.test(m)) return err("Escribe tu matrícula con el formato 2026-0000.");

  if (accion === "buscar" || accion === "iniciar") {
    if (!config.abierto) return err("El examen no está abierto en este momento.");
    if (String(b.codigo || "").trim().toUpperCase() !== config.codigo) return err("El código de acceso no es correcto. Pídelo al docente.");
    const lista = (await store.get("lista", { type: "json" })) || {};
    const nombre = lista[m];
    if (!nombre) return err("Esa matrícula no está en la lista de esta sección. Revísala o consulta al docente.");
    if (accion === "buscar") return json({ nombre });

    let ex = await store.get("ex/" + m, { type: "json" });
    if (ex) {
      if (!ex.fin && Date.now() > ex.limite) { finalizar(ex, "tiempo", ex.limite); await store.setJSON("ex/" + m, ex); }
      if (ex.fin) return json({ enviado: true, nombre: ex.nombre });
      if (b.token && b.token === ex.token) return json({ token: ex.token, estado: vistaPublica(ex) });
      if (ex.reingreso) {
        ex.token = randomBytes(24).toString("hex"); ex.reingreso = false; ex.reingresos = (ex.reingresos || 0) + 1;
        await store.setJSON("ex/" + m, ex); return json({ token: ex.token, estado: vistaPublica(ex) });
      }
      return err("Ya iniciaste el examen en otro dispositivo. Pide al docente que autorice tu reingreso.", 409);
    }
    const ahora = Date.now();
    ex = { matricula: m, nombre, token: randomBytes(24).toString("hex"), inicio: ahora, limite: ahora + config.duracionMin * 60000, fin: null, motivo: null, salidas: [], reingresos: 0, preguntas: generarExamen() };
    await store.setJSON("ex/" + m, ex);
    return json({ token: ex.token, estado: vistaPublica(ex) });
  }

  // Acciones con sesión iniciada
  const ex = await store.get("ex/" + m, { type: "json" });
  if (!ex || !b.token || b.token !== ex.token) return err("Tu sesión no es válida. Vuelve a entrar con tu matrícula.", 401);
  if (!ex.fin && Date.now() > ex.limite) { finalizar(ex, "tiempo", ex.limite); await store.setJSON("ex/" + m, ex); }
  if (ex.fin) return json({ enviado: true, nombre: ex.nombre });

  if (accion === "evento") {
    if (b.tipo === "salida") { ex.salidas.push(Date.now()); ex.salidas = ex.salidas.slice(-200); await store.setJSON("ex/" + m, ex); }
    return json({ ok: true });
  }
  const i = ex.preguntas.findIndex((q) => q.respuesta === null);
  const q = ex.preguntas[i];
  if (!q || b.id !== q.id) return json({ estado: vistaPublica(ex) }); // pregunta ya respondida: devolver estado actual

  if (accion === "pista") {
    if (!q.pistas || q.pistasUsadas >= q.pistas.length) return json({ estado: vistaPublica(ex) });
    q.pistasUsadas++; await store.setJSON("ex/" + m, ex); return json({ estado: vistaPublica(ex) });
  }
  if (accion === "responder") {
    const r = b.respuesta;
    if (q.tipo === "mc" && !(Number.isInteger(r) && r >= 0 && r < q.opciones.length)) return err("Elige una opción.");
    if (q.tipo === "num" && !/^\s*[-−–]?\s*\d+\s*$/.test(String(r ?? ""))) return err("Escribe un número entero.");
    const { ok, puntos } = calificar(q, r);
    q.respuesta = q.tipo === "mc" ? r : String(r).replace(/[−–]/g, "-").replace(/\s/g, ""); q.correcta_ok = ok; q.puntos = puntos; q.respondida = Date.now();
    if (ex.preguntas.every((p) => p.respuesta !== null)) finalizar(ex, "enviado");
    await store.setJSON("ex/" + m, ex);
    return ex.fin ? json({ enviado: true, nombre: ex.nombre }) : json({ estado: vistaPublica(ex) });
  }
  return err("Acción desconocida");
};

export const config = { path: "/api/examen" };
