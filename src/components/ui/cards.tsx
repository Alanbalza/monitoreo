import * as React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"
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
  RefreshCw
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="font-medium">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {payload[0].value} {payload[0].payload.unit}
        </p>
      </div>
    )
  }
  return null
}

function SensorChart({ 
  title, 
  description, 
  data, 
  color,
  unit,
  trend = { value: 5.2, up: true },
  showCheck = false,
  isActive = true
}: SensorChartProps) {
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
            {trend.up ? "Subiendo" : "Bajando"} un {trend.value}% esta semana{" "}
            {showCheck ? <Check className="h-4 w-4" /> : trend.up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando {title.toLowerCase()} de los últimos 7 días ({unit})
          </div>
        </CardFooter>
      )}
    </Card>
  )
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
  isUpdating = false
}: { 
  icon: React.ElementType, 
  title: string, 
  value: number | string, 
  unit: string, 
  description: string,
  iconColor: string,
  trend?: { value: number, up: boolean },
  showCheck?: boolean,
  isActive?: boolean,
  lastUpdated?: Date,
  isUpdating?: boolean
}) {
  return (
    <Card className="w-full h-full flex flex-col relative">
      {!isActive && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Inactivo
        </div>
      )}
      
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full`} style={{ 
            backgroundColor: `${iconColor}20`,
            opacity: isActive ? 1 : 0.5 
          }}>
            <Icon color={isActive ? iconColor : "#6B7280"} size={24} strokeWidth={1.5} />
          </div>
          <div>
            <CardTitle className={isActive ? "text-lg" : "text-lg text-gray-400"}>{title}</CardTitle>
            <CardDescription className={isActive ? "" : "text-gray-400"}>{description}</CardDescription>
          </div>
        </div>
        {isUpdating && (
          <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        )}
        {!isUpdating && trend && isActive && (
          <div className="flex items-center gap-1 text-sm font-medium" style={{ color: trend.up ? '#10B981' : '#EF4444' }}>
            {trend.up ? '+' : ''}{trend.value}% 
            {showCheck ? <Check className="h-4 w-4" /> : trend.up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        {isActive ? (
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: iconColor }}>
              {value} <span className="text-xl font-normal text-muted-foreground">{unit}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Actualizado: {lastUpdated?.toLocaleTimeString() || 'Nunca'}
            </p>
          </div>
        ) : (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sensor inactivo</AlertTitle>
            <AlertDescription>
              Último valor válido: {value} {unit} ({lastUpdated?.toLocaleTimeString() || 'Nunca'})
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

const validateSensorData = (data: any) => {
  if (!data) {
    console.error('Datos vacíos recibidos');
    return false;
  }
  
  // Validar que todos los campos sean números válidos y no nulos
  const isValid = (
    data.temperatura !== null && !isNaN(data.temperatura) &&
    data.humedad !== null && !isNaN(data.humedad) &&
    data.luminosidad !== null && !isNaN(data.luminosidad) &&
    data.humedad_suelo !== null && !isNaN(data.humedad_suelo)
  );

  if (!isValid) {
    console.error('Datos inválidos recibidos:', {
      temperatura: data.temperatura,
      humedad: data.humedad,
      luminosidad: data.luminosidad,
      humedad_suelo: data.humedad_suelo
    });
  }

  return isValid;
};

const processHistoricalData = (rawData: any[]) => {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return {
      temperature: [],
      humidity: [],
      luminosity: [],
      soilMoisture: []
    };
  }

  // Filtrar solo datos válidos
  const validData = rawData.filter(item => validateSensorData(item));

  const dailyData: Record<string, any> = {};

  validData.forEach(item => {
    const date = new Date(item.timestamp);
    const dateKey = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        temperature: [],
        humidity: [],
        luminosity: [],
        soilMoisture: []
      };
    }

    dailyData[dateKey].temperature.push(item.temperatura);
    dailyData[dateKey].humidity.push(item.humedad);
    dailyData[dateKey].luminosity.push(item.luminosidad);
    dailyData[dateKey].soilMoisture.push(item.humedad_suelo);
  });

  const result = {
    temperature: Object.keys(dailyData).map(date => ({
      date,
      value: Number((dailyData[date].temperature.reduce((a: number, b: number) => a + b, 0) / dailyData[date].temperature.length).toFixed(1))
    })),
    humidity: Object.keys(dailyData).map(date => ({
      date,
      value: Number((dailyData[date].humidity.reduce((a: number, b: number) => a + b, 0) / dailyData[date].humidity.length).toFixed(1))
    })),
    luminosity: Object.keys(dailyData).map(date => ({
      date,
      value: Number((dailyData[date].luminosity.reduce((a: number, b: number) => a + b, 0) / dailyData[date].luminosity.length).toFixed(1))
    })),
    soilMoisture: Object.keys(dailyData).map(date => ({
      date,
      value: Number((dailyData[date].soilMoisture.reduce((a: number, b: number) => a + b, 0) / dailyData[date].soilMoisture.length).toFixed(1))
    }))
  };

  return result;
};

export default function SensorDashboard() {
  const [sensorData, setSensorData] = React.useState([
    {
      id: 1,
      icon: Thermometer,
      title: "Temperatura",
      value: 0,
      unit: "°C",
      description: "Temperatura actual",
      iconColor: "#EF4444",
      trend: { value: 3.2, up: true },
      isActive: true,
      lastUpdated: new Date()
    },
    {
      id: 2,
      icon: Droplet,
      title: "Humedad",
      value: 0,
      unit: "%",
      description: "Humedad relativa",
      iconColor: "#3B82F6",
      trend: { value: 2.8, up: false },
      isActive: true,
      lastUpdated: new Date()
    },
    {
      id: 3,
      icon: Sun,
      title: "Luminosidad",
      value: 0,
      unit: "lx",
      description: "Nivel de luz",
      iconColor: "#F59E0B",
      trend: { value: 4.5, up: true },
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
      trend: { value: 1.5, up: false },
      isActive: true,
      lastUpdated: new Date()
    }
  ]);

  const [historicalData, setHistoricalData] = React.useState<Record<string, ChartData[]>>({
    temperature: [],
    humidity: [],
    luminosity: [],
    soilMoisture: []
  });

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [dataHistory, setDataHistory] = React.useState<any[]>([]);
  const [connectionError, setConnectionError] = React.useState(false);
  const [dataError, setDataError] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [lastApiUpdate, setLastApiUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCurrentData = async () => {
    if (isUpdating) return; // Evitar múltiples llamadas simultáneas
    
    setIsUpdating(true);
    try {
      const now = new Date();
      const response = await fetch('http://3.226.1.115:8029/datos', {
        signal: AbortSignal.timeout(5000),
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

      const sensorValues = data[0];
      const dataIsValid = validateSensorData(sensorValues);

      if (!dataIsValid) {
        console.error('Datos inválidos:', sensorValues);
        throw new Error('Datos de sensores inválidos');
      }

      // Actualizar historial
      setDataHistory(prev => {
        const newHistory = [...prev, { ...sensorValues, timestamp: now.toISOString() }];
        return newHistory.slice(-1000); // Mantener solo los últimos 1000 registros
      });

      // Actualizar sensores con los últimos datos válidos
      setSensorData(prev => prev.map(sensor => {
        const newValue = 
          sensor.id === 1 ? sensorValues.temperatura :
          sensor.id === 2 ? sensorValues.humedad :
          sensor.id === 3 ? sensorValues.luminosidad :
          sensorValues.humedad_suelo;

        return {
          ...sensor,
          value: newValue,
          isActive: true,
          lastUpdated: now,
          trend: {
            value: sensor.trend.value,
            up: Math.random() > 0.5
          }
        };
      }));

      setConnectionError(false);
      setDataError(false);

    } catch (error) {
      console.error('Error al obtener datos:', error);
      setConnectionError(true);
      setDataError(true);
      
      // Mantener los últimos valores pero marcar como inactivos
      setSensorData(prev => prev.map(sensor => ({
        ...sensor,
        isActive: false
      })));
    } finally {
      setIsUpdating(false);
    }
  };

  // Obtener datos cada 2 segundos
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Función para manejar la obtención de datos
    const fetchData = async () => {
      try {
        await fetchCurrentData();
      } catch (error) {
        console.error('Error en la actualización periódica:', error);
      }
    };

    // Llamar inmediatamente al montar el componente
    fetchData();
    
    // Configurar el intervalo para actualizar cada 2 segundos
    intervalId = setInterval(fetchData, 2000);

    // Limpieza al desmontar el componente
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Procesar datos históricos
  React.useEffect(() => {
    const processed = processHistoricalData(dataHistory);
    setHistoricalData(processed);
  }, [dataHistory]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Sensores</h1>
          <p className="text-sm text-gray-600">
            Monitoreo en tiempo real de las condiciones ambientales
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {isUpdating && (
                <span className="ml-1 inline-flex items-center">
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  Actualizando...
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
            isUpdating={isUpdating}
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
          trend={{ value: 3.2, up: true }}
          isActive={sensorData.find(s => s.id === 1)?.isActive}
        />
        <SensorChart
          title="Humedad"
          description="Historial de humedad"
          data={historicalData.humidity}
          color="#3B82F6"
          unit="%"
          trend={{ value: 2.8, up: false }}
          isActive={sensorData.find(s => s.id === 2)?.isActive}
        />
        <SensorChart
          title="Luminosidad"
          description="Historial de luminosidad"
          data={historicalData.luminosity}
          color="#F59E0B"
          unit="lx"
          trend={{ value: 4.5, up: true }}
          showCheck={true}
          isActive={sensorData.find(s => s.id === 3)?.isActive}
        />
        <SensorChart
          title="Humedad del Suelo"
          description="Historial de Humedad del Suelo"
          data={historicalData.soilMoisture}
          color="#8B5CF6"
          unit="%"
          trend={{ value: 1.5, up: false }}
          isActive={sensorData.find(s => s.id === 4)?.isActive}
        />
      </div>
    </div>
  )
}