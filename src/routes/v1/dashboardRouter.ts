import express from 'express'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { courseController } from '~/controllers/course.controllers'
import { userController } from '~/controllers/user.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { userValidation } from '~/validations/userValidate'

const Router = express.Router()

Router.route('/stats').get(authMiddleware.isAuthorized, courseController.stats)

Router.route('/admin/list-teachers').get(
  authMiddleware.isAuthorized,
  authMiddleware.isAdmin,
  userController.getListTeacher
)

// API Create teacher
Router.route('/create-teacher').post(userValidation.createTeacher, userController.createTeacher)

Router.route('/revenue').get(async (req, res) => {
  try {
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

    res.json({ labels, data })
  } catch (error: any) {
    console.error('Error during aggregation:', error) // Ghi lỗi nếu có
    res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
})

Router.route('/overview').get(authMiddleware.isAuthorized, async (req, res) => {
  try {
    const instructorId = req.jwtDecoded?.id
    const coursesCount = await GET_DB()
      .collection('courses')
      .countDocuments({
        instructor_id: new ObjectId(instructorId)
      })

    // Lấy danh sách khóa học của instructor
    const courses = await GET_DB()
      .collection('courses')
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
    const revenue = await GET_DB()
      .collection('payments')
      .aggregate([
        {
          $match: { payment_status: 'success' }
        },
        {
          $addFields: {
            amountAsNumber: { $toDouble: '$amount' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amountAsNumber' }
          }
        }
      ])
      .toArray()
    res.json({
      labels: ['Courses', 'Revenue', 'Users', 'New Users'],
      data: [coursesCount, revenue[0]?.totalRevenue || 0, usersCount, newUsers.length]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

export const dashboardRouter = Router
