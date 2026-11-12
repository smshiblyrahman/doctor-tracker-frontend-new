export type Gender = "male" | "female" | "other";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiList<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
  lastLoginAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  /** null when the patient service was unavailable. */
  patientCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  condition: string;
  phone: string;
  doctor: string;
  doctorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

export interface PatientFilterOptions {
  conditions: string[];
}

export type TrendRange = "7d" | "30d" | "90d" | "12m";

export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  averagePatientAge: number;
  newDoctorsThisMonth: number;
  newPatientsThisMonth: number;
  doctorGrowthPct: number | null;
  patientGrowthPct: number | null;
  genders: Array<{ gender: Gender; count: number }>;
}

export interface TrendPoint {
  date: string;
  patients: number;
  doctors: number;
}

export interface Trends {
  range: TrendRange;
  unit: "day" | "month";
  series: TrendPoint[];
}

export interface PatientsPerDoctor {
  doctorsWithPatients: number;
  items: Array<{ doctorId: string; doctorName: string; count: number }>;
}

export interface ConditionCount {
  condition: string;
  count: number;
}

/** Query-string values accepted by list endpoints. */
export type QueryParams = Record<string, string | number | undefined>;
