import React, { useEffect, useState } from 'react'
import NewChat from './chat/NewChat'
import { useRouter } from 'next/router'
import axios from 'axios'
import ChatRow from './chat/ChatRow'
import ModelSelection from './chat/ModelSelection'
import TagSelection from './chat/TagSelection'
import useSWR from 'swr'

type Chat = {
  id: number
  name: string
  timestamp: Date
}

type Props = {}

const testFetchChats = async () => {
  const { data: chats } = await axios.get('/api/chat/get-chats')
  return chats
}

const SideBar = (props: Props) => {
  const {
    data: chats,
    mutate,
    isLoading,
  } = useSWR<Chat[]>('updateSidebarChatsKey', testFetchChats, {
    fallbackData: [],
  })

  const router = useRouter()
  useEffect(() => {
    if (router.asPath.includes('/chat')) {
      mutate()
    }
  }, [router.asPath])

  return (
    <div className='p-2 flex flex-col max-w-xs h-screen overflow-y-auto bg-gray-500 md:min-w-[20rem]'>
      <div className='flex-1 text-gray-100'>
        <div>
          <NewChat />

          <div className='hidden md:inline'>
            <ModelSelection />
          </div>

          <div>
            <TagSelection />
          </div>
        </div>
        {isLoading && (
          <div className='animate-pulse text-center text-gray-100'>
            <p>Loading Chats...</p>
          </div>
        )}

        {chats?.map((chat) => (
          <ChatRow key={chat.id} id={chat.id} name={chat.name} />
        ))}
      </div>
    </div>
  )
}

export default SideBar
