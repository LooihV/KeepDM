import { apiClient } from '../client'

export type ChartType = 'kpi' | 'line' | 'bar' | 'area' | 'table'
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

export const dashboardService = {
  getAll: async (): Promise<Dashboard[]> => {
    const response = await apiClient.get<Dashboard[]>('/api/dashboards/')
    return response.data
  },
}
