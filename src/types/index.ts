// User related types
export interface User {
  id: string;
  email: string;
  tier: 'starter' | 'pro';
  hourlyRate: number;
  jwt?: string;
}

// Job related types
export interface UpworkJob {
  title: string;
  description: string;
  budget?: string;
  estimatedDuration?: string;
  skills?: string[];
  url: string;
  postedDate?: string;
}

export interface JobData {
  title: string;
  description: string;
  budget?: string;
  skills?: string[];
  url: string;
  requirements?: string[];
}

// Estimate related types
export interface Estimate {
  id: string;
  jobId: string;
  totalCost: number;
  devDays: number;
  hourlyRate: number;
  createdAt: Date;
}

export interface EstimateData {
  id: string;
  totalCost: number;
  devDays: number;
  hourlyRate: number;
  tasks?: EstimateTask[];
  createdAt: string;
}

export interface EstimateTask {
  name: string;
  description: string;
  hours: number;
  cost: number;
}

// SOW related types
export interface SOW {
  id: string;
  estimateId: string;
  pdfUrl: string;
  status: 'generating' | 'ready' | 'failed';
}

export interface SOWData {
  id: string;
  content: string;
  estimateId: string;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Chrome storage types
export interface StorageData {
  user?: User;
  jwt?: string;
  lastRefresh?: number;
}

// Message types for extension communication
export interface ExtensionMessage {
  type: 'SCRAPE_JOB' | 'ESTIMATE_JOB' | 'GENERATE_SOW' | 'UPDATE_RATE' | 'CHECK_AUTH';
  payload?: any;
}

// Telemetry event types
export interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
} 