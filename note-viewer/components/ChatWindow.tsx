import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from './ui/textarea'
import { ChevronRight, LucideSendHorizonal } from 'lucide-react'
import useAutosizeTextArea from '@/lib/hooks/useAutosizeTextArea'
import SelectModel from '@/components/SelectModel'
import { SelectTags } from '@/components/SelectTags'
import { ChatMessage } from '@/components/ChatMessage'
import {
  useChatStore,
  useModelStore,
  useSidebarStore,
  useTagStore,
} from '@/lib/stores'
import { Message } from 'types'
import { isEmpty } from '@/lib/utils'
import { supabase } from '@/lib/helpers/supabase'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

type Props = {}

const ChatWindow = (props: Props) => {
  const { activeChatId } = useChatStore((store) => store)
  const { show, setShow } = useSidebarStore((store) => store)
  const { selectedTagNames } = useTagStore((store) => store)
  const { selectedModel } = useModelStore((store) => store)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const getInitialMessages = async () => {
      if (activeChatId == '') {
        return
      }

      const { data: initialMessages } = await axios.get('/api/get-messages', {
        params: { chatId: activeChatId },
      })
      setMessages(initialMessages as Message[])
    }

    getInitialMessages()
  }, [activeChatId])

  useEffect(() => {
    const channel = supabase
      .channel('message_table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message',
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          if (payload.eventType == 'INSERT') {
            setMessages([...messages, payload.new as Message])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, messages, setMessages])

  // Handle textarea resizing
  const [value, setValue] = useState('')
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  useAutosizeTextArea(textAreaRef.current, value)
  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value

    setValue(val)
  }

  // Handle textarea submit
  const handleKeyDown = (event) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    // You can handle the submission logic here
    const messageData: Message = {
      id: uuidv4(),
      chat_id: activeChatId,
      role: 'user',
      content: value,
    }

    await axios.post('api/send-message', {
      message: messageData,
      tags: selectedTagNames,
      chatId: activeChatId,
      model: selectedModel,
    })

    // Reset text area
    setValue('')
  }

  return (
    <div className={`h-[92vh] relative flex flex-col col-span-9`}>
      {/* Options Container */}
      <div className='z-10 hidden md:flex flex-row py-2 px-10 md:py-6 justify-center sticky top-0 space-x-2'>
        {!show && (
          // OPEN SIDEBAR COMPONENT
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              setShow(true)
            }}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        )}

        <SelectTags />

        <SelectModel />
      </div>

      {/* Content Section */}
      {/* Absolute Centered "Sage AI" */}
      {!messages ||
        (isEmpty(messages) && (
          <div className='h-full w-full flex flex-col justify-center'>
            <h1 className='mx-auto text-center text-4xl font-semibold'>
              Sage AI
            </h1>
          </div>
        ))}

      {/* Chat Messages */}
      {messages && !isEmpty(messages) && (
        <div className='items-center z-0 h-full max-h-full w-full flex flex-col overflow-y-auto px-4 mt-4 space-y-10'>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              chat_id={message.chat_id}
              role={message.role}
              content={message.content}
            />
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className='h-32 md:h-42 pt-10 flex-shrink-0 flex flex-col justify-center'>
        <div className='mx-auto flex flex-row justify-center w-full max-w-4xl space-x-2'>
          <div className='flex-grow relative'>
            {/* INPUT + BUTTON */}
            <div className='absolute bottom-0 w-full p-4 border rounded-md bg-background'>
              <Textarea
                className='resize-none min-h-0 p-0 pr-14 text-base !rounded-none border-none focus:!ring-0 focus:!ring-offset-0'
                placeholder='Type your message here.'
                rows={1}
                value={value}
                ref={textAreaRef}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <Button
                size='icon'
                className='absolute right-2 bottom-2 h-10 w-10'
                onClick={handleSubmit}
              >
                <LucideSendHorizonal />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
