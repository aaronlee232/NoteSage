import React from 'react'
import { Card, CardContent, CardDescription, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Message } from 'types'

type Props = Message

export const ChatMessage = (props: Props) => {
  const avatarData =
    props.role == 'user'
      ? { src: 'unknown', alt: '@user', fallback: 'ME' }
      : {
          src: 'https://github.com/shadcn.png',
          alt: '@notesage',
          fallback: 'NS',
        }

  return (
    <Card className='max-w-4xl w-full'>
      <CardHeader className='flex flex-row pb-10'>
        <CardHeader className='pl-0 pt-0 mt-[6px]'>
          <Avatar>
            <AvatarImage src={avatarData.src} alt={avatarData.alt} />
            <AvatarFallback>{avatarData.fallback}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardDescription className='leading-relaxed text-base'>
          {props.content}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
