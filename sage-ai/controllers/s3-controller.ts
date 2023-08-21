import { Request, Response } from 'express'
import {
  getAllS3Objects,
  getBuckets,
  getS3Object,
  listS3Objects,
} from '../utils/helpers/s3.js'

export const listBuckets = async (req: Request, res: Response) => {
  const buckets = await getBuckets()

  return res.status(200).json({ buckets })
}

export const listObjects = async (req: Request, res: Response) => {
  const objectList = await listS3Objects()

  return res.status(200).json({ objects: objectList })
}

export const getObject = async (req: Request, res: Response) => {
  const { key } = req.query
  if (!key) {
    return res.status(200).json({ object: {} })
  }

  if (typeof key == 'string') {
    const object = await getS3Object(key)

    return res.status(200).json({ object })
  } else {
    return res.status(200).json({ object: {} })
  }
}

export const getAllObjects = async (req: Request, res: Response) => {
  const objectsWithPath = await getAllS3Objects()

  return res.status(200).json({ objects: objectsWithPath })
}
