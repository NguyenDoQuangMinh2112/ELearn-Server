import { StatusCodes } from 'http-status-codes'
import { blogInterface } from '~/interfaces/blog.interface'
import { blogModel } from '~/models/blogs/blog.model'
import ApiError from '~/utils/ApiError'
const slugify = require('slugify')

const create = async (reqBody: blogInterface) => {
  const newBlog = {
    ...reqBody,
    slug: slugify(reqBody.title)
  }
  const createNewBlog = await blogModel.create(newBlog)
  if (!createNewBlog) {
    throw new Error('Failed to create blog')
  }
  return { statusCode: StatusCodes.CREATED, message: 'Blog created successfully!', data: createNewBlog }
}

const getAll = async () => {
  const blog = await blogModel.getAll()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'blog not found')
  }

  return { statusCode: StatusCodes.OK, message: 'Get all blogs successfully', data: blog }
}
const getDetails = async (id: string) => {
  const blog = await blogModel.getDetails(id)

  return { statusCode: StatusCodes.OK, data: blog }
}
export const blogServices = { create, getAll, getDetails }
