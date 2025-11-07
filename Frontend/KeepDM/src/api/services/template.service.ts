import { apiClient } from '../client'

export interface Template {
  _id: string
  user_id: string
  name: string
  columns: Record<string, string>
  created_at: string
  updated_at: string
}

export const templateService = {
  getAll: async (): Promise<Template[]> => {
    const response = await apiClient.get<Template[]>('/api/templates/')
    return response.data
  },
}
