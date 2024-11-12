import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { ENROLL_COLLECTION_NAME } from '~/models/enroll.model'

const enrollUser = async (userId: ObjectId, courseId: ObjectId) => {
  try {
    const enrollment = {
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date()
    }

    // Kiểm tra xem người dùng đã ghi danh vào khóa học chưa
    const existingEnrollment = await GET_DB().collection(ENROLL_COLLECTION_NAME).findOne({
      user_id: userId,
      course_id: courseId
    })

    if (existingEnrollment) {
      return { error: 'User is already enrolled in this course.' }
    }

    // Tạo ghi danh mới
    const result = await GET_DB().collection(ENROLL_COLLECTION_NAME).insertOne(enrollment)
    return result.ops[0] // Trả về ghi danh mới được tạo
  } catch (err) {
    return { error: 'Server error' }
  }
}

const enrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id, course_id } = req.body

  if (!user_id || !course_id) {
    return res.status(400).json({ message: 'User ID and Course ID are required.' })
  }

  const enrollment = await enrollUser(user_id, course_id)
}

export const enrollController = { enrollCourse }
