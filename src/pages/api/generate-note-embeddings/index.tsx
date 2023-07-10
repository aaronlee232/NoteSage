// Read in markdown file
import { generateEmbeddingFromText, getTokenCount } from '@/scripts/embeddings'
import { getAllFileObjects } from '@/scripts/read-document'
import { supabase } from '@/scripts/supabase'
import { createClient } from '@supabase/supabase-js'
import { HttpStatusCode } from 'axios'
import { createHash } from 'crypto'
import GithubSlugger from 'github-slugger'
import type { Content, Root } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { toString } from 'mdast-util-to-string'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { u } from 'unist-builder'
import { filter } from 'unist-util-filter'
import { v4 as uuidv4 } from 'uuid'

// Matches Columns in page_section table of DB
type PageSection = {
  page_id: number
  content: string
  token_count: number
  embedding: number[]
}

// Represents a "section" in markdown defined by a header with its content
type Section = {
  content: string
  heading?: string
  slug?: string
}

// a processedPage
type ProcessedMDPage = {
  sections: Section[]
  tags: string[]
  checksum: string
}

type Data = {
  newPages: {
    page_paths: string[]
    count: number
  }
  updatedPages: {
    page_paths: string[]
    count: number
  }
}

const BASE_NOTES_PATH = 'src/pages/notes'

const generateEmbeddings = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const refreshVersion = uuidv4()
  const refreshDate = new Date()

  const fileObjects = getAllFileObjects(BASE_NOTES_PATH)

  const newPagePaths: string[] = []
  const updatedPagePaths: string[] = []
  for (let fileObject of fileObjects) {
    const pageSections: PageSection[] = []
    const { path } = fileObject

    const { sections, tags, checksum } = await processMarkdown(fileObject)

    // attempt to fetch page with matching path from database
    const { error: fetchPageError, data: existingPage } = await supabase
      .from('page')
      .select('id, page_path, checksum')
      .filter('page_path', 'eq', path)
      .limit(1)
      .maybeSingle()

    if (fetchPageError) {
      throw fetchPageError
    }

    if (!existingPage) {
      // Insert a new page
      const { error: insertPageError, data: newPage } = await supabase
        .from('page')
        .insert({
          checksum,
          page_path: path,
          refresh_date: refreshDate,
          refresh_version: refreshVersion,
        })
        .select()
        .limit(1)
        .maybeSingle()

      if (insertPageError) {
        throw insertPageError
      }

      // Record metrics for new page embeddings
      newPagePaths.push(newPage.page_path)

      // construct page sections from local markdown file sections
      for (const section of sections) {
        const pageSection = {
          page_id: newPage?.id,
          content: section.content,
          token_count: await getTokenCount(section.content),
          embedding: await generateEmbeddingFromText(section.content),
        }
        pageSections.push(pageSection)
      }

      await insertPageSectionsIntoDB(pageSections)
      await insertPageTagIntoDB(newPage.id, tags)
    }

    // If content of local page is different from page in db
    else if (existingPage.checksum !== checksum) {
      // update existing page refresh date and version
      const { error: updatePageError } = await supabase
        .from('page')
        .update({
          refresh_date: refreshDate,
          refresh_version: refreshVersion,
        })
        .eq('id', existingPage.id)

      if (updatePageError) {
        throw updatePageError
      }

      // Record metrics for existing page embeddings
      updatedPagePaths.push(existingPage.page_path)

      // Remove outdated page sections
      const { error: removePageSectionError } = await supabase
        .from('page_section')
        .delete()
        .eq('page_id', existingPage.id)

      if (removePageSectionError) {
        throw removePageSectionError
      }

      // construct page sections from local markdown file sections
      for (const section of sections) {
        const pageSection = {
          page_id: existingPage?.id,
          content: section.content,
          token_count: await getTokenCount(section.content),
          embedding: await generateEmbeddingFromText(section.content),
        }
        pageSections.push(pageSection)
      }

      await insertPageSectionsIntoDB(pageSections)
      await insertPageTagIntoDB(existingPage.id, tags)
    }
  }

  res.status(200).json({
    newPages: { page_paths: newPagePaths, count: newPagePaths.length },
    updatedPages: {
      page_paths: updatedPagePaths,
      count: updatedPagePaths.length,
    },
  })
}

const processMarkdown = async (
  fileObject: FileObject
): Promise<ProcessedMDPage> => {
  const { content, path } = fileObject
  const checksum = createHash('sha256').update(content).digest('base64')

  // @ts-ignore
  const mdxTree = fromMarkdown(content)

  // Remove all MDX elements from markdown
  const mdTree = filter(
    mdxTree,
    (node) =>
      ![
        'mdxjsEsm',
        'mdxJsxFlowElement',
        'mdxJsxTextElement',
        'mdxFlowExpression',
        'mdxTextExpression',
      ].includes(node.type)
  )

  if (!mdTree) {
    return {
      checksum,
      tags: [],
      sections: [],
    }
  }

  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === 'heading')

  const slugger = new GithubSlugger()

  const sections = sectionTrees.map((tree) => {
    const [firstNode] = tree.children

    const heading =
      firstNode.type === 'heading' ? toString(firstNode) : undefined
    const slug = heading ? slugger.slug(heading) : undefined

    return {
      content: toMarkdown(tree),
      heading,
      slug,
    }
  })

  // get tags from metadata section of page
  const tags = getTags(sections[1].content)
  await insertTagIntoDB(tags)

  return {
    checksum,
    tags,
    sections,
  }
}

const insertTagIntoDB = async (tags: string[]) => {
  for (let tag of tags) {
    const { error: insertTagError } = await supabase
      .from('tag')
      .upsert({ name: tag }, { onConflict: 'name', ignoreDuplicates: false })
      .select()
      .limit(1)
      .maybeSingle()

    if (insertTagError) {
      throw insertTagError
    }
  }
}

const getTags = (content: string) => {
  // Get tags from metadata of markdown using regex
  const regex = /tags:\s*\\\[(.*?)\]/
  const contentStr: string = String(content)
  const match = contentStr.match(regex)

  let tags: string[] = []
  if (match) {
    tags = match[1].split(',').map((tag) => tag.trim())
  }

  return tags
}

const insertPageSectionsIntoDB = async (pageSections: PageSection[]) => {
  pageSections.forEach(async (section) => {
    const { error: insertPageSectionError } = await supabase
      .from('page_section')
      .insert({
        page_id: section.page_id,
        content: section.content,
        token_count: section.token_count,
        embedding: section.embedding,
      })
    if (insertPageSectionError) {
      throw insertPageSectionError
    }
  })
}

const insertPageTagIntoDB = async (page_id: number, tag_names: string[]) => {
  // Get tag ids
  let tags = []
  for (let tag_name of tag_names) {
    const { error: fetchTagError, data: tag } = await supabase
      .from('tag')
      .select('id')
      .eq('name', tag_name)
      .limit(1)
      .maybeSingle()

    if (fetchTagError) {
      throw fetchTagError
    }

    if (tag) {
      tags.push(tag)
    }
  }

  // Insert into page_tag
  for (let tag of tags) {
    const { error: insertPageTagError } = await supabase
      .from('page_tag')
      .upsert({ page_id, tag_id: tag.id })

    if (insertPageTagError) {
      throw insertPageTagError
    }
  }
}

/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
const splitTreeBy = (tree: Root, predicate: (node: Content) => boolean) => {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1)

    if (!lastTree || predicate(node)) {
      const tree: Root = u('root', [node])
      return trees.concat(tree)
    }

    lastTree.children.push(node)
    return trees
  }, [])
}

export default generateEmbeddings
