export interface SensorData {
    title: string;
    value: number | null;
    unit: string;
    status: 'normal' | 'warning' | 'critical';
  }
  
  export interface AlertData {
    type: string;
    description: string;
    urgency: 'critical' | 'high' | 'medium' | 'low' | 'info';
    sensor?: string;
    timestamp: Date;
  }
  
  export interface PDFGeneratorProps {
    sensorData: SensorData[];
    alerts: AlertData[];
    location?: string;
    systemStatus?: string;
  }