import { createClient } from '@supabase/supabase-js'
import { generateEmbeddingFromText, getTokenCount } from './embeddings.js'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'

export const getSupabaseClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('unable to read supabase env vars')
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  return supabase
}

export const deleteRelatedPageData = async (page: { id: string }) => {
  const supabase = getSupabaseClient()

  // Remove outdated page sections of page
  const { error: deletePageSectionsError } = await supabase
    .from('page_section')
    .delete()
    .eq('page_id', page.id)
  if (deletePageSectionsError) throw deletePageSectionsError

  // Remove outdated page-tag relationships
  const { error: deletePageTagError } = await supabase
    .from('page_tag')
    .delete()
    .eq('page_id', page.id)
  if (deletePageTagError) throw deletePageTagError
}

export const addNewTag = async (tagName: string, page: { id: string }) => {
  const supabase = getSupabaseClient()

  const { data: tag, error: upsertTagError } = await supabase
    .from('tag')
    .upsert({ name: tagName }, { onConflict: 'name' })
    .select('id')
    .single()

  if (upsertTagError) throw upsertTagError

  return tag.id
}

type PageSection = {
  page_id: string
  content: string
  embedding: number[]
  token_count: number
}
export const addPageSection = async (pageSection: PageSection) => {
  const supabase = getSupabaseClient()

  const { error: insertPageError } = await supabase
    .from('page_section')
    .insert(pageSection)
  if (insertPageError) throw insertPageError
}

export const addPage = async (page: {
  refresh_version: string
  refresh_date: Date
  page_path: string
  authored_date: Date
  checksum: string
}) => {
  const supabase = getSupabaseClient()

  // Add page if new or changed
  const { data: newPage, error: upsertPageError } = await supabase
    .from('page')
    .upsert(page, { onConflict: 'page_path, checksum', ignoreDuplicates: true })
    .select('id')
    .maybeSingle()
  if (upsertPageError) throw upsertPageError

  return newPage
}

export const linkPageToTag = async (tag_id: string, page_id: string) => {
  const supabase = getSupabaseClient()

  const { error: upsertPageTagError } = await supabase.from('page_tag').upsert(
    {
      tag_id,
      page_id,
    },
    { ignoreDuplicates: true }
  )
  if (upsertPageTagError) throw upsertPageTagError
}

export const getRelevantMessages = async (
  chatId: string,
  embedding: number[]
) => {
  const supabase = getSupabaseClient()

  const { data: relevantMessages, error: matchMessagesError } =
    await supabase.rpc('match_messages_in_chat', {
      chat_id: chatId,
      embedding,
      recent_cutoff: 10,
      match_threshold: 0.3,
      match_count: 10,
      min_content_length: 10,
    })
  if (matchMessagesError) throw matchMessagesError

  type Message = {
    created_at: Date
    content: string
    role: string
    similarity: number
  }

  let formattedRelevantMessages = ''
  for (let message of relevantMessages) {
    formattedRelevantMessages += `${message.role}: ${message.content}\n---\n`
  }

  return formattedRelevantMessages
}

export const getRelevantPageSections = async (
  tags: string[],
  embedding: number[],
  chatContextTokenLimit: number
) => {
  const supabase = getSupabaseClient()

  const { data: pageSections, error: matchError } = await supabase.rpc(
    'match_page_sections',
    {
      embedding,
      match_count: 10,
      match_threshold: 0.3,
      min_content_length: 10,
      tags,
    }
  )

  if (matchError) {
    console.log(matchError.message)
    throw matchError
  }

  let contextText = ''
  let tokenCount = 0
  for (let i = 0; i < pageSections.length; i++) {
    const pageSection = pageSections[i]
    const content = pageSection.content
    tokenCount += getTokenCount(content)

    if (tokenCount >= chatContextTokenLimit) {
      break
    }

    contextText += `${content.trim()}\n---\n`
  }
  return contextText
}

export const updateChatHistory = async (
  chatId: string,
  userMessageId: string,
  userMessage: string,
  aiMessage: string
) => {
  // Generate embedding of ai message and user query for better context collection
  const messagePairEmbedding = await generateEmbeddingFromText(
    `${aiMessage}\n---\n${userMessage}`
  )

  const supabase = getSupabaseClient()

  console.log('user message id', userMessageId)

  const { error: updateUserMessageError } = await supabase
    .from('message')
    .update({
      embedding: messagePairEmbedding,
    })
    .eq('id', userMessageId)
  if (updateUserMessageError) throw updateUserMessageError

  const { error: insertAiMessageError } = await supabase
    .from('message')
    .insert({
      chat_id: chatId,
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: aiMessage,
      embedding: messagePairEmbedding,
    })
  if (insertAiMessageError) throw insertAiMessageError
}
