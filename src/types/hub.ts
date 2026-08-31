export interface HubAuthor {
  handle: string
  name: string | null
  avatarUrl: string | null
}

export interface HubImageMeta {
  cloudinaryPublicId: string
  width: number
  height: number
  format: string
  bytes: number
  aspectRatio: number
  orientation: "portrait" | "landscape" | "square"
  dominantColor: string | null
  targetWidth: number | null
  targetHeight: number | null
  colorMode: "bw" | "grayscale" | "color" | null
}

export interface HubItem {
  id: string
  name: string
  imageUrl: string
  bg: string | null
  author: HubAuthor
  category: string | null
  description: string | null
  tags: string[]
  isPremium: boolean
  likeCount: number
  likedByMe: boolean
  owned: boolean
  imageMeta: HubImageMeta
  createdAt: string
  updatedAt?: string
}
