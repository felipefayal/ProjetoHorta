export interface GardenBed {
  id: string;
  name: string;
  plant: string;
  plantType: string;
  moisture: number; // percentage
  temperature: number; // Celsius
  status: 'Normal' | 'Solo seco' | 'Atenção' | 'Excesso de água';
  lastWatered?: string;
  solarExposure?: string;
  plantedDate?: string;
}

export interface GardenAlert {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  type: 'moisture' | 'temperature' | 'record' | 'system';
  severity: 'warning' | 'info' | 'critical';
  bedId?: string;
  read?: boolean;
}

export interface EnvironmentMetric {
  title: string;
  value: string;
  status: string;
  icon: 'sun' | 'cloud-rain' | 'thermometer' | 'droplet';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  time: string;
  status?: string;
}

export interface NewRecordForm {
  bedId: string;
  type: 'irrigacao' | 'leitura' | 'plantio' | 'adubacao' | 'poda';
  plant: string;
  moisture: number;
  temperature: number;
  notes: string;
}
