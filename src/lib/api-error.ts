import axios from "axios"

// Pull the backend's `{ message }` off an axios error, falling back to a
// generic string. Response envelope is `{ success: false, message }`.
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}
