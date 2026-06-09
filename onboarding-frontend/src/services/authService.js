import apiClient from './apiClient'

export async function registerRequest(payload) {
  const { data } = await apiClient.post('/auth/register', payload)
  return data
}

export async function loginRequest(payload) {
  const { data } = await apiClient.post('/auth/login', payload)
  return data
}

export async function meRequest(token) {
  const { data } = await apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function getDevelopersRequest(token) {
  const { data } = await apiClient.get('/auth/developers', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
