import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getAuthUrl, oauth2Client } from '~/configs/googleAuth'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { lessonModel } from '~/models/lesson.model'
import { lessonServices } from '~/services/lessonServices'

export const getAuthUrlController = catchAsync(async (req: Request, res: Response) => {
  const authUrl = getAuthUrl()
  res.json({ authUrl })
})

export const oauth2callbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string

  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  res.send('Authentication successful! You can close this window.')
})

// const create = catchAsync(async (req: Request, res: Response) => {
//   const { title, chapter_id, order, courseId } = req.body
//   if (!req.file) {
//     return res.status(400).json({ error: 'File is required' })
//   }

//   const videoResponse = await lessonServices.uploadVideo(oauth2Client, req.file.path, {
//     courseId,
//     title,
//     chapter_id,
//     order
//   })
//   const videoUrl = `https://www.youtube.com/watch?v=${videoResponse.id}`
//   const lessonData = {
//     courseId,
//     title,
//     chapter_id,
//     order,
//     videoUrl
//   }
//   const newLesson = await lessonModel.create(lessonData)

//   res.json({
//     courseId: newLesson.courseId,
//     title: newLesson.title,
//     chapter_id: newLesson.chapter_id,
//     order: newLesson.order,
//     videoUrl: newLesson.videoUrl
//   })
// })

const createOption2 = catchAsync(async (req, res, next) => {
  const newLesson = await lessonServices.createOption2(req.body)
  res.status(StatusCodes.OK).json(newLesson)
})

const getDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id as string
  const lessonId = req.params
  const lesson = await lessonServices.getDetails(lessonId, userId)
  res.status(StatusCodes.OK).json(lesson)
})

const update = catchAsync(async (req: Request, res: Response) => {
  const lessonId = req.params
  const updatedLesson = await lessonServices.update(lessonId, req.body)
  res.status(StatusCodes.OK).json(updatedLesson)
})

const addNoteLesson = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id as string
  const createNoteLesson = await lessonServices.addNoteLesson(req.body, userId)
  res.status(StatusCodes.CREATED).json(createNoteLesson)
})

const getNoteLessonByID = catchAsync(async (req: Request, res: Response) => {
  const { lessonID } = req.params
  const userId = req.jwtDecoded?.id as string
  const noteLesson = await lessonServices.getNoteLessonByID(lessonID, userId)
  res.status(StatusCodes.OK).json(noteLesson)
})

const editNoteLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const updateNoteLesson = await lessonServices.updateNoteLesson(id, req.body)
  res.status(StatusCodes.OK).json(updateNoteLesson)
})

export const lessonController = {
  getAuthUrlController,
  oauth2callbackController,
  // create,
  getDetails,
  update,
  addNoteLesson,
  getNoteLessonByID,
  editNoteLesson,
  createOption2
}
