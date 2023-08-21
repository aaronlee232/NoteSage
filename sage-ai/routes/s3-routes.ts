import { Router } from 'express'
import {
  getAllObjects,
  getObject,
  listBuckets,
  listObjects,
} from '../controllers/s3-controller.js'

export const s3Routes = Router()
const base_path = '/s3'

s3Routes.get(`${base_path}/get/buckets`, listBuckets)

s3Routes.get(`${base_path}/get/object-list`, listObjects)

s3Routes.get(`${base_path}/get/object`, getObject)

s3Routes.get(`${base_path}/get/all-objects`, getAllObjects)
