import { StatusCodes } from "http-status-codes"
import { notificationModel } from "~/models/blogs/notification.model"


const getAll = async ()=>{
    const notification = await notificationModel.getAll()
    return { statusCode: StatusCodes.OK, data: notification }
}
export const notificationServices = {getAll}