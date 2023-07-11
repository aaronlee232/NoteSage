import axios from 'axios'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Message from './Message'
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline'

type Props = {
  chatId: number
  updateMessages: boolean
  setUpdateMessages: Dispatch<SetStateAction<boolean>>
}

const Chat = ({ chatId: id, updateMessages, setUpdateMessages }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])

  console.log()
  useEffect(() => {
    const getMessages = async () => {
      if (id) {
        const { data } = await axios.get(`/api/chat/get-chat-messages/${id}`)
        setMessages(data)

        if (updateMessages) {
          setUpdateMessages(false)
        }
      }
    }

    getMessages()
  }, [updateMessages, id])

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

      {messages &&
        messages.map((message) => {
          return (
              <Message key={message.id} message={message} />
          )
        })}
    </div>
  )
}

export default Chat
