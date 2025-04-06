import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos del sensor
interface SensorData {
  title: string;
  value: number | null;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface AlertData {
  type: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'info';
  sensor?: string;
  timestamp: Date;
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#112131',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#112131'
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#112131'
  },
  table: {
    width: '100%',
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    paddingVertical: 5
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 5,
    fontWeight: 'bold'
  },
  tableCol: {
    paddingHorizontal: 5,
    fontSize: 10
  },
  col1: {
    width: '25%'
  },
  col2: {
    width: '45%'
  },
  col3: {
    width: '30%'
  },
  sensorValue: {
    fontSize: 12,
    marginBottom: 5
  },
  critical: {
    color: '#e74c3c'
  },
  warning: {
    color: '#f39c12'
  },
  normal: {
    color: '#2ecc71'
  },
  info: {
    color: '#3498db'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  }
});

interface PDFReportProps {
  sensorData: SensorData[];
  alerts: AlertData[];
  location: string;
  systemStatus: string;
  generatedAt: Date;
}

const PDFReport: React.FC<PDFReportProps> = ({ 
  sensorData, 
  alerts, 
  location, 
  systemStatus, 
  generatedAt 
}) => {
  const formattedDate = format(generatedAt, "PPPPpppp", { locale: es });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Monitoreo del Dashboard</Text>
          <Text style={styles.subtitle}>Generado el: {formattedDate}</Text>
        </View>

        {/* 1. Resumen del Estado del Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Resumen del Estado del Sistema</Text>
          <Text style={styles.subtitle}>Fecha y Hora del Reporte: {formattedDate}</Text>
          <Text style={styles.subtitle}>Ubicación del Sistema: {location}</Text>
          <Text style={styles.subtitle}>Estado General: {systemStatus}</Text>
        </View>

        {/* 2. Datos de Sensores y Visualización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Datos de Sensores y Visualización</Text>
          <Text style={styles.subtitle}>
            El dashboard muestra las siguientes métricas en tiempo real:
          </Text>
          
          {sensorData.map((sensor, index) => (
            <Text key={index} style={[
              styles.sensorValue,
              sensor.status === 'critical' ? styles.critical :
              sensor.status === 'warning' ? styles.warning : styles.normal
            ]}>
              {sensor.title}: {sensor.value !== null ? `${sensor.value} ${sensor.unit}` : "Sensor desconectado"}
              {sensor.value !== null && ` (Actualizado: ${format(sensor.lastUpdated, 'HH:mm:ss')})`}
            </Text>
          ))}

          <Text style={styles.subtitle}>
            Las métricas se visualizan mediante:
          </Text>
          <Text style={styles.sensorValue}>• Gráficos en tiempo real con historial de datos.</Text>
          <Text style={styles.sensorValue}>• Indicadores de alerta cuando los valores superan umbrales definidos.</Text>
          <Text style={styles.sensorValue}>• Listados de eventos recientes relacionados con el monitoreo.</Text>
        </View>

        {/* 3. Alertas Generadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Alertas Generadas</Text>
          <Text style={styles.subtitle}>
            Las alertas se clasifican en:
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCol, styles.col1]}>Tipo de Alerta</Text>
              <Text style={[styles.tableCol, styles.col2]}>Descripción</Text>
              <Text style={[styles.tableCol, styles.col3]}>Nivel de Urgencia</Text>
            </View>
            
            {alerts.map((alert, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.col1]}>{alert.type}</Text>
                <Text style={[styles.tableCol, styles.col2]}>{alert.description}</Text>
                <Text style={[styles.tableCol, styles.col3, 
                  alert.urgency === 'critical' ? styles.critical : 
                  alert.urgency === 'high' ? styles.warning : 
                  alert.urgency === 'info' ? styles.info : styles.normal
                ]}>
                  {alert.urgency === 'critical' ? '🚨 Crítico' : 
                   alert.urgency === 'high' ? '⚠️ Alta' : 
                   alert.urgency === 'info' ? 'ℹ️ Informativo' : 'Normal'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Acciones Recomendadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Acciones Recomendadas</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCol, styles.col1]}>Alerta</Text>
              <Text style={[styles.tableCol, styles.col2]}>Acción Correctiva</Text>
              <Text style={[styles.tableCol, styles.col3]}>Responsable</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>Sensor desconectado</Text>
              <Text style={[styles.tableCol, styles.col2]}>Revisar conexión del sensor o reiniciar sistema</Text>
              <Text style={[styles.tableCol, styles.col3]}>Equipo Técnico</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>Temperatura muy alta</Text>
              <Text style={[styles.tableCol, styles.col2]}>Verificar ventilación o sistema de enfriamiento</Text>
              <Text style={[styles.tableCol, styles.col3]}>Mantenimiento</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>Humedad muy alta</Text>
              <Text style={[styles.tableCol, styles.col2]}>Ajustar sistema de riego o ventilación</Text>
              <Text style={[styles.tableCol, styles.col3]}>Mantenimiento</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>Humedad muy baja</Text>
              <Text style={[styles.tableCol, styles.col2]}>Aumentar frecuencia de riego</Text>
              <Text style={[styles.tableCol, styles.col3]}>Mantenimiento</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>Datos repetidos</Text>
              <Text style={[styles.tableCol, styles.col2]}>Verificar funcionamiento del sensor</Text>
              <Text style={[styles.tableCol, styles.col3]}>Equipo Técnico</Text>
            </View>
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>Reporte generado automáticamente por el Sistema de Monitoreo de Sensores</Text>
        </View>
      </Page>
    </Document>
  );
};

interface PDFGeneratorProps {
  sensorData: SensorData[];
  alerts: AlertData[];
  location?: string;
  systemStatus?: string;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  sensorData, 
  alerts, 
  location = "Invernadero Principal, Campus Universitario", 
  systemStatus = "Sistema operando con alertas activas" 
}) => {
  return (
    <PDFDownloadLink
      document={
        <PDFReport 
          sensorData={sensorData} 
          alerts={alerts} 
          location={location} 
          systemStatus={systemStatus} 
          generatedAt={new Date()} 
        />
      }
      fileName={`reporte-sensores-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`}
    >
      {({ loading }) => (
        <button 
          disabled={loading} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando reporte...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Reporte PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};