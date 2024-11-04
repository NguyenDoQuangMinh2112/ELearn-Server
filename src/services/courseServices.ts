import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { CourseRequestBody } from '~/interfaces/course.interface'
import { courseModel } from '~/models/course.model'
import { noteLessonModel } from '~/models/noteLesson.model'
import ApiError from '~/utils/ApiError'

const create = async (reqBody: CourseRequestBody) => {
  const createNewCourse = await courseModel.create(reqBody)
  const result = await courseModel.findOneById(createNewCourse.insertedId)
  // Kiểm tra nếu không tìm thấy dữ liệu
  if (!result) {
    return { message: 'Khóa học đã được tạo nhưng không tìm thấy!', data: null }
  }

  // Nếu tìm thấy dữ liệu, trả về thông báo thành công và dữ liệu
  return { statusCode: StatusCodes.CREATED, message: 'Tạo khóa học thành công !', data: result }
}

const getDetails = async (courseId: any) => {
  const course = await courseModel.getDetails(courseId)
  const cloneCourse = cloneDeep(course)
  cloneCourse?.chapters?.forEach((chapter: any) => {
    chapter.lessons = cloneCourse.lessons.filter(
      (lesson: any) => lesson.chapter_id.toString() === chapter._id.toString()
    )

    chapter.lessons.forEach((lesson: any) => {
      lesson.noteVideo = cloneCourse?.noteLesson?.filter((noteLesson: any) => {
        return lesson._id.toString() === noteLesson.lesson_id.toString()
      })
    })
  })
  delete cloneCourse.noteLesson
  delete cloneCourse.lessons

  return { statusCode: StatusCodes.OK, data: cloneCourse }
}
const getAll = async () => {
  const course = await courseModel.getAll()

  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found')
  }

  return { statusCode: StatusCodes.OK, message: 'Get all courses successfully', data: course }
}

export const courseServices = { create, getDetails, getAll }
