import { apiClient } from '../client'

export interface DataFile {
  data_id: string
  name: string
  num_rows: number
  num_columns: number
  columns: string[]
  source_type: string
  created_at: string
}

export interface ColumnAnalysis {
  column_name: string
  column_type: 'text' | 'number' | 'date' | 'boolean' | 'email'
  total_count: number
  non_null_count: number
  null_count: number
  null_percentage: number
  // Propiedades para columnas numéricas
  min?: number
  max?: number
  avg?: number
  sum?: number
  // Propiedades para columnas de texto
  unique_count?: number
  sample_values?: string[]
  is_categorical?: boolean
}

export type ChartType = 'kpi' | 'line' | 'bar' | 'area' | 'table'
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface VisualizationSuggestion {
  chart_type: ChartType
  title: string
  columns: string[]
  aggregation: AggregationType | null
  priority: number
  description: string
}

export interface DataFileDetail {
  data_id: string
  template_id: string
  num_rows: number
  num_columns: number
  column_analyses: ColumnAnalysis[]
  visualization_suggestions: VisualizationSuggestion[]
}

export const dataService = {
  getAll: async (): Promise<DataFile[]> => {
    const response = await apiClient.get<DataFile[]>('/api/data/')
    return response.data
  },

  getById: async (id: string): Promise<DataFileDetail> => {
    const response = await apiClient.get<DataFileDetail>(`/api/data/${id}/analysis`)
    return response.data
  },
}
