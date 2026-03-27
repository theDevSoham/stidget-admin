export type MediaType = "stickers" | "emojis"

export interface MediaItem {
  id: string
  name: string
  category: string
  tags: string[]
  isPremium: boolean
  imageUrl: string
}