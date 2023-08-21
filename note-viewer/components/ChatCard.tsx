import React, { useState } from 'react'
import { Chat } from 'types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { LucidePencil, LucideTrash2 } from 'lucide-react'
import { useChatStore } from '@/lib/stores'
import axios from 'axios'

type Props = Chat

const ChatCard = (props: Props) => {
  const { activeChatId, setActiveChatId } = useChatStore((store) => store)

  const handleDeleteChat = async () => {
    await axios.delete('/api/delete-chat', {
      params: { chatId: props.id },
    })
  }

  const handleChatSelect = () => {
    setActiveChatId(props.id)
  }

  return (
    <Card
      key={props.id}
      onClick={handleChatSelect}
      className={`hover:cursor-pointer ${
        activeChatId == props.id && 'bg-secondary'
      }`}
    >
      <CardHeader className='flex flex-row p-6 items-center'>
        <CardTitle className='flex-grow text-xl'>{props.title}</CardTitle>
      </CardHeader>

      <CardContent className=''>
        <CardDescription>{props.description}</CardDescription>
      </CardContent>

      <CardFooter>
        <Button
          variant='default'
          size='default'
          className='w-full h-8'
          onClick={handleDeleteChat}
        >
          <LucideTrash2 className='h-4 w-4' />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ChatCard
