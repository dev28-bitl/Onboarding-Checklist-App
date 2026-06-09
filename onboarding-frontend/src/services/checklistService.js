import apiClient from './apiClient'

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

export async function getTemplates(token) {
  const { data } = await apiClient.get('/templates', { headers: authHeader(token) })
  return data
}

export async function createTemplate(payload, token) {
  const { data } = await apiClient.post('/templates', payload, { headers: authHeader(token) })
  return data
}

export async function updateTemplate(templateId, payload, token) {
  const { data } = await apiClient.put(`/templates/${templateId}`, payload, {
    headers: authHeader(token),
  })
  return data
}

export async function deleteTemplate(templateId, token) {
  const { data } = await apiClient.delete(`/templates/${templateId}`, {
    headers: authHeader(token),
  })
  return data
}

export async function assignChecklist(payload, token) {
  const { data } = await apiClient.post('/checklists/assign', payload, {
    headers: authHeader(token),
  })
  return data
}

export async function getUserChecklists(userId, token) {
  const { data } = await apiClient.get(`/checklists/user/${userId}`, {
    headers: authHeader(token),
  })
  return data
}

export async function updateChecklistTask(taskId, payload, token) {
  const { data } = await apiClient.put(`/checklists/task/${taskId}`, payload, {
    headers: authHeader(token),
  })
  return data
}
