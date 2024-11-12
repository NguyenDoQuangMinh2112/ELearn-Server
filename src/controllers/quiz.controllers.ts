import { NextFunction, Request, Response } from 'express'

const create = async (req: Request, res: Response, next: NextFunction) => {
  res.send('quiz api')
}

export const quizController = { create }
