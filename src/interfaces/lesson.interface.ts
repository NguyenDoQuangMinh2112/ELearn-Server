import { ObjectId } from 'mongodb'

export interface LessonRequestBody {
  title: string
  chapter_id: ObjectId
  order: number
  contenr: string
  createdAt: string
  updatedAt: string
  _destroy: boolean
}
