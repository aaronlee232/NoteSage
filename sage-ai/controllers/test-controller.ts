import { NextFunction, Request, Response } from 'express'
import { processMarkdown } from '../utils/helpers/markdown.js'

const markdownFile2 = `
# NoteSage Overview

Markdown Notes viewer with personal document AI

## Header 2
some subheader

### Technologies Used

- [Next.js]() - Meta Framework
- [Tailwind]() - Styling
- [shadcn]() - UI Library
- [Supabase]() - Database
- [OpenAI API]() - Chat AI
- [HuggingFace]() - Supplemental Embedding Generating AI
`

const markdownFile = `
# NoteSage Overview

Markdown Notes viewer with personal document AI

## Technologies Used

- [Next.js]() - Meta Framework
- [Tailwind]() - Styling
- [shadcn]() - UI Library
- [Supabase]() - Database
- [OpenAI API]() - Chat AI
- [HuggingFace]() - Supplemental Embedding Generating AI  


## Features

## Usage

Ask about personal documents. Tag usage can be used to narrow search to specific documents

### Special Modes
Resume writing based on documents with career tag


## Style Conventions

file names: lower-kebab-case
component names: PascalCase
directory names: lower-kebab-case

## Related Pages

- [[2 - Chat Implementation]]
- [[3 - Database Design]]
- [[4 - Generating Embeddings]] 
- [[5 - User Sessions and Accounts]] 
- [[6 - Note Storage]]
- [[TODO]]
`

export const processedMarkdownOutput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await processMarkdown(markdownFile)
    return res.status(200).json({})
  } catch (err) {
    next(err)
  }
}
