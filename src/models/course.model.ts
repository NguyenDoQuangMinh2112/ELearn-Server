import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { CourseRequestBody } from '~/interfaces/course.interface'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { chapterModel } from './chapter.model'
import { lessonModel } from './lesson.model'
import { userModel } from './user.model'
import { noteLessonModel } from './noteLesson.model'
import { blogModel } from './blogs/blog.model'

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
const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(COURSE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const create = async (data: CourseRequestBody) => {
  try {
    const validateData = (await validateBeforeCreate(data)) as CourseRequestBody
    const addNewCourse = {
      ...validateData,
      instructor_id: new ObjectId(validateData.instructor_id)
    }
    const createdCourse = await GET_DB().collection(COURSE_COLLECTION_NAME).insertOne(addNewCourse)
    return createdCourse
  } catch (error: any) {
    throw new Error(error)
  }
}

const getDetails = async (id: any) => {
  try {
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
            as: 'instructor'
          }
        },
        {
          $unwind: '$instructor'
        },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            noteVideo: 1,
            instructor: {
              fullName: '$instructor.fullName',
              email: '$instructor.email',
              role: '$instructor.role',
              thumbnail: '$instructor.avatar_url'
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
          $lookup: {
            from: noteLessonModel.NOTE_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'course_id',
            as: 'noteLesson'
          }
        }
      ])
      .toArray()

    return result[0] || {}
  } catch (error: any) {
    throw new Error(error)
  }
}
const getAll = async () => {
  try {
    const result = await GET_DB()
      .collection(COURSE_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Collection name for instructors
            localField: 'instructor_id', // Field from the course collection
            foreignField: '_id', // Corresponding field from the instructor collection
            as: 'instructor' // Name of the field to store joined data
          }
        },
        {
          $unwind: '$instructor' // Unwind the joined array to a single object
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
  } catch (error: any) {
    throw new Error(error)
  }
}

const pushChapterIds = async (chapter: any) => {
  try {
    const result = await GET_DB()
      .collection(COURSE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(chapter.courseId) }, // find boardId inside columns
        { $push: { chapters: new ObjectId(chapter._id) } },
        { returnDocument: 'after' } // get record after update
      )

    return result
  } catch (error: any) {
    throw new Error(error)
  }
}
const search = async (keyword: string) => {
  try {
    const coursesCollection = await GET_DB().collection(COURSE_COLLECTION_NAME)
    const blogsCollection = await GET_DB().collection(blogModel.BLOG_COLLECTION_NAME)
    const searchCondition = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } }, // Tìm kiếm theo `title`
        { description: { $regex: keyword, $options: 'i' } } // Tìm kiếm theo `description`
      ]
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
  } catch (error: any) {
    throw new Error(error)
  }
}
export const courseModel = {
  COURSE_COLLECTION_NAME,
  COURSE_COLLECTION_SCHEMA,
  findOneById,
  create,
  getDetails,
  getAll,
  pushChapterIds,
  search
}
