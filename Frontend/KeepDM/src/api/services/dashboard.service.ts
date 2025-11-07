import { apiClient } from '../client'

export type ChartType = 'kpi' | 'line' | 'bar' | 'area' | 'pie' | 'table'
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface Widget {
  position: number
  chart_type: ChartType
  title: string
  columns: string[]
  aggregation: AggregationType | null
  filters: any | null
}

export interface Dashboard {
  _id: string
  user_id: string
  template_id: string
  data_id: string
  name: string
  layout_type: string
  widgets: Widget[]
  created_at: string
  updated_at: string
}

// Interfaces para data procesada del dashboard
export interface KPIWidgetData {
  value: number
  label: string
}

export interface ChartWidgetData {
  labels: string[]
  data: number[]
}

export interface TableWidgetData {
  columns: string[]
  rows: any[][]
}

export interface WidgetWithData {
  position: number
  chart_type: ChartType
  title: string
  data: KPIWidgetData | ChartWidgetData | TableWidgetData
}

export interface DashboardData {
  dashboard_id: string
  name: string
  layout_type: string
  widgets: WidgetWithData[]
}

export interface CreateDashboardPayload {
  template_id: string
  data_id: string
  name: string
  widgets: Widget[]
}

export const dashboardService = {
  getAll: async (): Promise<Dashboard[]> => {
    const response = await apiClient.get<Dashboard[]>('/api/dashboards/')
    return response.data
  },

  getData: async (id: string): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>(`/api/dashboards/${id}/data`)
    return response.data
  },

  create: async (payload: CreateDashboardPayload): Promise<Dashboard> => {
    const response = await apiClient.post<Dashboard>('/api/dashboards/', payload)
    return response.data
  },
}
