import apiClient from './apiClient'

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

export async function getProgressReport(token) {
  const { data } = await apiClient.get('/reports/progress', { headers: authHeader(token) })
  return data
}

export async function getTeamStatusReport(token) {
  const { data } = await apiClient.get('/reports/team-status', { headers: authHeader(token) })
  return data
}
