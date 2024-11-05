import { google, youtube_v3 } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import fs from 'fs'
import { lessonModel } from '~/models/lesson.model'
import { ObjectId } from 'mongodb'
import { chapterModel } from '~/models/chapter.model'
import { StatusCodes } from 'http-status-codes'
import { noteLessonModel } from '~/models/noteLesson.model'

interface VideoMetadata {
  courseId: ObjectId
  title: string
  chapter_id: ObjectId
  order: number
}

const uploadVideo = async (auth: OAuth2Client, filePath: string, metadata: VideoMetadata) => {
  console.log('🚀 ~ uploadVideo ~ filePath:', filePath)
  const youtube = google.youtube('v3')
  const fileSize = fs.statSync(filePath).size

  // Tính duration của video bằng FFmpeg

  const res = await youtube.videos.insert({
    auth,
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: 'example'
      },
      status: {
        privacyStatus: 'private'
      }
    },
    media: {
      body: fs.createReadStream(filePath)
    }
  })

  const videoUrl = `https://www.youtube.com/watch?v=${res.data.id}`
  const lessonCreationResult = await lessonModel.create({
    ...metadata,
    videoUrl
  })

  if (lessonCreationResult) {
    await chapterModel.pushLessonIdToChapter(lessonCreationResult)
  }

  return res.data
}
const getDetails = async (lessonId: any) => {
  const lesson = await lessonModel.getDetails(lessonId)
  return { statusCode: StatusCodes.OK, data: lesson }
}
const update = async (id: any, reqBody: any) => {
  const updateData = {
    ...reqBody,
    updatedAt: Date.now()
  }

  const updatedLesson = await lessonModel.update(id, updateData)
  if (!updatedLesson) {
    return { statusCode: StatusCodes.NOT_FOUND, message: 'Lesson not found' }
  }

  return { statusCode: StatusCodes.OK, message: 'Update lesson succesfully !', data: updatedLesson }
}
const addNoteLesson = async (reqBody: any) => {
  const data = {
    ...reqBody,
    createdAt: Date.now()
  }

  const createdNoteLesson = await noteLessonModel.addNoteLesson(data)
  const result = await noteLessonModel.findOneById(createdNoteLesson.insertedId)
  if (result) {
    await lessonModel.pushNoteLessonIds(result)
  }

  if (!createdNoteLesson) {
    return { message: 'Khóa học đã được tạo nhưng không tìm thấy!', data: null }
  }

  return { statusCode: StatusCodes.CREATED, message: 'Create note lesson success!', data: result }
}

const getNoteLessonByID = async (lessonID:string)=>{
  const noteLesson = await noteLessonModel.getNoteLessonByID(lessonID);
  return {statusCode:StatusCodes.OK, data:noteLesson}
}
export const lessonServices = { uploadVideo, getDetails, update, addNoteLesson,getNoteLessonByID }
