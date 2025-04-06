import * as React from "react";
import { PDFGenerator } from './PDFGenerator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { 
  Thermometer, 
  Droplet, 
  Sun,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Check,
  Wind,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { io, Socket } from "socket.io-client";

interface ChartData {
  date: string;
  value: number;
}

interface TrendData {
  value: number;
  up: boolean;
}

interface SensorChartProps {
  title: string;
  description: string;
  data: ChartData[];
  color: string;
  unit: string;
  trend?: TrendData;
  showCheck?: boolean;
  isActive?: boolean;
}

interface CustomThermometerProps {
  temperatura: number;
  max?: number;
  min?: number;
}

interface CustomHumidityDropProps {
  humedad: number;
}

const CustomThermometer: React.FC<CustomThermometerProps> = ({ temperatura, max = 40, min = 0 }) => {
  const fillPercentage = Math.min(Math.max(((temperatura - min) / (max - min)) * 100, 0), 100);
  
  const getColor = (temp: number): string => {
    if (temp < 10) return "#3B82F6";
    if (temp < 25) return "#10B981";
    return "#EF4444";
  };
  
  const fillColor = getColor(temperatura);
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative h-32 w-10 mb-2 flex items-center justify-center">
        <div className="absolute bottom-0 w-10 h-10 bg-white border-2 border-gray-300 rounded-full overflow-hidden flex items-center justify-center">
          <div 
            className="w-8 h-8 rounded-full" 
            style={{ backgroundColor: fillColor }}
          />
        </div>
        
        <div className="absolute bottom-8 w-4 h-24 bg-white border-2 border-gray-300 rounded-t-lg overflow-hidden">
          <div 
            className="w-full absolute bottom-0 rounded-t-sm transition-all duration-500 ease-in-out"
            style={{ 
              height: `${fillPercentage}%`,
              backgroundColor: fillColor 
            }}
          />
        </div>
        
        <div className="absolute bottom-8 -left-4 h-24 flex flex-col justify-between items-end">
          <span className="text-xs">{max}°C</span>
          <span className="text-xs">{(max+min)/2}°C</span>
          <span className="text-xs">{min}°C</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold" style={{ color: fillColor }}>
          {temperatura} <span className="text-xl font-normal text-muted-foreground">°C</span>
        </p>
      </div>
    </div>
  );
};

const CustomHumidityDrop: React.FC<CustomHumidityDropProps> = ({ humedad }) => {
  const fillPercentage = Math.min(Math.max(humedad, 0), 100);
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative h-32 w-24 mb-2 flex items-center justify-center">
        <div className="absolute w-20 h-28 border-2 border-gray-300 rounded-full rounded-t-[60%] overflow-hidden">
          <div className="absolute inset-0 border-t-transparent border-1 rounded-full rounded-t-[60%]">
            <div 
              className="absolute bottom-0 w-full transition-all duration-500 ease-in-out"
              style={{ 
                height: `${fillPercentage}%`,
                backgroundColor: "#3B82F6",
                opacity: fillPercentage / 100 * 0.8 + 0.2
              }}
            />
          </div>
        </div>
        
        <div className="absolute -right-6 h-28 flex flex-col justify-between items-start">
          <span className="text-xs">100%</span>
          <span className="text-xs">50%</span>
          <span className="text-xs">0%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold" style={{ color: "#3B82F6" }}>
          {humedad} <span className="text-xl font-normal text-muted-foreground">%</span>
        </p>
      </div>
    </div>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="font-medium">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {payload[0].payload.unit === '%' && payload[0].name === 'soilMoisture' 
            ? payload[0].value.toFixed(2) // Mostrar 2 decimales solo para humedad del suelo
            : payload[0].value.toFixed(1)} {payload[0].payload.unit}
        </p>
      </div>
    );
  }
  return null;
};

const SensorChart: React.FC<SensorChartProps> = ({ 
  title, 
  description, 
  data, 
  color,
  unit,
  trend = { value: 5.2, up: true },
  showCheck = false,
  isActive = true
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className={`text-lg ${!isActive && "text-gray-400"}`}>{title}</CardTitle>
        <CardDescription className={!isActive ? "text-gray-400" : ""}>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px]">
        {isActive ? (
          data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.map(item => ({ ...item, unit }))}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fill: '#6B7280' }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Esperando datos</AlertTitle>
                <AlertDescription>
                  No hay datos históricos disponibles aún
                </AlertDescription>
              </Alert>
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Datos no disponibles</AlertTitle>
              <AlertDescription>
                El sensor no está enviando datos válidos
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      {isActive && data.length > 0 && (
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium leading-none" style={{ color: trend.up ? '#10B981' : '#EF4444' }}>
            {/* {trend.up ? "Subiendo" : "Bajando"} un {trend.value}% esta semana{" "}
            {showCheck ? <Check className="h-4 w-4" /> : trend.up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )} */}
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando {title.toLowerCase()} de las últimas horas ({unit})
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

interface SensorCardProps {
  icon: React.ElementType;
  title: string;
  value: number | null; // Cambiado a permitir null
  unit: string;
  description: string;
  iconColor: string;
  trend?: { value: number; up: boolean };
  showCheck?: boolean;
  isActive?: boolean;
  lastUpdated?: Date;
  isUpdating?: boolean;
  customDisplay?: ((value: number) => React.ReactNode) | null;
}

function SensorCard({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  description,
  iconColor,
  trend,
  showCheck = false,
  isActive = true,
  lastUpdated,
  customDisplay = null
}: SensorCardProps) {
  const [isNewData, setIsNewData] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    if (value !== null) {
      setIsNewData(true);
      setIsUpdating(true);
      
      const updateTimer = setTimeout(() => setIsUpdating(false), 1000);
      const scaleTimer = setTimeout(() => setIsNewData(false), 500);
      
      return () => {
        clearTimeout(updateTimer);
        clearTimeout(scaleTimer);
      };
    }
  }, [value]);

  // Determinar si el sensor está desconectado (valor null o NaN)
  const isDisconnected = value === null || (typeof value === 'number' && isNaN(value));

  return (
    <Card className="w-full h-full flex flex-col relative">
      {isDisconnected && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Desconectado
        </div>
      )}
      
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full" style={{ 
            backgroundColor: `${iconColor}20`,
            opacity: !isDisconnected ? 1 : 0.5 
          }}>
            {typeof Icon === 'function' && <Icon color={!isDisconnected ? iconColor : "#6B7280"} size={24} strokeWidth={1.5} />}
          </div>
          <div>
            <CardTitle className={!isDisconnected ? "text-lg" : "text-lg text-gray-400"}>{title}</CardTitle>
            <CardDescription className={!isDisconnected ? "" : "text-gray-400"}>{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isUpdating && !isDisconnected && (
            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {trend && !isDisconnected && !isUpdating && (
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: trend.up ? '#10B981' : '#EF4444' }}>
              {trend.up ? '+' : ''}{trend.value}% 
              {showCheck ? <Check className="h-4 w-4" /> : trend.up ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
        {!isDisconnected ? (
          <div className={`w-full h-full flex flex-col items-center transition-all duration-300 ${isNewData ? 'scale-105' : 'scale-100'}`}>
            {customDisplay && typeof value === 'number' ? customDisplay(value) : (
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: iconColor }}>
                  {value} <span className="text-xl font-normal text-muted-foreground">{unit}</span>
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Actualizado: {lastUpdated?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || 'Nunca'}
            </p>
          </div>
        ) : (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sensor desconectado</AlertTitle>
            <AlertDescription>
              No se están recibiendo datos de este sensor
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

interface SensorReading {
  temperatura: number;
  humedad: number;
  luminosidad: number;
  humedad_suelo: number;
  timestamp?: string;
}

const validateSensorData = (data: SensorReading | null): boolean => {
  if (!data) return false;
  
  return (
    (data.temperatura !== null && !isNaN(data.temperatura)) ||
    (data.humedad !== null && !isNaN(data.humedad)) ||
    (data.luminosidad !== null && !isNaN(data.luminosidad)) ||
    (data.humedad_suelo !== null && !isNaN(data.humedad_suelo))
  );
};

interface ProcessedData {
  temperature: ChartData[];
  humidity: ChartData[];
  luminosity: ChartData[];
  soilMoisture: ChartData[];
}

const processHistoricalData = (rawData: SensorReading[]): ProcessedData => {
  if (!Array.isArray(rawData)) {
    return {
      temperature: [],
      humidity: [],
      luminosity: [],
      soilMoisture: []
    };
  }

  const validData = rawData.filter(item => validateSensorData(item));

  // Función para redondear el tiempo al intervalo de 2 minutos más cercano
  const roundToTwoMinutes = (date: Date): Date => {
    const timestamp = date.getTime();
    const twoMinutes = 15 * 60 * 1000; // 2 minutos en milisegundos
    return new Date(Math.round(timestamp / twoMinutes) * twoMinutes);
  };

  const intervalData: Record<string, any> = {};

  validData.forEach(item => {
    const date = new Date(item.timestamp || '');
    const roundedDate = roundToTwoMinutes(date);
    const dateKey = roundedDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    if (!intervalData[dateKey]) {
      intervalData[dateKey] = {
        date: dateKey,
        temperature: [],
        humidity: [],
        luminosity: [],
        soilMoisture: []
      };
    }

    intervalData[dateKey].temperature.push(item.temperatura);
    intervalData[dateKey].humidity.push(item.humedad);
    intervalData[dateKey].luminosity.push(item.luminosidad);
    intervalData[dateKey].soilMoisture.push(item.humedad_suelo);
  });

  return {
    temperature: Object.keys(intervalData).map(date => ({
      date,
      value: Number((intervalData[date].temperature.reduce((a: number, b: number) => a + b, 0) / intervalData[date].temperature.length).toFixed(1))
    })),
    humidity: Object.keys(intervalData).map(date => ({
      date,
      value: Number((intervalData[date].humidity.reduce((a: number, b: number) => a + b, 0) / intervalData[date].humidity.length).toFixed(2))
    })),
    luminosity: Object.keys(intervalData).map(date => ({
      date,
      value: Number((intervalData[date].luminosity.reduce((a: number, b: number) => a + b, 0) / intervalData[date].luminosity.length).toFixed(1))
    })),
    soilMoisture: Object.keys(intervalData).map(date => ({
      date,
      value: Number((intervalData[date].soilMoisture.reduce((a: number, b: number) => a + b, 0) / intervalData[date].soilMoisture.length).toFixed(2))
    }))
  };
};

interface SensorInfo {
  id: number;
  icon: React.ElementType;
  title: string;
  value: number;
  unit: string;
  description: string;
  iconColor: string;
  trend: { value: number; up: boolean };
  showCheck?: boolean;
  isActive: boolean;
  lastUpdated: Date;
  customDisplay?: ((value: number) => React.ReactNode) | null;
}

export default function SensorDashboard() {
  
  const [sensorData, setSensorData] = React.useState<SensorInfo[]>([
    
    {
      id: 1,
      icon: Thermometer,
      title: "Temperatura",
      value: 0,
      unit: "°C",
      description: "Temperatura actual",
      iconColor: "#EF4444",
      trend: { value: 0, up: true },
      isActive: true,
      lastUpdated: new Date(),
      customDisplay: (value: number) => <CustomThermometer temperatura={value} />
    },
    {
      id: 2,
      icon: Droplet,
      title: "Humedad",
      value: 0,
      unit: "%",
      description: "Humedad relativa",
      iconColor: "#3B82F6",
      trend: { value: 0, up: false },
      isActive: true,
      lastUpdated: new Date(),
      customDisplay: (value: number) => <CustomHumidityDrop humedad={value} />
    },
    {
      id: 3,
      icon: Sun,
      title: "Luminosidad",
      value: 0,
      unit: "lx",
      description: "Nivel de luz",
      iconColor: "#F59E0B",
      trend: { value: 0, up: true },
      showCheck: true,
      isActive: true,
      lastUpdated: new Date()
    },
    {
      id: 4,
      icon: Wind,
      title: "Humedad del Suelo",
      value: 0,
      unit: "%",
      description: "Humedad del suelo",
      iconColor: "#8B5CF6",
      trend: { value: 0, up: false },
      isActive: true,
      lastUpdated: new Date()
    }
  ]);

  const [historicalData, setHistoricalData] = React.useState<ProcessedData>({
    temperature: [],
    humidity: [],
    luminosity: [],
    soilMoisture: []
  });

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [dataHistory, setDataHistory] = React.useState<SensorReading[]>([]);
  const [connectionError, setConnectionError] = React.useState(false);
  const [dataError, setDataError] = React.useState(false);
  const [lastApiUpdate, setLastApiUpdate] = React.useState<Date | null>(null);
  const [socketConnected, setSocketConnected] = React.useState(false);
  const [currentSensorData, setCurrentSensorData] = React.useState<SensorReading | null>(null);
  
  const socketRef = React.useRef<Socket | null>(null);

  // Actualizar la hora cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Configurar conexión WebSocket
  React.useEffect(() => {
    socketRef.current = io("http://3.226.1.115:8029/datos", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado al WebSocket");
      setSocketConnected(true);
      setConnectionError(false);
      fetchInitialData();
    });

    socketRef.current.on("disconnect", () => {
      console.log("Desconectado del WebSocket");
      setSocketConnected(false);
      setConnectionError(true);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
      setSocketConnected(false);
      setConnectionError(true);
      if (!dataHistory.length) {
        fetchInitialData();
      }
    });

    // Escuchar datos en tiempo real
    socketRef.current.on("new_data", (data: SensorReading) => {
      const now = new Date();
      setLastApiUpdate(now);
      
      if (validateSensorData(data)) {
        setCurrentSensorData({
          ...data,
          timestamp: data.timestamp || now.toISOString()
        });
        
        setDataHistory(prev => [...prev, {
          ...data,
          timestamp: data.timestamp || now.toISOString()
        }].slice(-1000));
        
        setDataError(false);
      } else {
        console.error("Datos inválidos recibidos:", data);
        setDataError(true);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Actualizar las cards cuando llegan nuevos datos
  React.useEffect(() => {
    if (!currentSensorData) return;

    setSensorData(prev => prev.map(sensor => {
      let newValue: number;
      let trendUp: boolean = false;
      let trendValue: number = 0;

      const prevValue = prev.find(s => s.id === sensor.id)?.value || 0;

      switch(sensor.id) {
        case 1: // Temperatura
          newValue = currentSensorData.temperatura;
          trendUp = newValue > prevValue;
          trendValue = parseFloat(Math.abs(((newValue - prevValue) / (prevValue || 1)) * 100).toFixed(1));
          break;
        case 2: // Humedad
          newValue = currentSensorData.humedad;
          trendUp = newValue > prevValue;
          trendValue = parseFloat(Math.abs(((newValue - prevValue) / (prevValue || 1)) * 100).toFixed(1));
          break;
        case 3: // Luminosidad
          newValue = currentSensorData.luminosidad;
          trendUp = newValue > prevValue;
          trendValue = parseFloat(Math.abs(((newValue - prevValue) / (prevValue || 1)) * 100).toFixed(1));
          break;
        case 4: // Humedad del suelo
          newValue = currentSensorData.humedad_suelo;
          trendUp = newValue > prevValue;
          trendValue = parseFloat(Math.abs(((newValue - prevValue) / (prevValue || 1)) * 100).toFixed(1));
          break;
        default:
          newValue = sensor.value;
      }

      return {
        ...sensor,
        value: newValue,
        isActive: true,
        lastUpdated: new Date(),
        trend: {
          value: trendValue,
          up: trendUp
        }
      };
    }));
  }, [currentSensorData]);

  // Procesar datos históricos
  React.useEffect(() => {
    const processed = processHistoricalData(dataHistory);
    setHistoricalData(processed);
  }, [dataHistory]);

  // Función para obtener datos iniciales
  const fetchInitialData = async () => {
    try {
      const response = await fetch('http://3.226.1.115:8029/datos', {
        signal: AbortSignal.timeout(1000),
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setLastApiUpdate(new Date());

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Datos vacíos recibidos');
      }

      const validData = data.map(item => ({
        ...item,
        timestamp: item.timestamp || new Date().toISOString()
      }));
      
      setDataHistory(validData.slice(-1000));
      
      // Establecer el último dato recibido
      if (validData.length > 0) {
        const lastReading = validData[validData.length - 1];
        if (validateSensorData(lastReading)) {
          setCurrentSensorData(lastReading);
        }
      }

      setConnectionError(false);
      setDataError(false);
    } catch (error) {
      console.error('Error al obtener datos iniciales:', error);
      setConnectionError(true);
      setDataError(true);
    }
  };

  // Método de respaldo con polling
  const fallbackPolling = React.useCallback(async () => {
    if (socketConnected) return;
    await fetchInitialData();
  }, [socketConnected]);

  // Configurar polling de respaldo
  React.useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (!socketConnected) {
      pollingInterval = setInterval(fallbackPolling, 1000);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [socketConnected, fallbackPolling]);

  




  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Sensores</h1>
          <p className="text-sm text-gray-600">
            Monitoreo en tiempo real de las condiciones ambientales
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {socketConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Conectado en tiempo real</span>
              </div>
            ) : connectionError ? (
              <div className="flex items-center text-red-500">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Error de conexión</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-500">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                {/* <span>Conectando...</span> */}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {lastApiUpdate && (
                <span className="ml-1 text-xs text-gray-500">
                  (Últ. dato: {lastApiUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {connectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {dataError ? 'Error en datos recibidos' : 'Error de conexión'}
          </AlertTitle>
          <AlertDescription>
            {dataError ? (
              'Los sensores están enviando datos nulos o inválidos. Mostrando últimos valores conocidos.'
            ) : (
              'No se pudo conectar al servidor de sensores. Mostrando últimos valores conocidos.'
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {sensorData.map(sensor => (
          <SensorCard
            key={sensor.id}
            icon={sensor.icon}
            title={sensor.title}
            value={sensor.value}
            unit={sensor.unit}
            description={sensor.description}
            iconColor={sensor.iconColor}
            trend={sensor.trend}
            showCheck={sensor.showCheck}
            isActive={sensor.isActive}
            lastUpdated={sensor.lastUpdated}
            customDisplay={sensor.customDisplay}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SensorChart
          title="Temperatura"
          description="Historial de temperatura"
          data={historicalData.temperature}
          color="#EF4444"
          unit="°C"
          trend={sensorData.find(s => s.id === 1)?.trend || { value: 0, up: true }}
          isActive={sensorData.find(s => s.id === 1)?.isActive}
        />
        <SensorChart
          title="Humedad"
          description="Historial de humedad"
          data={historicalData.humidity}
          color="#3B82F6"
          unit="%"
          trend={sensorData.find(s => s.id === 2)?.trend || { value: 0, up: false }}
          isActive={sensorData.find(s => s.id === 2)?.isActive}
        />
        <SensorChart
          title="Luminosidad"
          description="Historial de luminosidad"
          data={historicalData.luminosity}
          color="#F59E0B"
          unit="lx"
          trend={sensorData.find(s => s.id === 3)?.trend || { value: 0, up: true }}
          showCheck={true}
          isActive={sensorData.find(s => s.id === 3)?.isActive}
        />
        <SensorChart
          title="Humedad del Suelo"
          description="Historial de Humedad del Suelo"
          data={historicalData.soilMoisture}
          color="#8B5CF6"
          unit="%"
          trend={sensorData.find(s => s.id === 4)?.trend || { value: 0, up: false }}
          isActive={sensorData.find(s => s.id === 4)?.isActive}
        />
      </div>
    </div>
  );
}