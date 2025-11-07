import { apiClient } from '../client'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}

interface RegisterCredentials {
  username: string
  email: string
  password: string
}

interface RegisterResponse {
  username: string
  email: string
  id: string
}

export interface User {
  id: string
  username: string
  email: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token)
    }

    return response.data
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      credentials
    )

    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me')
    return response.data
  },

  logout: () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('token')
    
    // Redirigir a la página de login
    window.location.href = '/login'
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },
}
