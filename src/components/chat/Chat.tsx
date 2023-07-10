import axios from 'axios'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Message from './Message'

type Props = {
  chatId: number
  updateMessages: boolean
  setUpdateMessages: Dispatch<SetStateAction<boolean>>
}

const Chat = ({ chatId: id, updateMessages, setUpdateMessages }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])
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
    <div className='flex-1'>
      {messages &&
        messages.map((message) => {
          return <Message key={message.id} message={message} />
        })}
    </div>
  )
}

export default Chat
