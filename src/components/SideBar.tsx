import React, { useEffect, useState } from 'react'
import NewChat from './chat/NewChat'
import { useRouter } from 'next/router'
import axios from 'axios'
import ChatRow from './chat/ChatRow'

type Chat = {
  id: number
  name: string
  timestamp: Date
}

type Props = {}

const SideBar = (props: Props) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [refreshChat, setRefreshChat] = useState(false)

  const router = useRouter()
  useEffect(() => {
    if (router.asPath.includes('/chat')) {
      const fetchChats = async () => {
        const { data: chats } = await axios.get('/api/chat/get-all-chats')
        setChats(chats)
      }

      fetchChats()
    } else {
      console.log('no action')
    }

    if (refreshChat) {
      setRefreshChat(false)
    }
  }, [router.asPath, refreshChat])

  return (
    <div className='p-2 flex flex-col max-w-xs h-screen overflow-y-auto bg-gray-500 md:min-w-[20rem]'>
      <div className='flex-1 text-gray-100'>
        <div>
          <NewChat />
          <div>{/* Model Select (might replace with tag select)*/}</div>
        </div>
        {/* Map through chat rows */}
        {chats?.map(
          (chat) => (
            <ChatRow
              key={chat.id}
              id={chat.id}
              name={chat.name}
              setRefreshChat={setRefreshChat}
            />
          )
          // return <p key={chat.id}>{chat.name}</p>
        )}
      </div>
    </div>
  )
}

export default SideBar
