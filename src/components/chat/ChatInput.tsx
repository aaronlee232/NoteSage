import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ModelSelection from './ModelSelection'
import useSWR, { mutate } from 'swr'
import { v4 as uuidv4 } from 'uuid'
import { generateChatName } from '@/scripts/generate-chat-name'

type Props = {
  chatId: number
}

const ChatInput = ({ chatId: id }: Props) => {
  const [query, setQuery] = useState<string>('')

  const { data: model } = useSWR('modelKey', {
    fallbackData: 'gpt-3.5-turbo',
  })

  const { data: tags } = useSWR('tagsKey', {
    fallbackData: ['all'],
  })

  const { data: messages, mutate: messagesMutate } = useSWR(
    `messagesKey/${id}`,
    {
      fallbackData: [],
    }
  )

  useEffect(() => {
    const updateChatName = async () => {
      const { data: chatName } = await axios.post(
        '/api/chat/update-chat-name',
        {
          messages,
          chatId: id,
        }
      )

      return chatName
      // useSWR mutate (add reciever on sidebar)
    }

    if (messages.length === 2) {
      updateChatName().then(() => {
        mutate('updateSidebarChatsKey')
      })
    }
  }, [messages])

  const sendMesssage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query) return

    const userQuery = query
    setQuery('')

    const notification = toast.loading('NoteSage AI is thinking...')

    try {
      //TODO: change from hardcoded
      const name = 'Aaron Lee'
      const formattedName = (name as string).replaceAll(' ', '+')

      let userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        chat_id: id,
        avatar: `https://ui-avatars.com/api/?name=${formattedName}&background=3bb7b7&color=393735`,
        content: query,
      }

      const messagesWithUserMessages: Message[] = await messagesMutate(
        createUserMessage(id, userQuery, name, messages),
        {
          optimisticData: [...messages, userMessage],
          rollbackOnError: true,
          revalidate: false,
        }
      )
      const latestUserMessage = messagesWithUserMessages.at(-1)!

      await messagesMutate(
        createAiMessage(
          id,
          userQuery,
          model,
          name,
          tags,
          messages,
          latestUserMessage
        ),
        { revalidate: false }
      )

      toast.success('NoteSage AI responded!', { id: notification })
    } catch (error) {
      let message = 'Unknown Error'
      message = (error as Error).message

      toast.error(`NoteSage AI ran into a problem (Error: ${message})`, {
        id: notification,
      })
    }
  }

  return (
    <div className='mb-10 text-gray-500 text-sm '>
      <form
        onSubmit={sendMesssage}
        className='py-3 px-5 max-w-4xl mx-auto space-x-5 flex  bg-gray-150 border border-gray-200 rounded-lg'
      >
        <input
          className='bg-transparent focus:outline-none flex-1 disabled:cursor-not-allowed disabled:text-gray-300'
          value={query}
          onChange={({ target }) => {
            setQuery(target.value)
          }}
          type='text'
          placeholder='Enter a message'
        />
        <button
          type='submit'
          disabled={!query}
          className='disabled:bg-transparent disabled:cursor-not-allowed bg-teal-500 p-2 rounded-lg transition-all duration-2'
        >
          {/* <PaperAirplaneIcon /> */}
          <PaperAirplaneIcon className='w-4 h-4 -rotate-45 ' />
        </button>
      </form>
      <div className='md:hidden'>
        <ModelSelection />
      </div>
    </div>
  )
}

const createUserMessage = async (
  chatId: number,
  query: string,
  name: string,
  messages: Message[]
) => {
  const { data: userMessage } = await axios.post(
    '/api/chat/create-user-message',
    {
      chatId,
      query,
      name,
    }
  )

  return [...messages, userMessage]
}

const createAiMessage = async (
  chatId: number,
  query: string,
  model: string,
  name: string,
  tags: string[],
  messages: Message[],
  latestUserMessage: Message
) => {
  const { data: aiResponse } = await axios.post('/api/chat', {
    chatId,
    query,
    model,
    name,
    tags,
    userMessageId: latestUserMessage.id,
  })

  const aiMessage = aiResponse.aiMessage

  return [...messages, latestUserMessage, aiMessage]
}

export default ChatInput
