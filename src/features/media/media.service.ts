import { api } from "@/services/api";
import type { MediaType } from "@/types/media";

export const mediaService = {
  async getAll(type: MediaType) {
    const res = await api.get(`/${type}`);
    console.log(res.data.data);
    return res.data.data;
  },

  async upload(type: MediaType, formData: FormData) {
    const res = await api.post(`/${type}`, formData);
    return res.data;
  },

  async update(type: MediaType, id: string, formData: FormData) {
    const res = await api.patch(`/${type}/${id}`, formData);
    return res.data;
  },

  async delete(type: MediaType, id: string) {
    const res = await api.delete(`/${type}/${id}`);
    return res.data;
  },
};
