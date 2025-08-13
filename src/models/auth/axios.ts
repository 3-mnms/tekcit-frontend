// fe-admin/src/shared/api/axios.ts
import axios from 'axios'
import { readCookie } from './cookie'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
})

api.interceptors.request.use(cfg => {
  const token = readCookie('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${decodeURIComponent(token)}`
  console.log("accessToken : ", token)
  return cfg
})
