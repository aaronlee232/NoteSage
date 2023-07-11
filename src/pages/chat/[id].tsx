import Chat from '@/components/chat/Chat'
import ChatInput from '@/components/chat/ChatInput'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

type Props = {}

const ChatPage = (props: Props) => {
  const router = useRouter()
  const { id: rawId } = router.query
  const id = parseInt(rawId as string)

  const [updateMessages, setUpdateMessages] = useState<boolean>(false)

  return (
    <div className='px-5 flex flex-col h-screen overflow-hidden'>
      <Chat
        chatId={id}
        updateMessages={updateMessages}
        setUpdateMessages={setUpdateMessages}
      />
      <ChatInput chatId={id} setUpdateMessages={setUpdateMessages} />
    </div>
  )
}

export default ChatPage
