import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getAuthUrl, oauth2Client } from '~/configs/googleAuth'
import { lessonModel } from '~/models/lesson.model'
import { lessonServices } from '~/services/lessonServices'

export const getAuthUrlController = (req: Request, res: Response) => {
  const authUrl = getAuthUrl()
  res.json({ authUrl })
  // res.redirect(authUrl)
}

export const oauth2callbackController = async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    res.send('Authentication successful! You can close this window.')
  } catch (error) {
    next(error)
  }
}

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { title, chapter_id, order, courseId } = req.body
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' })
  }

  try {
    const videoResponse = await lessonServices.uploadVideo(oauth2Client, req.file.path, {
      courseId,
      title,
      chapter_id,
      order
    })
    const videoUrl = `https://www.youtube.com/watch?v=${videoResponse.id}`
    const lessonData = {
      courseId,
      title,
      chapter_id,
      order,
      videoUrl
    }
    const newLesson = await lessonModel.create(lessonData)

    res.json({
      courseId: newLesson.courseId,
      title: newLesson.title,
      chapter_id: newLesson.chapter_id,
      order: newLesson.order,
      videoUrl: newLesson.videoUrl
    })
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = req.params
    const lesson = await lessonServices.getDetails(lessonId)
    res.status(StatusCodes.OK).json(lesson)
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  const lessonId = req.params

  const updatedLesson = await lessonServices.update(lessonId, req.body)
  res.status(StatusCodes.OK).json(updatedLesson)
}
const addNoteLesson = async (req: Request, res: Response, next: NextFunction) => {
  const createNoteLesson = await lessonServices.addNoteLesson(req.body)
  res.status(StatusCodes.CREATED).json(createNoteLesson)
}

const getNoteLessonByID = async (req: Request, res: Response, next: NextFunction) => {
  const { lessonID } = req.params

  const noteLesson = await lessonServices.getNoteLessonByID(lessonID)
  res.status(StatusCodes.OK).json(noteLesson)
}
const editNoteLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const updateNoteLesson = await lessonServices.updateNoteLesson(id, req.body)
    res.status(StatusCodes.OK).json(updateNoteLesson)
  } catch (error) {
    next(error)
  }
}
export const lessonController = {
  getAuthUrlController,
  oauth2callbackController,
  create,
  getDetails,
  update,
  addNoteLesson,
  getNoteLessonByID,
  editNoteLesson
}
