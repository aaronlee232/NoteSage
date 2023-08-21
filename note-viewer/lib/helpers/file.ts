import * as path from 'path'
import * as fs from 'fs'

export const writeS3File = (filePath: string, content: string) => {
  const getDirName = path.dirname

  fs.mkdir(`pages/${getDirName(filePath)}`, { recursive: true }, function () {
    fs.writeFile(`pages/${filePath}`, content, () => {})
  })
}

export const formatFilePath = (path) => {
  const splitPath = path.split('/')
  const fileName = splitPath.slice(-1)[0]
  const splitFileName = fileName.split(' ')
  splitFileName[0] += '.'
  splitFileName.splice(1, 1)
  const formattedFileName = splitFileName.join('_')
  splitPath[splitPath.length - 1] = formattedFileName
  const formattedPath = splitPath.join('/')

  return formattedPath
}
