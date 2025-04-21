import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { AlertData } from "@/types/sensorTypes";
import { generarAlertas } from "@/lib/generate-alerts";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { obtenerResumenIA } from "@/lib/get-resume";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportePDF } from "@/lib/create-pdf";
import { toPng } from "html-to-image";

export const Reporte = () => {
  const [alerts, setAlerts] = React.useState<AlertData[]>([]);
  const [sensorResumen, setSensorResumen] = React.useState<string>(
    "Sistema operando sin errores críticos"
  );
  const [historico, setHistorico] = React.useState<any[]>([]);
  const [resumenIA, setResumenIA] = React.useState("Generando resumen...");

  const refTemp = React.useRef<HTMLDivElement>(null);
  const refHumedad = React.useRef<HTMLDivElement>(null);
  const refHumedadSuelo = React.useRef<HTMLDivElement>(null);
  const refLuz = React.useRef<HTMLDivElement>(null);

  const now = new Date().toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const getData = async () => {
    try {
      const response = await fetch("http://3.226.1.115:8029/datos", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok)
        throw new Error(`Error en la conexión: ${response.status}`);

      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No se recibieron datos");

      const alertasGeneradas = generarAlertas(data)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);

      setAlerts(alertasGeneradas);
      setHistorico(
        data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp).toISOString(),
        }))
      );

      if (alertasGeneradas.some((a) => a.urgency === "critical")) {
        setSensorResumen("Sistema operando con alertas ⚠️");
      } else if (alertasGeneradas.length > 0) {
        setSensorResumen("Sistema operando con alertas detectadas");
      } else {
        setSensorResumen("Sistema operando con normalidad ✅");
      }
    } catch (error) {
      console.error("Error ", error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  const dataGrafica = React.useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return historico.filter((d) => d.timestamp.startsWith(hoy));
  }, [historico]);

  React.useEffect(() => {
    if (alerts.length && historico.length) {
      obtenerResumenIA(alerts, historico)
        .then(setResumenIA)
        .catch(() => setResumenIA("No se pudo generar el resumen con Gemini."));
    }
  }, [alerts, historico]);

  const generarImagenes = async () => {
    const [temp, hum, humSuelo, luz] = await Promise.all([
      toPng(refTemp.current!),
      toPng(refHumedad.current!),
      toPng(refHumedadSuelo.current!),
      toPng(refLuz.current!),
    ]);
    return { temp, hum, humSuelo, luz };
  };

  const [imagenes, setImagenes] = React.useState<{
    temp: string;
    hum: string;
    humSuelo: string;
    luz: string;
  } | null>(null);

  const handleGenerarPDF = async () => {
    const imgs = await generarImagenes();
    setImagenes(imgs);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Reporte</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Encabezado */}
          <div>
            <div className="flex justify-end">
              {imagenes ? (
                <PDFDownloadLink
                  document={
                    <ReportePDF
                      fecha={now}
                      ubicacion="Universidad Politécnica de Chiapas"
                      resumenIA={resumenIA}
                      estadoSistema={sensorResumen}
                      alertas={alerts}
                      imagenes={imagenes}
                    />
                  }
                  fileName={`reporte_sensores_${new Date().toISOString()}.pdf`}
                >
                  {({ loading }) => (
                    <Button className="mb-2">
                      {loading ? "Generando PDF..." : "Descargar PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <Button onClick={handleGenerarPDF} className="mb-2">
                  Generar PDF
                </Button>
              )}
            </div>

            <h1 className="text-2xl font-bold">Reporte de Monitoreo</h1>
            <p className="text-sm text-gray-600">
              <strong>Fecha y Hora:</strong> {now}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Ubicación:</strong> Universidad Politécnica de Chiapas
            </p>
            <p className="text-sm text-gray-600">
              <strong>Estado General:</strong> {sensorResumen}
            </p>
          </div>

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-800">
              <p dangerouslySetInnerHTML={{ __html: resumenIA }} />
            </CardContent>
          </Card>

          {/* Sección Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Alertas</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="p-2 border">Tipo</th>
                    <th className="p-2 border">Descripción</th>
                    <th className="p-2 border">Urgencia</th>
                    <th className="p-2 border">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td className="p-2 border" colSpan={4}>
                        No se han detectado alertas recientes
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert, index) => (
                      <tr key={index}>
                        <td className="p-2 border">{alert.type}</td>
                        <td className="p-2 border">{alert.description}</td>
                        <td className="p-2 border">
                          {alert.urgency === "critical" && "🚨 Crítico"}
                          {alert.urgency === "high" && "⚠️ Alta"}
                          {alert.urgency === "info" && "ℹ️ Informativo"}
                        </td>
                        <td className="p-2 border">
                          {alert.timestamp.toLocaleString("es-MX")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Gráficos por sensor */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Temperatura (°C)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]" ref={refTemp}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("es-MX")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#ef4444"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Humedad (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]" ref={refHumedad}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("es-MX")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="humedad"
                    stroke="#3b82f6"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Humedad del Suelo (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]" ref={refHumedadSuelo}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("es-MX")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="humedad_suelo"
                    stroke="#10b981"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Luminosidad (lx)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]" ref={refLuz}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("es-MX")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="luminosidad"
                    stroke="#facc15"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
