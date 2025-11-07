import { apiClient } from '../client'

export interface Template {
  _id: string
  user_id: string
  name: string
  columns: Record<string, string>
  created_at: string
  updated_at: string
}

export interface CreateTemplateRequest {
  name: string
  columns: Record<string, string>
}

export const templateService = {
  getAll: async (): Promise<Template[]> => {
    const response = await apiClient.get<Template[]>('/api/templates/')
    return response.data
  },

  getById: async (id: string): Promise<Template> => {
    const response = await apiClient.get<Template>(`/api/templates/${id}`)
    return response.data
  },

  create: async (data: CreateTemplateRequest): Promise<Template> => {
    const response = await apiClient.post<Template>('/api/templates/', data)
    return response.data
  },

  downloadExcel: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/templates/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  update: async (id: string, data: CreateTemplateRequest): Promise<Template> => {
    const response = await apiClient.put<Template>(`/api/templates/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/templates/${id}`)
  },
}
