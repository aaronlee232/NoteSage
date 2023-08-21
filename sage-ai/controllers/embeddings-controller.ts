import { NextFunction, Request, Response } from 'express'
import {
  generateEmbeddingFromText,
  getTokenCount,
} from '../utils/helpers/embeddings.js'
import { getAllParsedObjects } from '../utils/helpers/s3.js'
import { processMarkdown } from '../utils/helpers/markdown.js'
import {
  addNewTag,
  addPage,
  addPageSection,
  deleteRelatedPageData,
  linkPageToTag,
} from '../utils/helpers/supabase.js'
import { v4 as uuidv4 } from 'uuid'

export const getDefaultRoute = (req: Request, res: Response) => {
  res.send(`Embeddings route reached`)
}

export const generateEmbedding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_date = new Date()
    const refresh_version = uuidv4()

    let unchangedCount = 0
    let modifiedPages = []

    // Loop through all markdown files in s3 bucket
    const pages = await getAllParsedObjects()
    for (let page of pages) {
      const { sections, checksum } = await processMarkdown(page.content)
      const { tags, date: authored_date_str } = page.data
      const authored_date = new Date(authored_date_str)

      const new_page = {
        refresh_version,
        refresh_date,
        page_path: page.path,
        authored_date,
        checksum,
      }

      const newPage = await addPage(new_page)

      if (newPage) {
        modifiedPages.push(newPage)
      } else {
        unchangedCount++
      }

      // Skip page with no changes
      if (!newPage) continue

      // Remove any outdated page data
      await deleteRelatedPageData(newPage)

      // Add any new tags
      for (let tagName of tags) {
        const tag_id = await addNewTag(tagName, newPage)
        await linkPageToTag(tag_id, newPage.id)
      }

      // Add new page sections
      for (let section of sections) {
        const embedding = await generateEmbeddingFromText(section.content)
        const tokenCount = getTokenCount(section.content)

        await addPageSection({
          page_id: newPage.id,
          content: section.content,
          embedding,
          token_count: tokenCount,
        })
      }
    }

    return res.status(200).json({ modifiedPages, unchangedCount })
  } catch (error) {
    next(error)
  }
}
