import { StatusCodes } from 'http-status-codes'
import { ChapterRequestBody } from '~/interfaces/chapter.interface'
import { chapterModel } from '~/models/chapter.model'
import { courseModel } from '~/models/course.model'
import { quizQuestionModle } from '~/models/quizs/quiz_questions.model'
import { quizzesModle } from '~/models/quizs/quizzes.model'
import ApiError from '~/utils/ApiError'

const create = async (reqBody: ChapterRequestBody) => {
  const createNewChapter = await chapterModel.create(reqBody)
  const result = await chapterModel.findOneById(createNewChapter.insertedId)
  // Kiểm tra nếu không tìm thấy dữ liệu
  if (!result) {
    return { message: 'Chương học đã tạo nhưng không tìm thấy!', data: null }
  }

  if (result) {
    await courseModel.pushChapterIds(result)
  }

  // Nếu tìm thấy dữ liệu, trả về thông báo thành công và dữ liệu
  return { statusCode: StatusCodes.CREATED, message: 'Tạo chương học thành công !', data: result }
}

const getAll = async (cId: string) => {
  const chapters = await chapterModel.getAll(cId)

  if (!chapters) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chapter not found')
  }

  return { message: '', statusCode: StatusCodes.OK, data: chapters }
}

const createQuestionExercise = async (reqBody: any) => {
  const data = {
    ...reqBody,
    createdAt: Date.now()
  }

  const questionExercise = await quizzesModle.createQuestionExercise(data)
  if (questionExercise && !questionExercise.error) {
    return { statusCode: StatusCodes.CREATED, message: 'Question created successfully!', data: questionExercise }
  } else {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message: questionExercise.error
    }
  }
}
const createAnswerExercise = async (reqBody: any) => {
  const data = {
    ...reqBody,
    createdAt: Date.now()
  }
  const answerExercise = await quizQuestionModle.createAnswerExercise(data)
  if (answerExercise && !answerExercise.error) {
    await quizzesModle.pushQuestionIds(answerExercise)
    return { statusCode: StatusCodes.CREATED, message: 'Answer created successfully!', data: answerExercise }
  } else {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message: answerExercise.error
    }
  }
}
const getAllChapterByCourseId = async (courseId: any) => {
  const chapters = await chapterModel.getAllChapterByCourseId(courseId)

  return { statusCode: StatusCodes.OK, data: chapters }
}

const getDetailAnswer = async (quizId: string) => {
  const answer = await quizzesModle.getDetailAnswer(quizId)
  return { statusCode: StatusCodes.OK, data: answer }
}

export const chapterServices = {
  create,
  getAll,
  createQuestionExercise,
  createAnswerExercise,
  getAllChapterByCourseId,
  getDetailAnswer
}
