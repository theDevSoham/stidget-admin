export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}
