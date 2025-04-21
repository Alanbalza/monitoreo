import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { AlertData } from "@/types/sensorTypes";
import { Image } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Poppins",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Italic.ttf",
      fontStyle: "italic",
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-BoldItalic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Poppins",
    color: "#303030",
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#111827",
    fontWeight: "bold",
  },
  subtitleBold: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  normalText: {
    fontSize: 11,
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cell: {
    flex: 1,
    fontSize: 11,
    color: "#374151",
  },
  image: {
    width: "100%",
    height: 140,
    marginBottom: 20,
  },
});

type Props = {
  fecha: string;
  ubicacion: string;
  resumenIA: string;
  estadoSistema: string;
  alertas: AlertData[];
  imagenes: {
    temp: string;
    hum: string;
    humSuelo: string;
    luz: string;
  };
};

export const ReportePDF: React.FC<Props> = ({
  fecha,
  ubicacion,
  resumenIA,
  estadoSistema,
  alertas,
  imagenes,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Reporte de Monitoreo</Text>
        <Text>
          <Text style={styles.subtitleBold}>Fecha y hora:</Text> {fecha}
        </Text>
        <Text>
          <Text style={styles.subtitleBold}>Ubicación:</Text> {ubicacion}
        </Text>
        <Text>
          <Text style={styles.subtitleBold}>Estado del sistema:</Text>{" "}
          {estadoSistema}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Resumen </Text>
        <Text>{resumenIA}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Historial de Alertas</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Tipo</Text>
          <Text style={styles.cell}>Descripción</Text>
          <Text style={styles.cell}>Urgencia</Text>
          <Text style={styles.cell}>Fecha</Text>
        </View>
        {alertas.map((a, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.cell}>{a.type}</Text>
            <Text style={styles.cell}>{a.description}</Text>
            <Text style={styles.cell}>
              {a.urgency === "critical" && "Crítico"}
              {a.urgency === "high" && "Alta"}
              {a.urgency === "info" && "Informativo"}
            </Text>
            <Text style={styles.cell}>
              {new Date(a.timestamp).toLocaleString("es-MX")}
            </Text>
          </View>
        ))}
      </View>
    </Page>

    {/* Página 2: Gráficas */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Gráficas de sensores</Text>

        <Text style={{ marginBottom: 4 }}>Temperatura (°C)</Text>
        <Image src={imagenes.temp} style={styles.image} />

        <Text style={{ marginTop: 10 }}>Humedad (%)</Text>
        <Image src={imagenes.hum} style={styles.image} />

        <Text style={{ marginTop: 10 }}>Humedad del Suelo (%)</Text>
        <Image src={imagenes.humSuelo} style={styles.image} />

        <Text style={{ marginTop: 10 }}>Luminosidad (lx)</Text>
        <Image src={imagenes.luz} style={styles.image} />
      </View>
    </Page>
  </Document>
);
