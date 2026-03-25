import { api } from "@/services/api";

export const usersService = {
  async getAll() {
    const res = await api.get("/admin/users");
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },
};
