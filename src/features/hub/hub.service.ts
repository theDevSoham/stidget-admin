import { api } from "@/services/api"
import type { HubItem } from "@/types/hub"

export interface HubListParams {
  tab?: string
  page?: number
  limit?: number
  category?: string
}

export interface HubListResult {
  data: HubItem[]
  meta: { page: number; limit: number; total: number }
}

export const hubService = {
  // Shared read endpoint — returns active items only.
  async getAll(params: HubListParams = {}): Promise<HubListResult> {
    const res = await api.get("/hub", { params: { tab: "new", ...params } })
    return res.data
  },

  async getById(id: string): Promise<HubItem> {
    const res = await api.get(`/hub/${id}`)
    return res.data.data
  },

  async create(formData: FormData): Promise<HubItem> {
    const res = await api.post("/hub", formData)
    return res.data.data
  },

  async update(id: string, formData: FormData): Promise<HubItem> {
    const res = await api.patch(`/hub/${id}`, formData)
    return res.data.data
  },

  async delete(id: string) {
    const res = await api.delete(`/hub/${id}`)
    return res.data
  },
}
