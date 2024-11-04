import { ObjectId } from 'mongodb'

export interface ChapterRequestBody {
  title: string
  courseId: ObjectId
  order: number
  lessons: []
  createdAt: string
  updatedAt: string
  _destroy: boolean
}
