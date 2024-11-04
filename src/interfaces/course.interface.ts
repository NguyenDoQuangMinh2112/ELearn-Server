import { ObjectId } from 'mongodb'

export interface CourseRequestBody {
  title: string
  description: string
  thumbnail?: string
  price: number
  instructor_id: ObjectId
}
