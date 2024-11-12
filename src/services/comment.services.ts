import { StatusCodes } from 'http-status-codes'
import { blogModel } from '~/models/blogs/blog.model'
import { commentModel } from '~/models/blogs/comment.model'
import { notificationModel } from '~/models/blogs/notification.model'
import { userModel } from '~/models/user.model'
import { getUser, io } from '~/sockets/socket'

export const addComment = async (idUser: any, reqBody: any) => {
  const isReply = !!reqBody.parent
  const updateData = {
    ...reqBody,
    commented_by: idUser,
    createdAt: Date.now()
  }
  const newComment = await commentModel.addComment(updateData)

  const getNewComment = await commentModel.findOneById(newComment.insertedId)
  if (getNewComment) {
    const { blog_id, blog_author, parent } = getNewComment

    if (!isReply) {
      // Cập nhật blog để thêm comment mới
      await blogModel.findOneAndUpdate(blog_id, { commentId: getNewComment._id })
    } else {
      // Nếu là reply, cập nhật vào danh sách con của comment cha
      await commentModel.addReply(parent, getNewComment._id)
    }

    const parentComment = await commentModel.findOneById(reqBody.parent)
    let notificationForUser = isReply ? parentComment.commented_by : blog_author
    // Tạo thông báo cho người dùng
    const notificationObj = {
      type: isReply ? 'reply' : 'comment',
      blog: String(blog_id),
      notification_for: String(notificationForUser),
      user: idUser,
      comment: String(getNewComment._id),
      createdAt: Date.now()
    }
    const notification = await notificationModel.create(notificationObj)
    const result = await notificationModel.findOneById(notification.insertedId)
    const detailNotification = await notificationModel.getDetail(result._id)

    const userSocket = getUser(String(notificationForUser))
    if (userSocket) {
      io.to(userSocket.socketId).emit('newNotification', detailNotification)
    }
  }

  return { statusCode: StatusCodes.CREATED, message: 'Comment created successfully!', data: getNewComment }
}
const getCommentByBlogId = async (blog_id: string) => {
  const getComment = await commentModel.getCommentsByBlogId(blog_id)
  return { statusCode: StatusCodes.OK, data: getComment }
}
export const commentServices = { addComment, getCommentByBlogId }
