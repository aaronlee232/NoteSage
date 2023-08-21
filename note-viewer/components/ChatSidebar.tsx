import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useChatStore, useSidebarStore } from '@/lib/stores'
import ChatCard from '@/components/ChatCard'
import { Chat } from 'types'
import ChatSearch from './ChatSearch'
import { supabase } from '@/lib/helpers/supabase'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from '@/lib/utils'

type Props = {}

const ChatSidebar = (props: Props) => {
  const { chats, removeChat, updateChat, setChats, setActiveChatId } =
    useChatStore((store) => store)
  const { show, setShow } = useSidebarStore((store) => store)

  useEffect(() => {
    const getInitialChats = async () => {
      const response = await axios.get('/api/get-chats')
      const initialChats = response.data as Chat[]
      setChats(initialChats)
      if (!isEmpty(initialChats)) {
        setActiveChatId(initialChats[0].id)
      }
    }

    getInitialChats()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('chat_table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat',
        },
        (payload) => {
          if (payload.eventType == 'INSERT') {
            setChats([payload.new as Chat, ...chats])
          }

          if (payload.eventType == 'UPDATE') {
            updateChat(
              payload.new.id,
              payload.new.title,
              payload.new.description
            )
          }

          if (payload.eventType == 'DELETE') {
            removeChat(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, chats, setChats, removeChat])

  const addChatHandler = async () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      description: '',
    }

    await axios.post('/api/add-chat', newChat)

    setActiveChatId(newChat.id)
  }

  return (
    <div
      className={`z-50 transform top-0 left-0 w-[70%] h-[100vh] fixed bg-background md:static flex flex-col md:basis-1/4 md:h-[92vh] p-2  col-span-3 border border-r opacity-100 ${
        show ? 'slide-in' : 'slide-out'
      }`}
    >
      {/* ROW 1 - Create Chat and Minimize Sidebar*/}
      <div className='flex flex-row space-x-2'>
        {/* New Chat Button  */}
        <Button
          onClick={addChatHandler}
          variant='outline'
          className='flex-grow mb-2'
        >
          New Chat
        </Button>

        {/* Minimize Sidebar */}
        <Button
          variant='outline'
          size='icon'
          onClick={() => {
            setShow(false)
          }}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </div>

      {/* ROW 2 - Chat Search */}
      <ChatSearch />

      {/* ROW 3 - Chat Cards */}
      <div className='h-[100%] mb-4 overflow-y-auto flex flex-col space-y-2'>
        {/* Chat List */}
        {chats.map((chat) => (
          <ChatCard
            key={chat.id}
            id={chat.id}
            title={chat.title}
            description={chat.description}
          />
        ))}
      </div>

      {/* ROW 4 - Theme Selector*/}
      <ThemeToggle />
    </div>
  )
}

export default ChatSidebar
