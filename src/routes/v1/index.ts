import express from 'express'

const router = express.Router()

import { userRoutes } from './userRouter'
import { courseRoutes } from './courseRouter'
import { chapterRoutes } from './chapterRouter'
import { lessonRoutes } from './lessonRouter'
import { enrollRoutes } from './enrollRouter'
import { blogRoutes } from './blogRouter'
import { commentRoutes } from './commentRouter'
import { notificationRouter } from './notificationRouter'
import { exerciseRouter } from './exerciseRouter'

// User API
router.use('/users', userRoutes)

// Course API
router.use('/course', courseRoutes)

// Chapter API
router.use('/chapter', chapterRoutes)

// Lesson API
router.use('/lesson', lessonRoutes)

// Enroll API
router.use('/enroll', enrollRoutes)

// Enroll API
router.use('/blog', blogRoutes)

// Comment API
router.use('/comment', commentRoutes)

// Notification API
router.use('/notification', notificationRouter)

// Exercise API
router.use('/exercise', exerciseRouter)

export const APIs_V1 = router
