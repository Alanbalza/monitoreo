import { AlertData } from "@/types/sensorTypes";

export function generarAlertas(data: any[]): AlertData[] {
  const rawAlerts: AlertData[] = [];

  data.forEach((entry) => {
    const ts = new Date(entry.timestamp);

    // Temperatura
    if (entry.temperatura === null) {
      rawAlerts.push({
        type: "Alerta Crítica",
        description: "Sensor de temperatura desconectado",
        urgency: "critical",
        sensor: "temperatura",
        timestamp: ts,
      });
    } else if (entry.temperatura > 35) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Temperatura muy alta",
        urgency: "high",
        sensor: "temperatura",
        timestamp: ts,
      });
    }

    // Humedad
    if (entry.humedad === null) {
      rawAlerts.push({
        type: "Alerta Crítica",
        description: "Sensor de humedad desconectado",
        urgency: "critical",
        sensor: "humedad",
        timestamp: ts,
      });
    } else if (entry.humedad > 80) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Humedad muy alta",
        urgency: "high",
        sensor: "humedad",
        timestamp: ts,
      });
    } else if (entry.humedad < 30) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Humedad muy baja",
        urgency: "high",
        sensor: "humedad",
        timestamp: ts,
      });
    }

    // Humedad del suelo
    if (entry.humedad_suelo === null) {
      rawAlerts.push({
        type: "Alerta Crítica",
        description: "Sensor de humedad del suelo desconectado",
        urgency: "critical",
        sensor: "humedad_suelo",
        timestamp: ts,
      });
    } else if (entry.humedad_suelo > 60) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Humedad del suelo muy alta",
        urgency: "high",
        sensor: "humedad_suelo",
        timestamp: ts,
      });
    } else if (entry.humedad_suelo < 20) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Humedad del suelo muy baja",
        urgency: "high",
        sensor: "humedad_suelo",
        timestamp: ts,
      });
    }

    // Luminosidad
    if (entry.luminosidad === null) {
      rawAlerts.push({
        type: "Notificación",
        description: "Sin lectura de luminosidad",
        urgency: "critical",
        sensor: "luminosidad",
        timestamp: ts,
      });
    } else if (entry.luminosidad > 400) {
      rawAlerts.push({
        type: "Advertencia",
        description: "Luminosidad muy alta",
        urgency: "high",
        sensor: "luminosidad",
        timestamp: ts,
      });
    }
  });

  //   const sortedAlerts = rawAlerts.sort(
  //     (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  //   );

  //   //Devuelve solo las últimas 20
  //   return sortedAlerts.slice(0, 10);

  const uniqueAlertsMap = new Map<string, AlertData>();

  for (const alert of rawAlerts) {
    const key = `${alert.description}_${alert.sensor}`;
    if (!uniqueAlertsMap.has(key)) {
      uniqueAlertsMap.set(key, alert);
    }
  }

  return Array.from(uniqueAlertsMap.values());
}
