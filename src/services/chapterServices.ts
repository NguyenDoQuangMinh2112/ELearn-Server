import { StatusCodes } from 'http-status-codes'
import { ChapterRequestBody } from '~/interfaces/chapter.interface'
import { chapterModel } from '~/models/chapter.model'
import { courseModel } from '~/models/course.model'
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
  return { statusCode:StatusCodes.CREATED,message: 'Tạo chương học thành công !', data: result }
}

const getAll = async () => {
  const chapters = await chapterModel.getAll()

  if (!chapters) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chapter not found')
  }

  return { message: '', statusCode: StatusCodes.OK, data: chapters }
}

export const chapterServices = { create, getAll }
