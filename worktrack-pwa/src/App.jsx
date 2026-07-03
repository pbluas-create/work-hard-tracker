import React, { useState, useEffect, useCallback } from "react";
import {
  Home, PlusCircle, TrendingUp, UserCircle2, Flame, Check, X,
  Dumbbell, Bike, Salad, ChevronRight, Save, Loader2, Trash2, Target, Utensils, Plus,
  Ruler, TestTube2, AlertTriangle, ListChecks, Layers, Clock, Moon
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

/* ---------------------------------------------------------
   TOKENS
   bg #12151A · surface #1B1F26 · surface2 #232830
   green (shorts) #2E7D46 / bright #4CD97B
   ember (energy/streak) #E4572E · protein #4CD97B · carbs #E4B93E · fat #6EA8E0
   text #F5F3EE · muted #9BA3AC · border #2A2F37
---------------------------------------------------------- */

const WORKOUT_TYPES = [
  { id: "fuerza_sup", label: "Fuerza – tren superior", icon: Dumbbell },
  { id: "fuerza_inf", label: "Fuerza – tren inferior", icon: Dumbbell },
  { id: "full_body", label: "Full body", icon: Dumbbell },
  { id: "bici", label: "Bici / Cardio", icon: Bike },
  { id: "descanso", label: "Descanso activo", icon: Salad },
];

const EQUIPO_OPTS = ["Mancuernas", "Barra", "Bandas elásticas", "Banco", "Barra de dominadas", "Kettlebells", "Solo peso corporal", "Bicicleta"];

const QUICK_FOODS = [
  { nombre: "Arroz cocido (1 taza)", calorias: 240, proteina: 4.4, carbohidratos: 53, grasa: 0.4 },
  { nombre: "Pechuga de pollo (100g)", calorias: 165, proteina: 31, carbohidratos: 0, grasa: 3.6 },
  { nombre: "Palta (1/2 unidad)", calorias: 160, proteina: 2, carbohidratos: 8.5, grasa: 14.7 },
  { nombre: "Pan marraqueta (1 unidad)", calorias: 250, proteina: 8, carbohidratos: 48, grasa: 2 },
  { nombre: "Huevo (1 unidad)", calorias: 78, proteina: 6.3, carbohidratos: 0.6, grasa: 5.3 },
  { nombre: "Plátano (1 unidad)", calorias: 105, proteina: 1.3, carbohidratos: 27, grasa: 0.3 },
  { nombre: "Lentejas cocidas (1 taza)", calorias: 230, proteina: 18, carbohidratos: 40, grasa: 0.8 },
  { nombre: "Leche descremada (1 taza)", calorias: 90, proteina: 9, carbohidratos: 12, grasa: 0.5 },
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- workout plan: exercise library + program builder ---------------- */

const SLOT_LIBRARY = {
  sentadilla: [
    { equip: "Mancuernas", name: "Sentadilla goblet con mancuerna", sets: "4×12" },
    { equip: "Kettlebells", name: "Sentadilla goblet con kettlebell", sets: "4×12" },
    { equip: null, name: "Sentadilla con peso corporal", sets: "4×18" },
  ],
  zancada: [
    { equip: "Mancuernas", name: "Zancadas con mancuernas", sets: "3×12 c/pierna" },
    { equip: null, name: "Zancadas con peso corporal", sets: "3×15 c/pierna" },
  ],
  bisagra_cadera: [
    { equip: "Mancuernas", name: "Peso muerto rumano con mancuernas", sets: "4×12" },
    { equip: "Kettlebells", name: "Peso muerto rumano con kettlebell", sets: "4×12" },
    { equip: null, name: "Puente de glúteo a una pierna", sets: "4×15 c/lado" },
  ],
  gluteo: [
    { equip: "Banco", name: "Hip thrust en banco", sets: "4×15" },
    { equip: null, name: "Puente de glúteo", sets: "4×20" },
  ],
  pantorrilla: [
    { equip: null, name: "Elevación de talones de pie", sets: "4×20" },
  ],
  empuje_horizontal: [
    { equip: "Banco", name: "Press banca con mancuernas", sets: "4×10" },
    { equip: "Mancuernas", name: "Press de mancuernas en el suelo", sets: "4×10" },
    { equip: null, name: "Flexiones de pecho (push-ups)", sets: "4×AMRAP" },
  ],
  empuje_vertical: [
    { equip: "Mancuernas", name: "Press militar con mancuernas", sets: "3×10" },
    { equip: "Bandas elásticas", name: "Press de hombro con banda", sets: "3×15" },
    { equip: null, name: "Flexiones pike (pike push-ups)", sets: "3×AMRAP" },
  ],
  traccion_horizontal: [
    { equip: "Mancuernas", name: "Remo con mancuerna a una mano", sets: "4×10 c/lado" },
    { equip: "Bandas elásticas", name: "Remo con banda elástica", sets: "4×15" },
    { equip: null, name: "Remo invertido (mesa o toalla en puerta)", sets: "4×AMRAP" },
  ],
  traccion_vertical: [
    { equip: "Barra de dominadas", name: "Dominadas (o negativas asistidas)", sets: "4×AMRAP" },
    { equip: "Bandas elásticas", name: "Jalón con banda elástica", sets: "4×15" },
    { equip: null, name: "Remo invertido inclinado", sets: "4×12" },
  ],
  biceps: [
    { equip: "Mancuernas", name: "Curl de bíceps con mancuernas", sets: "3×12" },
    { equip: "Bandas elásticas", name: "Curl de bíceps con banda", sets: "3×15" },
  ],
  triceps: [
    { equip: "Banco", name: "Fondos en banco (dips)", sets: "3×12" },
    { equip: "Bandas elásticas", name: "Extensión de tríceps con banda", sets: "3×15" },
    { equip: null, name: "Flexiones de agarre cerrado", sets: "3×AMRAP" },
  ],
  core: [
    { equip: null, name: "Plancha + elevación de piernas", sets: "3×40s / 3×15" },
  ],
  cardio: [
    { equip: null, name: "Bicicleta (rodillo o ruta), ritmo moderado", sets: "40–60 min" },
  ],
};

function pickVariant(slotKey, equipo) {
  const variants = SLOT_LIBRARY[slotKey] || [];
  const conEquipo = variants.find(v => v.equip && equipo.includes(v.equip));
  return conEquipo || variants.find(v => !v.equip) || variants[0];
}

const FULL_BODY_TEMPLATE = [
  { titulo: "Full Body A", slots: ["sentadilla", "empuje_horizontal", "traccion_horizontal", "bisagra_cadera", "core"] },
  { titulo: "Full Body B", slots: ["zancada", "empuje_vertical", "traccion_vertical", "gluteo", "core"] },
  { titulo: "Full Body C", slots: ["sentadilla", "traccion_horizontal", "empuje_horizontal", "bisagra_cadera", "core"] },
];
const UPPER_LOWER_TEMPLATE = [
  { titulo: "Tren Superior A", slots: ["empuje_horizontal", "traccion_horizontal", "empuje_vertical", "biceps", "triceps"] },
  { titulo: "Tren Inferior A", slots: ["sentadilla", "bisagra_cadera", "zancada", "gluteo", "pantorrilla"] },
  { titulo: "Tren Superior B", slots: ["traccion_vertical", "empuje_horizontal", "traccion_horizontal", "biceps", "triceps"] },
  { titulo: "Tren Inferior B", slots: ["zancada", "gluteo", "sentadilla", "bisagra_cadera", "core"] },
];
const PPL_TEMPLATE = [
  { titulo: "Push (empuje)", slots: ["empuje_horizontal", "empuje_vertical", "triceps", "core"] },
  { titulo: "Pull (tracción)", slots: ["traccion_horizontal", "traccion_vertical", "biceps", "core"] },
  { titulo: "Legs (piernas)", slots: ["sentadilla", "bisagra_cadera", "zancada", "gluteo", "pantorrilla"] },
];

function buildProgram(diasSemana) {
  const dias = Number(diasSemana) || 4;
  if (dias <= 3) return FULL_BODY_TEMPLATE.slice(0, Math.max(2, dias));
  if (dias === 4) return UPPER_LOWER_TEMPLATE;
  if (dias === 5) return [...PPL_TEMPLATE, UPPER_LOWER_TEMPLATE[0], { titulo: "Cardio / Bici", slots: ["cardio"] }];
  return [...PPL_TEMPLATE, ...PPL_TEMPLATE];
}

const FASES = [
  { nombre: "Fase 1 · Adaptación", periodo: "Semanas 1–4", foco: "Aprender la técnica de cada ejercicio y activar la musculatura. Intensidad moderada (RPE 6–7/10).", progresion: "Mantén el mismo peso/dificultad toda la fase. Prioriza la técnica sobre la carga." },
  { nombre: "Fase 2 · Progresión", periodo: "Semanas 5–16", foco: "Aumentar volumen e intensidad de forma gradual.", progresion: "Cada 2 semanas: suma 1–2 repeticiones por serie, o un poco más de peso/dificultad cuando completes todas las reps con buena técnica." },
  { nombre: "Fase 3 · Intensificación", periodo: "Semana 17 en adelante", foco: "Maximizar definición y fuerza con mayor densidad de entrenamiento.", progresion: "Reduce los descansos 15–30s, añade una serie extra en los ejercicios principales, y ajusta calorías según tus resultados reales." },
];

/* ---------------- nutrition plan: meal distribution + plate guide ---------------- */

const MEAL_TEMPLATES = {
  1: [{ n: "Comida única", p: 100 }],
  2: [{ n: "Almuerzo", p: 55 }, { n: "Cena", p: 45 }],
  3: [{ n: "Desayuno", p: 25 }, { n: "Almuerzo", p: 40 }, { n: "Cena", p: 35 }],
  4: [{ n: "Desayuno", p: 25 }, { n: "Almuerzo", p: 35 }, { n: "Once", p: 15 }, { n: "Cena", p: 25 }],
  5: [{ n: "Desayuno", p: 20 }, { n: "Colación", p: 10 }, { n: "Almuerzo", p: 30 }, { n: "Once", p: 15 }, { n: "Cena", p: 25 }],
};

function distributeMeals(comidasDia, kcalTotal) {
  const tpl = MEAL_TEMPLATES[Number(comidasDia)] || MEAL_TEMPLATES[4];
  return tpl.map(t => ({ ...t, kcal: kcalTotal ? Math.round((kcalTotal * t.p) / 100) : null }));
}

const PLATE_GUIDE = [
  { grupo: "Proteínas", color: "#4CD97B", ejemplos: ["Pollo", "Pavo", "Pescado (jurel, atún, salmón)", "Huevos", "Carne magra", "Legumbres", "Yogur griego", "Queso fresco"] },
  { grupo: "Carbohidratos", color: "#E4B93E", ejemplos: ["Arroz", "Papas", "Fideos integrales", "Avena", "Pan integral", "Quinoa", "Choclo", "Legumbres"] },
  { grupo: "Grasas saludables", color: "#6EA8E0", ejemplos: ["Palta", "Aceite de oliva", "Frutos secos", "Semillas (chía, maravilla)", "Mantequilla de maní natural"] },
  { grupo: "Vegetales", color: "#9BDB8E", ejemplos: ["Ensaladas variadas", "Brócoli", "Zapallo italiano", "Espinaca", "Tomate", "Zanahoria", "Pepino"] },
];

const PRINCIPIOS_ALIMENTACION = [
  "Toma 2–3 litros de agua al día.",
  "Incluye una fuente de proteína en cada comida principal.",
  "Llena al menos la mitad del plato con vegetales en almuerzo y cena.",
  "Deja los ultraprocesados y azúcar añadida para el consumo ocasional, no diario.",
  "Planifica tus comidas con anticipación cuando puedas — reduce decisiones de último minuto.",
  "Una comida libre ocasional no arruina el plan; la adherencia sostenida importa más que la perfección.",
];

function useStorage() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [foodlog, setFoodlog] = useState({});
  const [measurements, setMeasurements] = useState([]);
  const [bloodwork, setBloodwork] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let p = null, e = [], f = {}, m = [], b = [];
        try { const r = await window.storage.get("profile", false); if (r) p = JSON.parse(r.value); } catch (_) {}
        try { const r = await window.storage.get("entries", false); if (r) e = JSON.parse(r.value); } catch (_) {}
        try { const r = await window.storage.get("foodlog", false); if (r) f = JSON.parse(r.value); } catch (_) {}
        try { const r = await window.storage.get("measurements", false); if (r) m = JSON.parse(r.value); } catch (_) {}
        try { const r = await window.storage.get("bloodwork", false); if (r) b = JSON.parse(r.value); } catch (_) {}
        setProfile(p);
        setEntries(Array.isArray(e) ? e : []);
        setFoodlog(f && typeof f === "object" ? f : {});
        setMeasurements(Array.isArray(m) ? m : []);
        setBloodwork(Array.isArray(b) ? b : []);
      } catch (err) {
        setError("No se pudo cargar la información guardada.");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (p) => {
    setProfile(p);
    try { await window.storage.set("profile", JSON.stringify(p), false); }
    catch (_) { setError("No se pudo guardar el perfil."); }
  }, []);

  const saveEntries = useCallback(async (list) => {
    setEntries(list);
    try { await window.storage.set("entries", JSON.stringify(list), false); }
    catch (_) { setError("No se pudo guardar el registro."); }
  }, []);

  const saveFoodlog = useCallback(async (obj) => {
    setFoodlog(obj);
    try { await window.storage.set("foodlog", JSON.stringify(obj), false); }
    catch (_) { setError("No se pudo guardar la alimentación."); }
  }, []);

  const saveMeasurements = useCallback(async (list) => {
    setMeasurements(list);
    try { await window.storage.set("measurements", JSON.stringify(list), false); }
    catch (_) { setError("No se pudo guardar las mediciones."); }
  }, []);

  const saveBloodwork = useCallback(async (list) => {
    setBloodwork(list);
    try { await window.storage.set("bloodwork", JSON.stringify(list), false); }
    catch (_) { setError("No se pudo guardar el examen."); }
  }, []);

  return {
    ready, profile, entries, foodlog, measurements, bloodwork,
    saveProfile, saveEntries, saveFoodlog, saveMeasurements, saveBloodwork,
    error, setError,
  };
}

/* ---------------- nutrition helpers ---------------- */

function calcAutoTargets(profile, pesoActual) {
  if (!profile) return null;
  const edad = Number(profile.edad), altura = Number(profile.altura);
  const peso = Number(pesoActual || profile.pesoInicio);
  if (!edad || !altura || !peso || !profile.sexo) return null;
  const bmr = profile.sexo === "F" ? 10 * peso + 6.25 * altura - 5 * edad - 161 : 10 * peso + 6.25 * altura - 5 * edad + 5;
  const factorMap = { sedentario: 1.2, moderado: 1.375, activo: 1.55 };
  const factor = factorMap[profile.actividadDiaria] || 1.375;
  const tdee = bmr * factor;
  const adjMap = { grasa: 0.8, musculo: 1.1, recomposicion: 0.9 };
  const calorias = tdee * (adjMap[profile.objetivo] || 1);
  const proteina = peso * 2;
  const grasa = (calorias * 0.25) / 9;
  const carbohidratos = Math.max(0, (calorias - proteina * 4 - grasa * 9) / 4);
  return {
    calorias: Math.round(calorias), proteina: Math.round(proteina),
    grasa: Math.round(grasa), carbohidratos: Math.round(carbohidratos),
  };
}

function getTargets(profile, pesoActual) {
  const auto = calcAutoTargets(profile, pesoActual);
  if (!profile) return auto;
  return {
    calorias: profile.overrideCalorias ? Number(profile.overrideCalorias) : auto?.calorias ?? null,
    proteina: profile.overrideProteina ? Number(profile.overrideProteina) : auto?.proteina ?? null,
    carbohidratos: profile.overrideCarbos ? Number(profile.overrideCarbos) : auto?.carbohidratos ?? null,
    grasa: profile.overrideGrasa ? Number(profile.overrideGrasa) : auto?.grasa ?? null,
  };
}

function sumFoods(list) {
  return (list || []).reduce((acc, f) => ({
    calorias: acc.calorias + (Number(f.calorias) || 0),
    proteina: acc.proteina + (Number(f.proteina) || 0),
    carbohidratos: acc.carbohidratos + (Number(f.carbohidratos) || 0),
    grasa: acc.grasa + (Number(f.grasa) || 0),
  }), { calorias: 0, proteina: 0, carbohidratos: 0, grasa: 0 });
}

/* ---------------- health helpers (bloodwork classification) ----------------
   Rangos referenciales generales para adultos, solo informativos.
   No reemplazan la evaluación de un profesional de la salud. */

const RANGE_COLORS = { normal: "#4CD97B", atencion: "#E4B93E", alto: "#E4572E" };

const BLOOD_METRICS = [
  { key: "glucosa", label: "Glucosa en ayunas", unit: "mg/dL",
    classify: v => v < 100 ? "normal" : v < 126 ? "atencion" : "alto" },
  { key: "colesterolTotal", label: "Colesterol total", unit: "mg/dL",
    classify: v => v < 200 ? "normal" : v < 240 ? "atencion" : "alto" },
  { key: "hdl", label: "Colesterol HDL", unit: "mg/dL",
    classify: v => v >= 60 ? "normal" : v >= 40 ? "atencion" : "alto" },
  { key: "ldl", label: "Colesterol LDL", unit: "mg/dL",
    classify: v => v < 100 ? "normal" : v < 160 ? "atencion" : "alto" },
  { key: "trigliceridos", label: "Triglicéridos", unit: "mg/dL",
    classify: v => v < 150 ? "normal" : v < 200 ? "atencion" : "alto" },
  { key: "hba1c", label: "Hemoglobina glicosilada (HbA1c)", unit: "%",
    classify: v => v < 5.7 ? "normal" : v < 6.5 ? "atencion" : "alto" },
];

function classifyPresion(sist, dias) {
  if (!sist || !dias) return null;
  if (sist < 120 && dias < 80) return "normal";
  if (sist < 130 && dias < 80) return "atencion";
  return "alto";
}

const RANGE_LABEL = { normal: "Normal", atencion: "Atención", alto: "Alto" };

function MetricChip({ label, value, unit, status }) {
  const color = status ? RANGE_COLORS[status] : "#6B7280";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid #232830",
    }}>
      <span style={{ color: "#C9CED4", fontSize: 13 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 13 }}>{value}{unit}</span>
        {status && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, color, background: `${color}22`,
            borderRadius: 6, padding: "2px 7px", textTransform: "uppercase",
          }}>{RANGE_LABEL[status]}</span>
        )}
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9BA3AC", marginBottom: 6 }}>
        {label}
      </div>
      {children}
      {hint && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: "#1B1F26", border: "1px solid #2A2F37",
  borderRadius: 10, padding: "12px 14px", color: "#F5F3EE", fontSize: 15, outline: "none",
};
function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function Select(props) { return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }

function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "9px 14px", borderRadius: 999, border: `1px solid ${active ? "#4CD97B" : "#2A2F37"}`,
      background: active ? "rgba(76,217,123,0.14)" : "#1B1F26", color: active ? "#4CD97B" : "#C9CED4",
      fontSize: 13, fontWeight: 600, cursor: "pointer", margin: "0 8px 8px 0",
    }}>{children}</button>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#1B1F26", border: "1px solid #2A2F37", borderRadius: 16, padding: 18, ...style }}>{children}</div>;
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Archivo Black', 'Arial Black', sans-serif", fontSize: 13, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#4CD97B", marginBottom: 12, marginTop: 26,
    }}>{children}</div>
  );
}

const btnPrimary = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: "#2E7D46", color: "#F5F3EE", border: "none", borderRadius: 12,
  padding: "13px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer",
};
const btnGhost = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: "transparent", color: "#F5F3EE", border: "1px solid #2A2F37", borderRadius: 12,
  padding: "13px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer",
};

function MacroBar({ label, consumed, target, color }) {
  const pct = target ? Math.min(100, (consumed / target) * 100) : 0;
  const restante = target != null ? Math.round((target - consumed) * 10) / 10 : null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12.5 }}>
        <span style={{ color: "#F5F3EE", fontWeight: 700 }}>{label}</span>
        <span style={{ color: "#9BA3AC" }}>
          {Math.round(consumed * 10) / 10}g {target != null ? `/ ${target}g` : ""}
          {target != null && (
            <span style={{ color: restante < 0 ? "#E4572E" : "#4CD97B", marginLeft: 6, fontWeight: 700 }}>
              {restante < 0 ? `${Math.abs(restante)}g de más` : `${restante}g restantes`}
            </span>
          )}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "#232830", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({ profile, entries, foodlog, goTo }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const pesoInicio = profile?.pesoInicio ? Number(profile.pesoInicio) : (first ? Number(first.peso) : null);
  const pesoActual = last ? Number(last.peso) : pesoInicio;
  const pesoObjetivo = profile?.pesoObjetivo ? Number(profile.pesoObjetivo) : null;

  const fechaInicio = profile?.fechaInicio || (first && first.date) || todayStr();
  const semanaActual = Math.max(1, Math.ceil((new Date(todayStr()) - new Date(fechaInicio)) / (7 * 86400000)) + 1);
  const semanaTotal = profile?.plazoMeses ? Math.round(Number(profile.plazoMeses) * 4.345) : 52;

  let streak = 0;
  {
    const set = new Set(entries.map(e => e.date));
    let cursor = new Date();
    while (true) {
      const ds = cursor.toISOString().slice(0, 10);
      if (set.has(ds)) { streak++; cursor.setDate(cursor.getDate() - 1); } else break;
    }
  }

  const last7 = new Set([...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10); }));
  const entrenosSemana = entries.filter(e => last7.has(e.date) && e.entrenoHecho).length;
  const metaSemana = profile?.diasSemana ? Number(profile.diasSemana) : 4;

  const progresoPct = (pesoInicio && pesoObjetivo && pesoActual != null)
    ? Math.min(100, Math.max(0, ((pesoInicio - pesoActual) / (pesoInicio - pesoObjetivo)) * 100)) : null;

  const targets = getTargets(profile, pesoActual);
  const hoy = sumFoods(foodlog[todayStr()]);
  const restanteCal = targets?.calorias != null ? Math.round(targets.calorias - hoy.calorias) : null;

  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 26, color: "#F5F3EE" }}>
        Hola{profile?.nombre ? `, ${profile.nombre}` : ""}
      </div>
      <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 20 }}>Semana {semanaActual} de {semanaTotal}</div>

      <Card style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
        <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
          <svg width="92" height="92" viewBox="0 0 92 92">
            <circle cx="46" cy="46" r="40" fill="none" stroke="#232830" strokeWidth="9" />
            <circle cx="46" cy="46" r="40" fill="none" stroke="#4CD97B" strokeWidth="9"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - (progresoPct ?? 0) / 100)}
              strokeLinecap="round" transform="rotate(-90 46 46)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 18, color: "#F5F3EE" }}>
              {progresoPct != null ? `${Math.round(progresoPct)}%` : "–"}
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#9BA3AC", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>Peso actual</div>
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 30, color: "#F5F3EE", lineHeight: 1.1 }}>
            {pesoActual != null ? `${pesoActual} kg` : "—"}
          </div>
          <div style={{ fontSize: 13, color: "#9BA3AC" }}>Meta: {pesoObjetivo ? `${pesoObjetivo} kg` : "sin definir"}</div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <Flame size={20} color="#E4572E" style={{ marginBottom: 6 }} />
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE" }}>{streak}</div>
          <div style={{ fontSize: 11, color: "#9BA3AC", textTransform: "uppercase", fontWeight: 700 }}>Racha (días)</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <Dumbbell size={20} color="#4CD97B" style={{ marginBottom: 6 }} />
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE" }}>{entrenosSemana}/{metaSemana}</div>
          <div style={{ fontSize: 11, color: "#9BA3AC", textTransform: "uppercase", fontWeight: 700 }}>Entrenos semana</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 14, cursor: "pointer" }} onClick={() => goTo("comida")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Utensils size={16} color="#E4B93E" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#9BA3AC" }}>Calorías hoy</span>
          </div>
          <ChevronRight size={16} color="#6B7280" />
        </div>
        {targets?.calorias ? (
          <>
            <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE" }}>
              {Math.round(hoy.calorias)} <span style={{ fontSize: 14, color: "#9BA3AC", fontFamily: "Inter" }}>/ {targets.calorias} kcal</span>
            </div>
            <div style={{ fontSize: 12.5, color: restanteCal < 0 ? "#E4572E" : "#4CD97B", fontWeight: 700, marginTop: 2 }}>
              {restanteCal < 0 ? `${Math.abs(restanteCal)} kcal de más` : `${restanteCal} kcal restantes`}
            </div>
          </>
        ) : (
          <div style={{ color: "#9BA3AC", fontSize: 13 }}>Completa tu perfil para calcular tu meta calórica.</div>
        )}
      </Card>

      {!profile && (
        <Card style={{ marginBottom: 14, borderColor: "#E4572E" }}>
          <div style={{ color: "#F5F3EE", fontWeight: 700, marginBottom: 6 }}>Aún no completas tu perfil</div>
          <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 12 }}>Completa tus datos para calcular tu plan y tu progreso correctamente.</div>
          <button onClick={() => goTo("perfil")} style={btnPrimary}>Completar perfil <ChevronRight size={16} /></button>
        </Card>
      )}

      {profile && (
        <button onClick={() => goTo("plan")} style={{ ...btnPrimary, width: "100%", marginBottom: 10 }}>
          <ListChecks size={18} /> Ver mi plan
        </button>
      )}

      <button onClick={() => goTo("registro")} style={{ ...btnGhost, width: "100%", marginBottom: 10 }}>
        <PlusCircle size={18} /> Registrar hoy
      </button>
      <button onClick={() => goTo("progreso")} style={{ ...btnGhost, width: "100%" }}>
        <TrendingUp size={18} /> Ver progreso
      </button>
    </div>
  );
}

/* ---------------- Registro (log entry) ---------------- */

function Registro({ entries, saveEntries, goTo }) {
  const existing = entries.find(e => e.date === todayStr());
  const [peso, setPeso] = useState(existing?.peso || "");
  const [tipo, setTipo] = useState(existing?.tipo || "fuerza_sup");
  const [entrenoHecho, setEntrenoHecho] = useState(existing?.entrenoHecho ?? false);
  const [duracion, setDuracion] = useState(existing?.duracion || "");
  const [apego, setApego] = useState(existing?.apego ?? 3);
  const [notas, setNotas] = useState(existing?.notas || "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const entry = { date: todayStr(), peso: peso ? Number(peso) : null, tipo, entrenoHecho, duracion: duracion ? Number(duracion) : null, apego: Number(apego), notas };
    const rest = entries.filter(e => e.date !== todayStr());
    await saveEntries([...rest, entry]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE", marginBottom: 4 }}>Registro de hoy</div>
      <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 20 }}>{todayStr()}</div>

      <Field label="Peso corporal (kg)">
        <TextInput type="number" step="0.1" placeholder="Ej: 92.4" value={peso} onChange={e => setPeso(e.target.value)} />
      </Field>

      <Field label="¿Entrenaste hoy?">
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setEntrenoHecho(true)} style={{ ...toggleBtn, ...(entrenoHecho ? toggleOn : {}) }}><Check size={16} /> Sí</button>
          <button type="button" onClick={() => setEntrenoHecho(false)} style={{ ...toggleBtn, ...(!entrenoHecho ? toggleOff : {}) }}><X size={16} /> No</button>
        </div>
      </Field>

      {entrenoHecho && (
        <>
          <Field label="Tipo de entrenamiento">
            <Select value={tipo} onChange={e => setTipo(e.target.value)}>
              {WORKOUT_TYPES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
            </Select>
          </Field>
          <Field label="Duración (minutos)">
            <TextInput type="number" placeholder="Ej: 45" value={duracion} onChange={e => setDuracion(e.target.value)} />
          </Field>
        </>
      )}

      <Field label={`Apego a la alimentación del plan hoy: ${apego}/5`}>
        <input type="range" min="1" max="5" value={apego} onChange={e => setApego(e.target.value)} style={{ width: "100%" }} />
      </Field>

      <Field label="Notas (opcional)">
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Cómo te sentiste, dolores, ánimo..." />
      </Field>

      <button onClick={handleSave} style={{ ...btnPrimary, width: "100%", marginTop: 8 }}>
        <Save size={18} /> {saved ? "Guardado ✓" : "Guardar registro"}
      </button>
    </div>
  );
}

const toggleBtn = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "11px 0", borderRadius: 10, border: "1px solid #2A2F37", background: "#1B1F26",
  color: "#9BA3AC", fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const toggleOn = { borderColor: "#4CD97B", background: "rgba(76,217,123,0.14)", color: "#4CD97B" };
const toggleOff = { borderColor: "#E4572E", background: "rgba(228,87,46,0.12)", color: "#E4572E" };

/* ---------------- Comida (food + macros) ---------------- */

function Comida({ profile, entries, foodlog, saveFoodlog }) {
  const date = todayStr();
  const list = foodlog[date] || [];
  const sorted = [...entries].filter(e => e.peso).sort((a, b) => a.date.localeCompare(b.date));
  const pesoActual = sorted.length ? sorted[sorted.length - 1].peso : (profile?.pesoInicio ? Number(profile.pesoInicio) : null);
  const targets = getTargets(profile, pesoActual);
  const totales = sumFoods(list);
  const restanteCal = targets?.calorias != null ? Math.round(targets.calorias - totales.calorias) : null;

  const [form, setForm] = useState({ nombre: "", calorias: "", proteina: "", carbohidratos: "", grasa: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFood = async (food) => {
    const item = { id: uid(), ...food };
    await saveFoodlog({ ...foodlog, [date]: [...list, item] });
  };
  const addCustom = async () => {
    if (!form.nombre) return;
    await addFood({
      nombre: form.nombre,
      calorias: Number(form.calorias) || 0,
      proteina: Number(form.proteina) || 0,
      carbohidratos: Number(form.carbohidratos) || 0,
      grasa: Number(form.grasa) || 0,
    });
    setForm({ nombre: "", calorias: "", proteina: "", carbohidratos: "", grasa: "" });
  };
  const removeFood = async (id) => {
    await saveFoodlog({ ...foodlog, [date]: list.filter(f => f.id !== id) });
  };

  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE", marginBottom: 4 }}>Alimentación</div>
      <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 20 }}>{date}</div>

      {!targets?.calorias && (
        <Card style={{ marginBottom: 16, borderColor: "#E4572E" }}>
          <div style={{ color: "#9BA3AC", fontSize: 13 }}>
            Completa edad, sexo, altura, peso inicial, actividad diaria y objetivo en tu <b style={{ color: "#F5F3EE" }}>Perfil</b> para calcular tus metas automáticamente.
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#9BA3AC" }}>Calorías</div>
          <div style={{ fontSize: 13, color: restanteCal != null && restanteCal < 0 ? "#E4572E" : "#4CD97B", fontWeight: 700 }}>
            {targets?.calorias != null ? (restanteCal < 0 ? `${Math.abs(restanteCal)} kcal de más` : `${restanteCal} kcal restantes`) : ""}
          </div>
        </div>
        <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 28, color: "#F5F3EE", marginBottom: 10 }}>
          {Math.round(totales.calorias)} {targets?.calorias != null && <span style={{ fontSize: 16, color: "#9BA3AC", fontFamily: "Inter" }}>/ {targets.calorias} kcal</span>}
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "#232830", overflow: "hidden", marginBottom: 18 }}>
          <div style={{
            width: `${targets?.calorias ? Math.min(100, (totales.calorias / targets.calorias) * 100) : 0}%`,
            height: "100%", background: restanteCal != null && restanteCal < 0 ? "#E4572E" : "#4CD97B", borderRadius: 6,
          }} />
        </div>
        <MacroBar label="Proteína" consumed={totales.proteina} target={targets?.proteina} color="#4CD97B" />
        <MacroBar label="Carbohidratos" consumed={totales.carbohidratos} target={targets?.carbohidratos} color="#E4B93E" />
        <MacroBar label="Grasas" consumed={totales.grasa} target={targets?.grasa} color="#6EA8E0" />
      </Card>

      <SectionTitle>Agregar rápido</SectionTitle>
      <div style={{ marginBottom: 6 }}>
        {QUICK_FOODS.map(f => (
          <Chip key={f.nombre} onClick={() => addFood(f)}>{f.nombre}</Chip>
        ))}
      </div>

      <SectionTitle>Agregar alimento personalizado</SectionTitle>
      <Field label="Nombre / porción"><TextInput placeholder="Ej: Ensalada con atún (1 plato)" value={form.nombre} onChange={e => setF("nombre", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Kcal"><TextInput type="number" value={form.calorias} onChange={e => setF("calorias", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Prot (g)"><TextInput type="number" value={form.proteina} onChange={e => setF("proteina", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Carbs (g)"><TextInput type="number" value={form.carbohidratos} onChange={e => setF("carbohidratos", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Grasa (g)"><TextInput type="number" value={form.grasa} onChange={e => setF("grasa", e.target.value)} /></Field></div>
      </div>
      <button onClick={addCustom} style={{ ...btnPrimary, width: "100%", marginBottom: 22 }}>
        <Plus size={18} /> Agregar a hoy
      </button>

      <SectionTitle>Comidas de hoy</SectionTitle>
      {list.length === 0 && <div style={{ color: "#6B7280", fontSize: 13 }}>Aún no registras alimentos hoy.</div>}
      {list.map(f => (
        <Card key={f.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{f.nombre}</div>
            <div style={{ color: "#9BA3AC", fontSize: 12, marginTop: 2 }}>
              {Math.round(f.calorias)} kcal · P {f.proteina}g · C {f.carbohidratos}g · G {f.grasa}g
            </div>
          </div>
          <button onClick={() => removeFood(f.id)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: 6 }}>
            <Trash2 size={16} />
          </button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Progreso (Peso / Medidas / Exámenes) ---------------- */

const PROGRESO_SUBTABS = [
  { id: "peso", label: "Peso" },
  { id: "medidas", label: "Medidas" },
  { id: "examenes", label: "Exámenes" },
];

function Progreso({ profile, entries, saveEntries, measurements, saveMeasurements, bloodwork, saveBloodwork }) {
  const [sub, setSub] = useState("peso");
  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE", marginBottom: 16 }}>Progreso</div>

      <div style={{ display: "flex", background: "#1B1F26", border: "1px solid #2A2F37", borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {PROGRESO_SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
            background: sub === t.id ? "#2E7D46" : "transparent",
            color: sub === t.id ? "#F5F3EE" : "#9BA3AC", fontWeight: 700, fontSize: 13,
          }}>{t.label}</button>
        ))}
      </div>

      {sub === "peso" && <PesoProgress profile={profile} entries={entries} saveEntries={saveEntries} />}
      {sub === "medidas" && <MedidasProgress profile={profile} measurements={measurements} saveMeasurements={saveMeasurements} />}
      {sub === "examenes" && <ExamenesProgress bloodwork={bloodwork} saveBloodwork={saveBloodwork} />}
    </div>
  );
}

function PesoProgress({ profile, entries, saveEntries }) {
  const sorted = [...entries].filter(e => e.peso).sort((a, b) => a.date.localeCompare(b.date));
  const data = sorted.map(e => ({ date: e.date.slice(5), peso: e.peso }));
  const pesoObjetivo = profile?.pesoObjetivo ? Number(profile.pesoObjetivo) : null;
  const pesoInicio = profile?.pesoInicio ? Number(profile.pesoInicio) : (sorted[0]?.peso ?? null);
  const pesoActual = sorted.length ? sorted[sorted.length - 1].peso : null;

  const removeEntry = async (date) => { await saveEntries(entries.filter(e => e.date !== date)); };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Card style={{ flex: 1, textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 11, color: "#9BA3AC", fontWeight: 700, textTransform: "uppercase" }}>Inicio</div>
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 18, color: "#F5F3EE" }}>{pesoInicio ?? "—"}</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 11, color: "#9BA3AC", fontWeight: 700, textTransform: "uppercase" }}>Actual</div>
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 18, color: "#4CD97B" }}>{pesoActual ?? "—"}</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 11, color: "#9BA3AC", fontWeight: 700, textTransform: "uppercase" }}>Meta</div>
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 18, color: "#F5F3EE" }}>{pesoObjetivo ?? "—"}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 20 }}>
        {data.length > 1 ? (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#232830" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#1B1F26", border: "1px solid #2A2F37", borderRadius: 8, color: "#F5F3EE" }} />
                {pesoObjetivo && <ReferenceLine y={pesoObjetivo} stroke="#E4572E" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="peso" stroke="#4CD97B" strokeWidth={2.5} dot={{ r: 3, fill: "#4CD97B" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ color: "#9BA3AC", fontSize: 13, textAlign: "center", padding: "30px 0" }}>
            Registra tu peso al menos 2 días para ver el gráfico.
          </div>
        )}
      </Card>

      <SectionTitle>Historial</SectionTitle>
      {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(e => {
        const w = WORKOUT_TYPES.find(w => w.id === e.tipo);
        return (
          <Card key={e.date} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{e.date}</div>
              <div style={{ color: "#9BA3AC", fontSize: 12, marginTop: 2 }}>
                {e.peso ? `${e.peso} kg · ` : ""}{e.entrenoHecho ? (w ? w.label : "Entrenó") : "Sin entrenar"}{e.duracion ? ` · ${e.duracion} min` : ""}
              </div>
            </div>
            <button onClick={() => removeEntry(e.date)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: 6 }}>
              <Trash2 size={16} />
            </button>
          </Card>
        );
      })}
      {entries.length === 0 && <div style={{ color: "#6B7280", fontSize: 13 }}>Todavía no hay registros.</div>}
    </div>
  );
}

const MEDIDA_FIELDS = [
  { key: "cintura", label: "Cintura" }, { key: "cadera", label: "Cadera" },
  { key: "cuello", label: "Cuello" }, { key: "pecho", label: "Pecho" },
  { key: "brazo", label: "Brazo" }, { key: "muslo", label: "Muslo" },
];

function MedidasProgress({ profile, measurements, saveMeasurements }) {
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const data = sorted.filter(m => m.cintura).map(m => ({ date: m.date.slice(5), cintura: Number(m.cintura) }));

  const [form, setForm] = useState({ date: todayStr(), cintura: "", cadera: "", cuello: "", pecho: "", brazo: "", muslo: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const rest = measurements.filter(m => m.date !== form.date);
    await saveMeasurements([...rest, { ...form }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const removeMeasurement = async (date) => { await saveMeasurements(measurements.filter(m => m.date !== date)); };

  const altura = profile?.altura ? Number(profile.altura) : null;
  const cinturaActual = last?.cintura ? Number(last.cintura) : null;
  const ratio = altura && cinturaActual ? cinturaActual / altura : null;

  return (
    <div>
      {altura && cinturaActual && (
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#9BA3AC", fontWeight: 700, textTransform: "uppercase" }}>Cintura / altura</div>
              <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE" }}>{ratio.toFixed(2)}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderRadius: 6, padding: "4px 9px",
              color: ratio < 0.5 ? "#4CD97B" : "#E4572E", background: ratio < 0.5 ? "rgba(76,217,123,0.14)" : "rgba(228,87,46,0.14)",
            }}>{ratio < 0.5 ? "Saludable" : "Atención"}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 8 }}>
            Referencia general: un valor bajo 0,5 se asocia a menor riesgo cardiometabólico. No reemplaza la evaluación médica.
          </div>
        </Card>
      )}

      {first && last && first !== last && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {["cintura", "cadera"].map(k => (
            <Card key={k} style={{ flex: 1, textAlign: "center", padding: 12 }}>
              <div style={{ fontSize: 11, color: "#9BA3AC", fontWeight: 700, textTransform: "uppercase" }}>{k === "cintura" ? "Cintura" : "Cadera"}</div>
              <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 16, color: "#F5F3EE" }}>
                {first[k] || "—"} → <span style={{ color: "#4CD97B" }}>{last[k] || "—"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ marginBottom: 20 }}>
        {data.length > 1 ? (
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#232830" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#1B1F26", border: "1px solid #2A2F37", borderRadius: 8, color: "#F5F3EE" }} />
                <Line type="monotone" dataKey="cintura" stroke="#6EA8E0" strokeWidth={2.5} dot={{ r: 3, fill: "#6EA8E0" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ color: "#9BA3AC", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            Registra la cintura al menos 2 veces para ver el gráfico.
          </div>
        )}
      </Card>

      <SectionTitle>Nueva medición</SectionTitle>
      <Field label="Fecha"><TextInput type="date" value={form.date} onChange={e => setF("date", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        {MEDIDA_FIELDS.slice(0, 2).map(m => (
          <div key={m.key} style={{ flex: 1 }}><Field label={`${m.label} (cm)`}><TextInput type="number" step="0.1" value={form[m.key]} onChange={e => setF(m.key, e.target.value)} /></Field></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {MEDIDA_FIELDS.slice(2, 4).map(m => (
          <div key={m.key} style={{ flex: 1 }}><Field label={`${m.label} (cm)`}><TextInput type="number" step="0.1" value={form[m.key]} onChange={e => setF(m.key, e.target.value)} /></Field></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {MEDIDA_FIELDS.slice(4, 6).map(m => (
          <div key={m.key} style={{ flex: 1 }}><Field label={`${m.label} (cm)`}><TextInput type="number" step="0.1" value={form[m.key]} onChange={e => setF(m.key, e.target.value)} /></Field></div>
        ))}
      </div>
      <button onClick={handleSave} style={{ ...btnPrimary, width: "100%", marginBottom: 22 }}>
        <Save size={18} /> {saved ? "Guardado ✓" : "Guardar medición"}
      </button>

      <SectionTitle>Historial</SectionTitle>
      {sorted.length === 0 && <div style={{ color: "#6B7280", fontSize: 13 }}>Aún no hay mediciones.</div>}
      {[...sorted].reverse().map(m => (
        <Card key={m.date} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{m.date}</div>
            <div style={{ color: "#9BA3AC", fontSize: 12, marginTop: 2 }}>
              {MEDIDA_FIELDS.filter(f => m[f.key]).map(f => `${f.label} ${m[f.key]}cm`).join(" · ") || "Sin datos"}
            </div>
          </div>
          <button onClick={() => removeMeasurement(m.date)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: 6 }}>
            <Trash2 size={16} />
          </button>
        </Card>
      ))}
    </div>
  );
}

function ExamenesProgress({ bloodwork, saveBloodwork }) {
  const sorted = [...bloodwork].sort((a, b) => b.date.localeCompare(a.date));
  const [form, setForm] = useState({
    date: todayStr(), glucosa: "", colesterolTotal: "", hdl: "", ldl: "",
    trigliceridos: "", hba1c: "", presionSistolica: "", presionDiastolica: "", notas: "",
  });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const rest = bloodwork.filter(b => b.date !== form.date);
    await saveBloodwork([...rest, { ...form }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const removeExam = async (date) => { await saveBloodwork(bloodwork.filter(b => b.date !== date)); };

  return (
    <div>
      <Card style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={18} color="#E4B93E" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: "#9BA3AC" }}>
          Los rangos mostrados son referencias generales para adultos y no reemplazan la evaluación de tu médico. Ante cualquier valor alterado, consulta con un profesional.
        </div>
      </Card>

      <SectionTitle>Nuevo examen</SectionTitle>
      <Field label="Fecha"><TextInput type="date" value={form.date} onChange={e => setF("date", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Glucosa (mg/dL)"><TextInput type="number" value={form.glucosa} onChange={e => setF("glucosa", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="HbA1c (%)"><TextInput type="number" step="0.1" value={form.hba1c} onChange={e => setF("hba1c", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Colest. total (mg/dL)"><TextInput type="number" value={form.colesterolTotal} onChange={e => setF("colesterolTotal", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Triglicéridos (mg/dL)"><TextInput type="number" value={form.trigliceridos} onChange={e => setF("trigliceridos", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="HDL (mg/dL)"><TextInput type="number" value={form.hdl} onChange={e => setF("hdl", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="LDL (mg/dL)"><TextInput type="number" value={form.ldl} onChange={e => setF("ldl", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Presión sistólica"><TextInput type="number" value={form.presionSistolica} onChange={e => setF("presionSistolica", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Presión diastólica"><TextInput type="number" value={form.presionDiastolica} onChange={e => setF("presionDiastolica", e.target.value)} /></Field></div>
      </div>
      <Field label="Notas (opcional)">
        <textarea value={form.notas} onChange={e => setF("notas", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Laboratorio, indicaciones del médico, etc." />
      </Field>
      <button onClick={handleSave} style={{ ...btnPrimary, width: "100%", marginBottom: 22 }}>
        <Save size={18} /> {saved ? "Guardado ✓" : "Guardar examen"}
      </button>

      <SectionTitle>Historial</SectionTitle>
      {sorted.length === 0 && <div style={{ color: "#6B7280", fontSize: 13 }}>Aún no hay exámenes registrados.</div>}
      {sorted.map(b => {
        const presionStatus = classifyPresion(Number(b.presionSistolica), Number(b.presionDiastolica));
        return (
          <Card key={b.date} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{b.date}</div>
              <button onClick={() => removeExam(b.date)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: 4 }}>
                <Trash2 size={15} />
              </button>
            </div>
            {BLOOD_METRICS.filter(m => b[m.key]).map(m => (
              <MetricChip key={m.key} label={m.label} value={b[m.key]} unit={` ${m.unit}`} status={m.classify(Number(b[m.key]))} />
            ))}
            {b.presionSistolica && b.presionDiastolica && (
              <MetricChip label="Presión arterial" value={`${b.presionSistolica}/${b.presionDiastolica}`} unit=" mmHg" status={presionStatus} />
            )}
            {b.notas && <div style={{ color: "#9BA3AC", fontSize: 12, marginTop: 8 }}>{b.notas}</div>}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Perfil (intake form) ---------------- */

function Perfil({ profile, entries, saveProfile }) {
  const [form, setForm] = useState(() => profile || {
    nombre: "", edad: "", sexo: "", altura: "", pesoInicio: "", pesoObjetivo: "",
    actividadDiaria: "", lesiones: "", medicamentos: "", chequeoMedico: "",
    experiencia: "", ejercicioActual: "", diasSemana: "4", tiempoSesion: "",
    equipamiento: [], comidasDia: "", restricciones: "", cocina: "", presupuestoTiempo: "",
    objetivo: "", plazoMeses: "9", notasPrevias: "", fechaInicio: todayStr(),
    overrideCalorias: "", overrideProteina: "", overrideCarbos: "", overrideGrasa: "",
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleEquipo = (item) => {
    setForm(f => {
      const has = f.equipamiento.includes(item);
      return { ...f, equipamiento: has ? f.equipamiento.filter(x => x !== item) : [...f.equipamiento, item] };
    });
  };

  const handleSave = async () => { await saveProfile(form); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const sorted = [...entries].filter(e => e.peso).sort((a, b) => a.date.localeCompare(b.date));
  const pesoActual = sorted.length ? sorted[sorted.length - 1].peso : (form.pesoInicio ? Number(form.pesoInicio) : null);
  const auto = calcAutoTargets(form, pesoActual);

  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE", marginBottom: 4 }}>Tu perfil</div>
      <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 6 }}>Esta información define tu plan de entrenamiento y alimentación.</div>

      <SectionTitle>Datos personales</SectionTitle>
      <Field label="Nombre"><TextInput value={form.nombre} onChange={e => set("nombre", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Edad"><TextInput type="number" value={form.edad} onChange={e => set("edad", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}>
          <Field label="Sexo">
            <Select value={form.sexo} onChange={e => set("sexo", e.target.value)}>
              <option value="">Selecciona</option><option value="M">Masculino</option><option value="F">Femenino</option>
            </Select>
          </Field>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Altura (cm)"><TextInput type="number" value={form.altura} onChange={e => set("altura", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Peso inicial (kg)"><TextInput type="number" step="0.1" value={form.pesoInicio} onChange={e => set("pesoInicio", e.target.value)} /></Field></div>
      </div>
      <Field label="Peso objetivo (kg)"><TextInput type="number" step="0.1" value={form.pesoObjetivo} onChange={e => set("pesoObjetivo", e.target.value)} /></Field>
      <Field label="Actividad diaria fuera del ejercicio">
        <Select value={form.actividadDiaria} onChange={e => set("actividadDiaria", e.target.value)}>
          <option value="">Selecciona</option>
          <option value="sedentario">Sentado la mayor parte del día</option>
          <option value="moderado">De pie / caminando algo</option>
          <option value="activo">Muy activo físicamente</option>
        </Select>
      </Field>

      <SectionTitle>Salud</SectionTitle>
      <Field label="Lesiones o dolores crónicos"><TextInput value={form.lesiones} onChange={e => set("lesiones", e.target.value)} placeholder="Ninguna, o describe" /></Field>
      <Field label="Medicamentos regulares"><TextInput value={form.medicamentos} onChange={e => set("medicamentos", e.target.value)} placeholder="Ninguno, o describe" /></Field>
      <Field label="Último chequeo médico"><TextInput value={form.chequeoMedico} onChange={e => set("chequeoMedico", e.target.value)} placeholder="Ej: hace 6 meses" /></Field>

      <SectionTitle>Entrenamiento</SectionTitle>
      <Field label="Experiencia previa con pesas/calistenia"><TextInput value={form.experiencia} onChange={e => set("experiencia", e.target.value)} /></Field>
      <Field label="Ejercicio actual (ej: ciclismo)"><TextInput value={form.ejercicioActual} onChange={e => set("ejercicioActual", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Días/semana disponibles"><TextInput type="number" min="1" max="7" value={form.diasSemana} onChange={e => set("diasSemana", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Minutos por sesión"><TextInput type="number" value={form.tiempoSesion} onChange={e => set("tiempoSesion", e.target.value)} /></Field></div>
      </div>
      <Field label="Equipamiento disponible en casa">
        <div>{EQUIPO_OPTS.map(item => <Chip key={item} active={form.equipamiento.includes(item)} onClick={() => toggleEquipo(item)}>{item}</Chip>)}</div>
      </Field>

      <SectionTitle>Alimentación</SectionTitle>
      <Field label="Comidas al día"><TextInput type="number" value={form.comidasDia} onChange={e => set("comidasDia", e.target.value)} /></Field>
      <Field label="Restricciones o intolerancias"><TextInput value={form.restricciones} onChange={e => set("restricciones", e.target.value)} placeholder="Ninguna, o describe" /></Field>
      <Field label="¿Quién cocina en casa?"><TextInput value={form.cocina} onChange={e => set("cocina", e.target.value)} /></Field>
      <Field label="Presupuesto/tiempo para preparar comida"><TextInput value={form.presupuestoTiempo} onChange={e => set("presupuestoTiempo", e.target.value)} /></Field>

      <SectionTitle>Objetivo</SectionTitle>
      <Field label="Prioridad">
        <Select value={form.objetivo} onChange={e => set("objetivo", e.target.value)}>
          <option value="">Selecciona</option>
          <option value="grasa">Perder grasa</option>
          <option value="musculo">Ganar músculo</option>
          <option value="recomposicion">Ambos (recomposición)</option>
        </Select>
      </Field>
      <Field label="Plazo (meses)"><TextInput type="number" value={form.plazoMeses} onChange={e => set("plazoMeses", e.target.value)} /></Field>
      <Field label="Qué te ha funcionado o fallado antes"><TextInput value={form.notasPrevias} onChange={e => set("notasPrevias", e.target.value)} /></Field>

      <SectionTitle>Metas nutricionales</SectionTitle>
      {auto ? (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, color: "#9BA3AC", marginBottom: 10 }}>
            Sugerencia calculada según tus datos (editable abajo):
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 13 }}>{auto.calorias} kcal</span>
            <span style={{ color: "#4CD97B", fontSize: 13 }}>P {auto.proteina}g</span>
            <span style={{ color: "#E4B93E", fontSize: 13 }}>C {auto.carbohidratos}g</span>
            <span style={{ color: "#6EA8E0", fontSize: 13 }}>G {auto.grasa}g</span>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: "#9BA3AC", fontSize: 13 }}>Completa edad, sexo, altura y peso inicial para calcular una sugerencia automática.</div>
        </Card>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Kcal objetivo (opcional)"><TextInput type="number" placeholder={auto ? String(auto.calorias) : ""} value={form.overrideCalorias} onChange={e => set("overrideCalorias", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Proteína g (opcional)"><TextInput type="number" placeholder={auto ? String(auto.proteina) : ""} value={form.overrideProteina} onChange={e => set("overrideProteina", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Carbos g (opcional)"><TextInput type="number" placeholder={auto ? String(auto.carbohidratos) : ""} value={form.overrideCarbos} onChange={e => set("overrideCarbos", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Grasa g (opcional)"><TextInput type="number" placeholder={auto ? String(auto.grasa) : ""} value={form.overrideGrasa} onChange={e => set("overrideGrasa", e.target.value)} /></Field></div>
      </div>

      <button onClick={handleSave} style={{ ...btnPrimary, width: "100%", marginTop: 10, marginBottom: 30 }}>
        <Save size={18} /> {saved ? "Perfil guardado ✓" : "Guardar perfil"}
      </button>
    </div>
  );
}

/* ---------------- Plan (Entrenamiento / Alimentación) ---------------- */

const PLAN_SUBTABS = [
  { id: "entrenamiento", label: "Entrenamiento" },
  { id: "alimentacion", label: "Alimentación" },
];

function Plan({ profile, entries }) {
  const [sub, setSub] = useState("entrenamiento");
  return (
    <div>
      <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 22, color: "#F5F3EE", marginBottom: 4 }}>Tu plan</div>
      <div style={{ color: "#9BA3AC", fontSize: 13, marginBottom: 16 }}>
        Generado a partir de tu perfil. Aquí está el "qué hacer" — usa Registrar y Comida para el día a día.
      </div>

      <div style={{ display: "flex", background: "#1B1F26", border: "1px solid #2A2F37", borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {PLAN_SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
            background: sub === t.id ? "#2E7D46" : "transparent",
            color: sub === t.id ? "#F5F3EE" : "#9BA3AC", fontWeight: 700, fontSize: 12.5,
          }}>{t.label}</button>
        ))}
      </div>

      {!profile ? (
        <Card style={{ borderColor: "#E4572E" }}>
          <div style={{ color: "#F5F3EE", fontWeight: 700, marginBottom: 6 }}>Completa tu perfil primero</div>
          <div style={{ color: "#9BA3AC", fontSize: 13 }}>
            Tu plan de entrenamiento y alimentación se arma con tus datos de días disponibles, equipamiento, objetivo y peso. Ve a la pestaña Perfil y complétalos.
          </div>
        </Card>
      ) : sub === "entrenamiento" ? (
        <EntrenamientoPlan profile={profile} />
      ) : (
        <AlimentacionPlan profile={profile} entries={entries} />
      )}
    </div>
  );
}

function EntrenamientoPlan({ profile }) {
  const equipo = profile.equipamiento || [];
  const dias = Number(profile.diasSemana) || 4;
  const program = buildProgram(dias);
  const descanso = Math.max(0, 7 - dias);

  return (
    <div>
      <Card style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Clock size={18} color="#4CD97B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: "#9BA3AC" }}>
          Calienta 5–10 min antes de cada sesión (movilidad + cardio suave) y cierra con 5 min de elongación. Usa {equipo.length ? equipo.join(", ").toLowerCase() : "peso corporal"} según lo que marcaste en tu perfil.
        </div>
      </Card>

      <SectionTitle>Fases del plan</SectionTitle>
      {FASES.map(f => (
        <Card key={f.nombre} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Layers size={15} color="#4CD97B" />
            <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{f.nombre}</span>
          </div>
          <div style={{ color: "#6B7280", fontSize: 11.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>{f.periodo}</div>
          <div style={{ color: "#C9CED4", fontSize: 13, marginBottom: 6 }}>{f.foco}</div>
          <div style={{ color: "#9BA3AC", fontSize: 12.5 }}><b style={{ color: "#4CD97B" }}>Progresión: </b>{f.progresion}</div>
        </Card>
      ))}

      <SectionTitle>Tu split semanal ({dias} días de entrenamiento{descanso > 0 ? `, ${descanso} de descanso` : ""})</SectionTitle>
      {program.map((day, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Dumbbell size={16} color="#4CD97B" />
            <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>Día {i + 1} · {day.titulo}</span>
          </div>
          {day.slots.map(slotKey => {
            const ex = pickVariant(slotKey, equipo);
            if (!ex) return null;
            return (
              <div key={slotKey} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #232830" }}>
                <span style={{ color: "#C9CED4", fontSize: 13 }}>{ex.name}</span>
                <span style={{ color: "#9BA3AC", fontSize: 12.5, fontWeight: 700 }}>{ex.sets}</span>
              </div>
            );
          })}
        </Card>
      ))}
      {profile.ejercicioActual && (
        <Card style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Bike size={18} color="#6EA8E0" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#9BA3AC" }}>
            Mencionaste "{profile.ejercicioActual}" como actividad actual — mantenla como cardio complementario en tus días de descanso, sin que reemplace las sesiones de fuerza.
          </div>
        </Card>
      )}
    </div>
  );
}

function AlimentacionPlan({ profile, entries }) {
  const sorted = [...entries].filter(e => e.peso).sort((a, b) => a.date.localeCompare(b.date));
  const pesoActual = sorted.length ? sorted[sorted.length - 1].peso : (profile.pesoInicio ? Number(profile.pesoInicio) : null);
  const targets = getTargets(profile, pesoActual);
  const meals = distributeMeals(profile.comidasDia, targets?.calorias);

  return (
    <div>
      {targets?.calorias ? (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#9BA3AC", marginBottom: 8 }}>Tu meta diaria</div>
          <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 26, color: "#F5F3EE", marginBottom: 8 }}>{targets.calorias} kcal</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ color: "#4CD97B", fontSize: 13, fontWeight: 700 }}>Proteína {targets.proteina}g</span>
            <span style={{ color: "#E4B93E", fontSize: 13, fontWeight: 700 }}>Carbos {targets.carbohidratos}g</span>
            <span style={{ color: "#6EA8E0", fontSize: 13, fontWeight: 700 }}>Grasa {targets.grasa}g</span>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 20, borderColor: "#E4572E" }}>
          <div style={{ color: "#9BA3AC", fontSize: 13 }}>Completa edad, sexo, altura y peso en tu Perfil para calcular tu meta calórica.</div>
        </Card>
      )}

      <SectionTitle>Distribución de comidas</SectionTitle>
      {meals.map(m => (
        <Card key={m.n} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 14 }}>{m.n}</span>
          <span style={{ color: "#9BA3AC", fontSize: 13 }}>{m.p}%{m.kcal ? ` · ${m.kcal} kcal` : ""}</span>
        </Card>
      ))}

      <SectionTitle>Arma tu plato</SectionTitle>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: "#9BA3AC" }}>
          En cada comida principal combina: 1 porción de proteína + 1 porción de carbohidrato + una fuente de grasa saludable, y llena al menos la mitad del plato con vegetales.
        </div>
      </Card>
      {PLATE_GUIDE.map(g => (
        <Card key={g.grupo} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: 99, background: g.color }} />
            <span style={{ color: "#F5F3EE", fontWeight: 700, fontSize: 13 }}>{g.grupo}</span>
          </div>
          <div style={{ color: "#9BA3AC", fontSize: 12.5 }}>{g.ejemplos.join(" · ")}</div>
        </Card>
      ))}

      {profile.restricciones && (
        <Card style={{ marginTop: 4, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={16} color="#E4B93E" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#9BA3AC" }}>
            Tienes registrado: <b style={{ color: "#F5F3EE" }}>{profile.restricciones}</b>. Ajusta las categorías de arriba evitando lo que corresponda.
          </div>
        </Card>
      )}

      <SectionTitle>Principios generales</SectionTitle>
      <Card>
        {PRINCIPIOS_ALIMENTACION.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < PRINCIPIOS_ALIMENTACION.length - 1 ? "1px solid #232830" : "none" }}>
            <Check size={14} color="#4CD97B" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ color: "#C9CED4", fontSize: 12.5 }}>{p}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- App shell ---------------- */

const TABS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "plan", label: "Plan", icon: ListChecks },
  { id: "registro", label: "Registrar", icon: PlusCircle },
  { id: "comida", label: "Comida", icon: Utensils },
  { id: "progreso", label: "Progreso", icon: TrendingUp },
  { id: "perfil", label: "Perfil", icon: UserCircle2 },
];

export default function App() {
  const [tab, setTab] = useState("inicio");
  const {
    ready, profile, entries, foodlog, measurements, bloodwork,
    saveProfile, saveEntries, saveFoodlog, saveMeasurements, saveBloodwork,
    error, setError,
  } = useStorage();

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: "#12151A", fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #4CD97B !important; }
        input[type=range] { accent-color: #4CD97B; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ padding: "16px 20px 10px", borderBottom: "1px solid #1E2226", display: "flex", alignItems: "center", gap: 10 }}>
        <Target size={20} color="#4CD97B" />
        <div style={{ fontFamily: "'Archivo Black','Arial Black',sans-serif", fontSize: 15, letterSpacing: "0.03em", color: "#F5F3EE" }}>
          WORK HARD · TRACKER
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 20px 100px", overflowY: "auto" }}>
        {!ready ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9BA3AC" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
            Cargando tu información…
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "rgba(228,87,46,0.12)", border: "1px solid #E4572E", color: "#E4572E", borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>{error}</span>
                <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#E4572E", cursor: "pointer" }}><X size={16} /></button>
              </div>
            )}
            {tab === "inicio" && <Dashboard profile={profile} entries={entries} foodlog={foodlog} goTo={setTab} />}
            {tab === "plan" && <Plan profile={profile} entries={entries} />}
            {tab === "registro" && <Registro entries={entries} saveEntries={saveEntries} goTo={setTab} />}
            {tab === "comida" && <Comida profile={profile} entries={entries} foodlog={foodlog} saveFoodlog={saveFoodlog} />}
            {tab === "progreso" && (
              <Progreso
                profile={profile} entries={entries} saveEntries={saveEntries}
                measurements={measurements} saveMeasurements={saveMeasurements}
                bloodwork={bloodwork} saveBloodwork={saveBloodwork}
              />
            )}
            {tab === "perfil" && <Perfil profile={profile} entries={entries} saveProfile={saveProfile} />}
          </>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420, background: "#161A20", borderTop: "1px solid #2A2F37",
        display: "flex", padding: "10px 4px calc(10px + env(safe-area-inset-bottom))",
      }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              color: active ? "#4CD97B" : "#6B7280", padding: "6px 0",
            }}>
              <Icon size={19} />
              <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.01em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
