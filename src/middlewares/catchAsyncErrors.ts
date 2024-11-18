import { Request, Response, NextFunction } from 'express'
export const catchAsyncErrors =
  (theFunc: any) =>
  async (...arg: any) => {
    try {
      return await theFunc(...arg)
    } catch (err: any) {
      return { error: err.message }
    }
  }

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>
export const catchAsync = (theFunc: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next)
  }
}
