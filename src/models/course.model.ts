import Joi, { required } from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { CourseRequestBody } from '~/interfaces/course.interface'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { chapterModel } from './chapter.model'
import { lessonModel } from './lesson.model'
import { userModel } from './user.model'
import { noteLessonModel } from './noteLesson.model'
import { blogModel } from './blogs/blog.model'
import { quizzesModle } from './quizs/quizzes.model'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'

const COURSE_COLLECTION_NAME = 'courses'

const COURSE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  thumbnail: Joi.string().required(),
  price: Joi.number().required(),
  instructor_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  required: Joi.array(),
  chapters: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await COURSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})

const create = catchAsyncErrors(async (data: CourseRequestBody) => {
  const validateData = (await validateBeforeCreate(data)) as CourseRequestBody
  const addNewCourse = {
    ...validateData,
    instructor_id: new ObjectId(validateData.instructor_id)
  }
  const createdCourse = await GET_DB().collection(COURSE_COLLECTION_NAME).insertOne(addNewCourse)
  return createdCourse
})

const getDetails = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'instructor_id',
          foreignField: '_id',
          as: 'instructor_id'
        }
      },
      {
        $unwind: '$instructor_id'
      },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          noteVideo: 1,
          thumbnail: 1,
          required: 1,
          instructor_id: {
            fullName: '$instructor_id.fullName',
            email: '$instructor_id.email',
            role: '$instructor_id.role',
            thumbnail: '$instructor_id.avatar_url'
          },
          createdAt: 1,
          updatedAt: 1,
          _destroy: 1,
          chapters: 1
        }
      },
      {
        $lookup: {
          from: chapterModel.CHAPTER_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'courseId',
          as: 'chapters'
        }
      },
      {
        $lookup: {
          from: lessonModel.LESSON_COLLECTION_NAME,
          localField: 'chapters._id',
          foreignField: 'chapter_id',
          as: 'lessons'
        }
      },
      {
        $addFields: {
          lessons: {
            $map: {
              input: '$lessons',
              as: 'lesson',
              in: {
                courseId: '$$lesson.courseId',
                chapter_id: '$$lesson.chapter_id',
                title: '$$lesson.title',
                order: '$$lesson.order'
              }
            }
          }
        }
      }

      // {
      //   $lookup: {
      //     from: noteLessonModel.NOTE_COLLECTION_NAME,
      //     localField: '_id',
      //     foreignField: 'course_id',
      //     as: 'noteLesson'
      //   }
      // }
    ])
    .toArray()

  return result[0] || {}
})
const getAll = catchAsyncErrors(async () => {
  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .aggregate([
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'instructor_id',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $unwind: '$instructor'
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          thumbnail: 1,
          noteVideo: 1,
          chapters: 1,
          createdAt: 1,
          updatedAt: 1,
          _destroy: 1,
          'instructor.fullName': 1,
          'instructor.avatar_url': 1
        }
      }
    ])
    .toArray()

  return result
})

const pushChapterIds = catchAsyncErrors(async (chapter: any) => {
  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(chapter.courseId) },
      { $push: { chapters: new ObjectId(chapter._id) } },
      { returnDocument: 'after' }
    )

  return result
})
const search = catchAsyncErrors(async (keyword: string) => {
  const coursesCollection = await GET_DB().collection(COURSE_COLLECTION_NAME)
  const blogsCollection = await GET_DB().collection(blogModel.BLOG_COLLECTION_NAME)
  const searchCondition = {
    $or: [{ title: { $regex: keyword, $options: 'i' } }, { description: { $regex: keyword, $options: 'i' } }]
  }

  const courses = await coursesCollection
    .find(searchCondition, {
      projection: { _id: 1, thumbnail: 1, title: 1 }
    })
    .toArray()
  const blogs = await blogsCollection
    .find(searchCondition, {
      projection: { _id: 1, banner: 1, title: 1 }
    })
    .toArray()
  return {
    courses,
    blogs
  }
})

const getAllCoursesByTeacher = catchAsyncErrors(async (userId: string) => {
  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .find({ instructor_id: new ObjectId(userId) })
    .toArray()

  return result
})

const editCourseDetail = catchAsyncErrors(async (id: string, reqBody: any, thumbnail?: string) => {
  const blogPost = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .findOne({ _id: new ObjectId(id) })

  if (!blogPost) {
    throw new Error('Bài viết không tồn tại')
  }

  const updatedThumbnail = thumbnail || blogPost.thumbnail

  const result = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...reqBody, thumbnail: updatedThumbnail } },
      { returnDocument: 'after' }
    )

  return result.value
})

const stats = catchAsyncErrors(async (instructorId: string) => {
  // Tổng số khóa học mà instructor đã đăng
  const coursesCount = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .countDocuments({
      instructor_id: new ObjectId(instructorId)
    })

  // Lấy danh sách khóa học của instructor
  const courses = await GET_DB()
    .collection(COURSE_COLLECTION_NAME)
    .find({
      instructor_id: new ObjectId(instructorId)
    })
    .project({ _id: 1 })
    .toArray()
  const courseIds = courses.map((course: any) => course._id)

  // Tổng số user đã mua khóa học của instructor
  const uniqueUsers = await GET_DB()
    .collection('enrolls')
    .aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$userId' } },
      { $project: { _id: 0, userId: '$_id' } }
    ])
    .toArray()
  const usersCount = uniqueUsers.length

  // Số user mới đã tham gia khóa học của instructor trong tháng
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  const newUsers = await GET_DB()
    .collection('enrolls')
    .aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          createdAt: { $gte: firstDayOfMonth }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $group: {
          _id: '$userId',
          joinedAt: { $first: '$createdAt' }
        }
      }
    ])
    .toArray()

  // Tổng doanh thu
  const revenueData = await GET_DB()
    .collection('payments')
    .aggregate([
      {
        $match: { payment_status: 'success' }
      },
      {
        // Chuyển đổi 'createdAt' từ timestamp (số) thành kiểu Date
        $addFields: {
          createdAt: { $toDate: '$createdAt' }, // Chuyển 'createdAt' thành Date
          amount: { $toDouble: '$amount' } // Chuyển 'amount' từ string thành number (double)
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' }, // Trích xuất tháng từ 'createdAt'
            year: { $year: '$createdAt' } // Trích xuất năm từ 'createdAt'
          },
          totalRevenue: { $sum: '$amount' } // Tính tổng doanh thu từ 'amount'
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])
    .toArray()

  // Chuẩn bị dữ liệu trả về
  const labels = revenueData.map((item: any) => `Month ${item._id.month}/${item._id.year}`)
  const data = revenueData.map((item: any) => item.totalRevenue)

  return {
    courses: coursesCount,
    revenue: { labels, data },
    totalUsers: usersCount,
    newUsersThisMonth: newUsers.length
  }
})

export const courseModel = {
  COURSE_COLLECTION_NAME,
  COURSE_COLLECTION_SCHEMA,
  findOneById,
  create,
  getDetails,
  getAll,
  pushChapterIds,
  search,
  getAllCoursesByTeacher,
  editCourseDetail,
  stats
}
