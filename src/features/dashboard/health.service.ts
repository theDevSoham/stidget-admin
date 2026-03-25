import { api } from "@/services/api"

export const healthService = {
  async getHealth() {
    const res = await api.get("/health")
    return res.data.status
  },
}