import { api } from "@/services/api";

export const stickersService = {
  async getAll() {
    const res = await api.get("/stickers");
    console.log(res.data.data);
    return res.data.data;
  },

  async upload(formData: FormData) {
    const res = await api.post("/stickers", formData);
    return res.data;
  },

  async update(id: string, formData: FormData) {
    const res = await api.patch(`/stickers/${id}`, formData);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/stickers/${id}`);
    return res.data;
  },
};
