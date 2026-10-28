import {
  CHART_DATA_24H,
  CHART_DATA_30D,
  CHART_DATA_7D,
  ENVIRONMENT_METRICS,
  INITIAL_ALERTS,
  INITIAL_GARDEN_BEDS,
} from '../data/mockGardenData';
import type {
  ChartDataPoint,
  EnvironmentMetric,
  GardenAlert,
  GardenBed,
  SensorReading,
  SensorReadingResponse,
} from '../types/garden';

type MoisturePeriod = '24h' | '7d' | '30d';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ?? '';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const MOCK_DELAY_MS = 350;

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Configure VITE_API_URL antes de desativar os dados mockados.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status} em ${path}.`);
  }

  return response.json() as Promise<T>;
}

export async function getGardenBeds(): Promise<GardenBed[]> {
  if (!USE_MOCK) return request<GardenBed[]>('/canteiros');
  await delay();
  return structuredClone(INITIAL_GARDEN_BEDS);
}

export async function getAlerts(): Promise<GardenAlert[]> {
  if (!USE_MOCK) return request<GardenAlert[]>('/alertas');
  await delay();
  return structuredClone(INITIAL_ALERTS);
}

export async function getEnvironmentMetrics(): Promise<EnvironmentMetric[]> {
  if (!USE_MOCK) return request<EnvironmentMetric[]>('/metricas-ambiente');
  await delay();
  return structuredClone(ENVIRONMENT_METRICS);
}

export async function getMoistureChart(period: MoisturePeriod): Promise<ChartDataPoint[]> {
  if (!USE_MOCK) {
    return request<ChartDataPoint[]>(`/graficos/umidade?periodo=${period}`);
  }

  await delay();
  const chartData = {
    '24h': CHART_DATA_24H,
    '7d': CHART_DATA_7D,
    '30d': CHART_DATA_30D,
  } satisfies Record<MoisturePeriod, ChartDataPoint[]>;
  return structuredClone(chartData[period]);
}

export async function getSensor(sensorId: string): Promise<{ sensor_id: string; umidade: number }> {
  if (!USE_MOCK) {
    return request<{ sensor_id: string; umidade: number }>(
      `/sensores/${encodeURIComponent(sensorId)}`,
    );
  }
  await delay();
  return { sensor_id: sensorId, umidade: 45.2 };
}

export async function submitSensorReading(
  reading: SensorReading,
): Promise<SensorReadingResponse> {
  if (!USE_MOCK) {
    return request<SensorReadingResponse>('/sensores/leituras', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  }

  await delay();
  const { sensor_id, tipo_planta = 'padrao', ...measurements } = reading;
  const alertas: string[] = [];
  const limits = {
    tomate: {
      umidade_solo: [30, 70],
      umidade_ar: [50, 85],
      temperatura: [10, 34],
      luminosidade: [0, 120000],
    },
    alface: {
      umidade_solo: [25, 70],
      umidade_ar: [40, 85],
      temperatura: [6, 30],
      luminosidade: [0, 120000],
    },
    padrao: {
      umidade_solo: [30, 70],
      umidade_ar: [40, 85],
      temperatura: [12, 32],
      luminosidade: [0, 120000],
    },
  } as const;
  const plantLimits = limits[tipo_planta.toLowerCase() as keyof typeof limits] ?? limits.padrao;

  for (const [metric, value] of Object.entries(measurements)) {
    const [minimum, maximum] = plantLimits[metric as keyof typeof plantLimits];
    if (value < minimum) alertas.push(`${metric}: abaixo do ideal (${value})`);
    if (value > maximum) alertas.push(`${metric}: acima do ideal (${value})`);
  }

  return {
    status: 'recebido',
    dados: { ...reading, sensor_id, tipo_planta },
    alertas,
  };
}
