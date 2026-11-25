export interface GardenBed {
  id: string;
  name: string; // nome_identificacao
  plant: string; // Nome popular da planta
  plantType: string;
  moisture: number; // umidade_solo (float)
  temperature: number; // temperatura (float)
  status: 'Normal' | 'Solo seco' | 'Atenção' | 'Excesso de água';
  lastWatered?: string;
  solarExposure?: string;
  plantedDate?: string;
  deviceId?: number | null;
}

export interface GardenAlert {
  id: string;
  title: string;
  description: string; // mensagem do banco
  timeAgo: string;
  timestamp: string; // data_hora
  type: 'moisture' | 'temperature' | 'record' | 'system';
  severity: 'warning' | 'info' | 'critical';
  bedId?: string;
  read?: boolean;
}

export interface EnvironmentMetric {
  title: string;
  value: string | number; // Suporta valores numéricos/booleanos (0 ou 1) para luminosidade
  status: string;
  icon: 'sun' | 'cloud-rain' | 'thermometer' | 'droplet';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  time: string;
  status?: string;
}

export interface SensorDevice {
  id: number; // id_dispositivo
  nome: string;
  localizacao: string;
  status: boolean;
  bateria: number | null;
  atual_em?: string | null;
  schools: SchoolSummary[];
  canteiro_id?: string | null;
}

export interface SchoolSummary {
  id: number;
  name: string;
}

export interface School {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  devices: SchoolSummary[];
}

export interface UserProfile {
  id?: number;
  name: string;
  email?: string;
  role: string;
  profile: 'admin' | 'usuario'; // Restringe o gerenciamento de escolas e sensores
}

export interface NewRecordForm {
  bedId: string;
  type: 'irrigacao' | 'leitura' | 'plantio' | 'adubacao' | 'poda';
  plant: string;
  moisture: number;
  temperature: number;
  notes: string;
}

export interface SensorReading {
  sensor_id: string;
  umidade_solo: number;
  umidade_ar: number;
  temperatura: number;
  luminosidade: number; // 0 ou 1 conforme o sensor físico
  tipo_planta?: string;
}

export interface SensorReadingResponse {
  status: string;
  dados: SensorReading & { tipo_planta: string };
  alertas: string[];
}

export interface GardenRecordDraft {
  bedId: string;
  type: 'irrigacao' | 'leitura' | 'plantio';
  notes?: string;
  plantName?: string;
}

export interface GardenRecord extends GardenRecordDraft {
  moisture: number;
  temperature: number;
}

export interface GardenRecordResponse {
  bed: GardenBed;
  alert: GardenAlert | null;
  alerts: GardenAlert[];
}

export interface GardenBedActionResponse {
  bed: GardenBed;
  alerts: GardenAlert[];
}