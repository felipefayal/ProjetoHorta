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
  GardenBedActionResponse,
  GardenRecord,
  GardenRecordResponse,
  GardenAlert,
  GardenBed,
  School,
  SensorDevice,
  UserProfile,
} from '../types/garden';

type MoisturePeriod = '24h' | '7d' | '30d';

const API_BASE_URL = (import.meta.env.VITE_API_URL?.trim() || '/api').replace(/\/+$/, '');
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_DELAY_MS = 350;
const mockGardenBeds = structuredClone(INITIAL_GARDEN_BEDS);
const mockAlerts = structuredClone(INITIAL_ALERTS);
const SESSION_KEY = 'projetohorta.session';

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Configure VITE_API_URL antes de desativar os dados mockados.');
  }

  const token = typeof window === 'undefined' ? null : window.localStorage.getItem(SESSION_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || `A API respondeu com erro ${response.status} em ${path}.`);
  }
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: UserProfile;
}

function saveSession(response: AuthResponse): UserProfile {
  window.localStorage.setItem(SESSION_KEY, response.access_token);
  return response.user;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return saveSession(response);
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return saveSession(response);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!window.localStorage.getItem(SESSION_KEY)) return null;
  try {
    return await request<UserProfile>('/auth/me');
  } catch (error) {
    if (error instanceof Error && error.message === 'Sessão inválida ou expirada.') {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    throw error;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function getGardenBeds(): Promise<GardenBed[]> {
  if (!USE_MOCK) return request<GardenBed[]>('/canteiros');
  await delay();
  return structuredClone(mockGardenBeds);
}

export async function getSchools(): Promise<School[]> {
  return request<School[]>('/colegios');
}

export async function getDevices(): Promise<SensorDevice[]> {
  return request<SensorDevice[]>('/dispositivos');
}

export async function assignDeviceToSchool(deviceId: number, schoolId: number): Promise<void> {
  await request<void>(
    `/dispositivos/${deviceId}/colegios/${schoolId}`,
    { method: 'PUT' },
  );
}

export async function getAlerts(): Promise<GardenAlert[]> {
  if (!USE_MOCK) return request<GardenAlert[]>('/alertas');
  await delay();
  return structuredClone(mockAlerts);
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

export async function getSensor(sensorId: string): Promise<{
  sensor_id: number;
  data_hora: string | null;
  umidade_solo: number | null;
  umidade_ar: number | null;
  temperatura: number | null;
  luminosidade: number | null;
}> {
  if (!USE_MOCK) {
    return request<{
      sensor_id: number;
      data_hora: string | null;
      umidade_solo: number | null;
      umidade_ar: number | null;
      temperatura: number | null;
      luminosidade: number | null;
    }>(
      `/sensores/${encodeURIComponent(sensorId)}`,
    );
  }
  await delay();
  return {
    sensor_id: Number(sensorId),
    data_hora: null,
    umidade_solo: null,
    umidade_ar: null,
    temperatura: null,
    luminosidade: null,
  };
}

export async function irrigateGardenBed(bedId: string): Promise<GardenBedActionResponse> {
  if (USE_MOCK) {
    await delay();
    const bed = mockGardenBeds.find((item) => item.id === bedId);
    if (!bed) throw new Error('Canteiro não encontrado.');
    Object.assign(bed, {
      moisture: 72,
      temperature: 25.4,
      status: 'Normal',
      lastWatered: 'Agora mesmo',
    });
    for (const alert of mockAlerts) {
      if (alert.bedId === bedId && alert.type === 'moisture') alert.read = true;
    }
    return {
      bed: structuredClone(bed),
      alerts: structuredClone(mockAlerts),
    };
  }
  return request<GardenBedActionResponse>(
    `/canteiros/${encodeURIComponent(bedId)}/irrigacao`,
    { method: 'POST' },
  );
}

export async function createGardenRecord(
  record: GardenRecord,
): Promise<GardenRecordResponse> {
  if (USE_MOCK) {
    await delay();
    const bed = mockGardenBeds.find((item) => item.id === record.bedId);
    if (!bed) throw new Error('Canteiro não encontrado.');
    Object.assign(bed, {
      moisture: record.moisture,
      temperature: record.temperature,
      status: record.moisture < 40
        ? 'Solo seco'
        : record.moisture > 80
        ? 'Excesso de água'
        : 'Normal',
    });
    if (record.type === 'irrigacao') bed.lastWatered = 'Agora mesmo';
    if (record.type === 'plantio' && record.plantName) {
      bed.plant = record.plantName;
      bed.plantType = record.plantName;
    }
    const alert: GardenAlert = {
      id: `alert-${Date.now()}`,
      title: record.type === 'irrigacao'
        ? 'Irrigação registrada'
        : record.type === 'plantio'
        ? 'Novo plantio registrado'
        : 'Nova medição cadastrada',
      description: `${bed.name}: ${record.notes || `Umidade em ${record.moisture}% e temperatura de ${record.temperature}°C.`}`,
      timeAgo: 'Agora mesmo',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'record',
      severity: 'info',
      bedId: bed.id,
      read: false,
    };
    mockAlerts.unshift(alert);
    return {
      bed: structuredClone(bed),
      alert: structuredClone(alert),
      alerts: structuredClone(mockAlerts),
    };
  }
  return request<GardenRecordResponse>('/registros', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function markAlertsAsRead(): Promise<GardenAlert[]> {
  if (USE_MOCK) {
    await delay();
    for (const alert of mockAlerts) alert.read = true;
    return structuredClone(mockAlerts);
  }
  return request<GardenAlert[]>('/alertas/lidas', { method: 'PATCH' });
}
