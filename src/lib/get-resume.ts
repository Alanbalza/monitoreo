import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function obtenerResumenIA(alerts: any[], historico: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const ultimo = historico[historico.length - 1] || {};

  // Tipos de alerta
  const tiposAlerta: Record<string, number> = {};
  alerts.forEach((a) => {
    const key = a.type.toLowerCase();
    tiposAlerta[key] = (tiposAlerta[key] || 0) + 1;
  });

  const resumenTipos = Object.entries(tiposAlerta)
    .map(([tipo, cantidad]) => `- ${tipo}: ${cantidad}`)
    .join("\n");

  const descripciones = alerts.map((a) => `• ${a.description}`).join("\n");

  const prompt = `
Eres un asistente técnico que genera reportes profesionales de monitoreo ambiental.

Genera un resumen ejecutivo en español que incluya:
- El número total de alertas detectadas: ${alerts.length}
- Los tipos de alertas y cantidad detectada:
${resumenTipos}
- El último dato registrado: ${JSON.stringify(ultimo, null, 2)}

Después del resumen, incluye recomendaciones específicas con base en las siguientes descripciones de alertas:
${descripciones}

El texto debe ser claro, técnico y profesional, de máximo 5 líneas para el resumen y 3-4 recomendaciones prácticas. No uses tablas. No incluyas el título "Resumen Ejecutivo".
`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    return response.text();
  } catch (err) {
    console.error("Error al generar resumen", err);
    return "No se pudo generar el resumen.";
  }
}
