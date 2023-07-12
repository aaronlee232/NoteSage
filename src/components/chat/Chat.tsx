import axios from 'axios'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Message from './Message'
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'

type Props = {
  chatId: number
}

const Chat = ({ chatId: id }: Props) => {
  // const [messages, setMessages] = useState<Message[]>([])

  const fetchMessages = async () => {
    const { data } = await axios.get(`/api/chat/get-chat-messages/${id}`)
    return data
  }

  const {
    data: messages,
    mutate,
    isLoading,
  } = useSWR(`messagesKey/${id}`, fetchMessages, {
    fallbackData: [],
  })

  return (
    <div className='flex-1 overflow-y-auto overflow-x-hidden'>
      {messages.length === 0 && (
        <>
          <p className='mt-10 text-center text-gray-500'>
            Type in a question to get started with NoteSage AI!
          </p>
          <ArrowDownCircleIcon className='w-10 h-10 mx-auto mt-5 text-gray-500 animate-bounce' />
        </>
      )}

      {messages.length !== 0 &&
        messages.map((message: Message) => {
          return <Message key={message.id} message={message} />
        })}
    </div>
  )
}

export default Chat
