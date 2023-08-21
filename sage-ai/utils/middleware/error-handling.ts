import { NextFunction, Request, Response } from 'express'
import { httpStatusCodes } from '../helpers/status-codes.js'
// import { httpStatusCodes } from '../helpers/status-codes'

export const errorLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('\x1b[31m', err) // adding some color to our logs
  next(err) // calling next middleware
}

export const errorResponder = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.header('Content-Type', 'application/json')
  res
    .status(err.statusCode || httpStatusCodes)
    .send(JSON.stringify(err, null, 4)) // pretty print
}
