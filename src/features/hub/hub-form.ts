import type { HubItem } from "@/types/hub"

export type ColorMode = "" | "bw" | "grayscale" | "color"

// Every field is a string/boolean so the same shape backs the controlled
// inputs in both the create and edit dialogs. Empty string === "not set".
export interface HubFormState {
  name: string
  authorHandle: string
  authorName: string
  authorAvatarUrl: string
  bg: string
  description: string
  category: string
  isPremium: boolean
  tags: string // comma-separated in the UI, JSON array on the wire
  dominantColor: string
  targetWidth: string
  targetHeight: string
  colorMode: ColorMode
}

export const emptyHubForm: HubFormState = {
  name: "",
  authorHandle: "",
  authorName: "",
  authorAvatarUrl: "",
  bg: "",
  description: "",
  category: "",
  isPremium: false,
  tags: "",
  dominantColor: "",
  targetWidth: "",
  targetHeight: "",
  colorMode: "",
}

// Pre-fill the edit form from a fetched hub item.
export function hubToForm(hub: HubItem): HubFormState {
  const meta = hub.imageMeta
  return {
    name: hub.name ?? "",
    authorHandle: hub.author?.handle ?? "",
    authorName: hub.author?.name ?? "",
    authorAvatarUrl: hub.author?.avatarUrl ?? "",
    bg: hub.bg ?? "",
    description: hub.description ?? "",
    category: hub.category ?? "",
    isPremium: hub.isPremium ?? false,
    tags: hub.tags?.join(", ") ?? "",
    dominantColor: meta?.dominantColor ?? "",
    targetWidth: meta?.targetWidth != null ? String(meta.targetWidth) : "",
    targetHeight: meta?.targetHeight != null ? String(meta.targetHeight) : "",
    colorMode: meta?.colorMode ?? "",
  }
}

// Image constraints enforced by the Hub service (2 MB, png/jpeg/webp).
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

// Returns an error message, or null when the file is acceptable.
export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be PNG, JPEG or WEBP"
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 2 MB or smaller"
  }
  return null
}

// comma separated → trimmed, de-blanked array
export function parseTagsInput(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}
