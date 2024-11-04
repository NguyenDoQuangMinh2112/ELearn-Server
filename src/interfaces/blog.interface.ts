interface Activity {
  total_likes: number
  total_comments: number
  total_reads: number
  total_parent_comments: number
}

export interface blogInterface {
  title: string
  banner: string
  des: string
  content: string
  tags?: string[]
  author: string
  activity?: Activity
  createdAt: Date
  updatedAt: Date
  comment?: string[]
  draft: boolean
}
