import { api } from "@/services/api"

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await api.post("/admin/login", payload)
    return res.data
  },
}