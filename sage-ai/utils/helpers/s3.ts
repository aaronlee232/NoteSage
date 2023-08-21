import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  ListObjectsV2CommandInput,
  GetObjectCommandInput,
} from '@aws-sdk/client-s3'
import matter from 'gray-matter'

export const getS3Client = () => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    forcePathStyle: true,
    endpoint: process.env.S3_BUCKET_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  return s3Client
}

export const getBuckets = async () => {
  const s3Client = getS3Client()

  let data
  try {
    data = await s3Client.send(new ListBucketsCommand({}))
  } catch (error) {
    console.error(error)
    return []
  }

  return data.Buckets
}

export const listS3Objects = async () => {
  const s3Client = getS3Client()

  let continuationToken: undefined | string = undefined
  let hasMoreObjects: boolean = true
  let objects = []
  do {
    const input: ListObjectsV2CommandInput = {
      Bucket: process.env.S3_BUCKET,
      ContinuationToken: continuationToken,
    }
    const command = new ListObjectsV2Command(input)
    const response = await s3Client.send(command)

    if (response.Contents) {
      objects.push(...response.Contents)
    }

    continuationToken = response.ContinuationToken
    hasMoreObjects = response.IsTruncated || false
  } while (hasMoreObjects)

  return objects
}

export const getS3Object = async (key: string) => {
  const s3Client = getS3Client()

  const input: GetObjectCommandInput = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }

  const command = new GetObjectCommand(input)
  const response = await s3Client.send(command)

  return response.Body?.transformToString('utf-8') || ''
}

export const getAllS3Objects = async () => {
  const objectList = await listS3Objects()
  const keys = objectList.map((object) => object.Key!)

  const objectsWithContent = []
  for (let key of keys) {
    const content = await getS3Object(key)
    const path = key
    if (key) objectsWithContent.push({ path, content })
  }

  return objectsWithContent
}

export const getAllParsedObjects = async () => {
  const objectsWithContent = await getAllS3Objects()

  const parsedObjects = []
  for (let object of objectsWithContent) {
    const parsedObject = matter(object.content)

    parsedObjects.push({ path: object.path, ...parsedObject })
  }

  return parsedObjects
}
