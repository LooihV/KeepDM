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

export const dataService = {
  getAll: async (): Promise<DataFile[]> => {
    const response = await apiClient.get<DataFile[]>('/api/data/')
    return response.data
  },
}
