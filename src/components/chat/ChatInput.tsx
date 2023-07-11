import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import React, { Dispatch, SetStateAction, useState } from 'react'
import toast from 'react-hot-toast'
import ModelSelection from './ModelSelection'
import useSWR from 'swr'

type Props = {
  chatId: number
  setUpdateMessages: Dispatch<SetStateAction<boolean>>
}

const ChatInput = ({ chatId: id, setUpdateMessages }: Props) => {
  const [query, setQuery] = useState<string>('')

  const { data: model } = useSWR('modelKey', {
    fallbackData: 'gpt-3.5-turbo',
  })

  const { data: tags } = useSWR('tagsKey', {
    fallbackData: ['all'],
  })

  // TODO: useSWR to get model
  // const model = 'gpt-3.5-turbo'

  const sendMesssage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query) return

    const userQuery = query
    setQuery('')

    const notification = toast.loading('NoteSage AI is thinking...')

    try {
      // Create user message first for better UX
      const { data } = await axios.post('/api/chat/create-user-message', {
        chatId: id,
        query: userQuery,
        name: 'Aaron Lee', //TODO: change from hardcoded
      })

      setUpdateMessages(true)

      await axios.post('/api/chat', {
        chatId: id,
        query: userQuery,
        model,
        name: 'Aaron Lee', //TODO: change from hardcoded
        tags,
        userMessageId: data.userMessage.id,
      })

      toast.success('NoteSage AI responded!', { id: notification })
      setUpdateMessages(true)
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

export default ChatInput
