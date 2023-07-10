import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

type Props = {
  id: number
  name: string
  setRefreshChat: Dispatch<SetStateAction<boolean>>
}

const ChatRow = ({ id, name, setRefreshChat }: Props) => {
  const router = useRouter()
  const pathname = router.asPath
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!pathname) return

    setActive(pathname === `/chat/${id}`)
  }, [pathname])

  const removeChat = async (event: React.MouseEvent) => {
    event.preventDefault()

    try {
      const deletedChat = await axios.delete('/api/chat/delete-chat', {
        data: { id },
      })

      setRefreshChat(true)
      router.replace('/chat')
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data.error)
      } else {
        console.log(error)
      }
    }
  }

  return (
    <Link
      href={`/chat/${id}`}
      className={`chatRow ${active && 'bg-gray-400/30'}`}
    >
      <ChatBubbleLeftIcon className='w-5 h-5' />
      <p className='flex-1 hidden md:inline-flex truncate'>{name}</p>
      <TrashIcon
        onClick={(event) => {
          removeChat(event)
        }}
        className='w-5 h-5 text-gray-300 hover:text-red-500'
      />
    </Link>
  )
}

export default ChatRow
