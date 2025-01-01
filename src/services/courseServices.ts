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
  })
  delete cloneCourse.lessons

  return { statusCode: StatusCodes.OK, data: cloneCourse }
}
const getAll = async (page: number, limit: number) => {
  const course = await courseModel.getAll(page, limit)
  const totalCourses = await courseModel.countBlogs()
  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found')
  }

  return {
    statusCode: StatusCodes.OK,
    message: 'Get all courses successfully',
    pagination: {
      currentPage: page,
      totalCourses: totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
      pageSize: limit
    },
    data: course
  }
}
const search = async (keyword: string) => {
  const searchData = await courseModel.search(keyword)

  return { statusCode: StatusCodes.OK, data: searchData }
}

const getAllCoursesByTeacher = async (userId: string) => {
  const course = await courseModel.getAllCoursesByTeacher(userId)

  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found')
  }

  return { statusCode: StatusCodes.OK, message: 'Get all courses successfully', data: course }
}

const editCourseDetail = async (id: string, reqBody: any, thumbnail: string) => {
  const updateCourse = await courseModel.editCourseDetail(id, reqBody, thumbnail)

  return { statusCode: StatusCodes.OK, data: updateCourse, message: 'Update blog successfully!' }
}

const stats = async (instructorId: string) => {
  const data = await courseModel.stats(instructorId)
  return { statusCode: StatusCodes.OK, data: data }
}

export const courseServices = { create, getDetails, getAll, search, getAllCoursesByTeacher, editCourseDetail, stats }
