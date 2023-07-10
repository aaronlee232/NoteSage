import { PlusIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'

type Props = {}

const NewChat = (props: Props) => {
  const router = useRouter()

  const createNewChat = async () => {
    const { data: chat } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/create-chat`
    )

    router.push(`/chat/${chat.id}`)
  }

  return (
    <div
      onClick={createNewChat}
      className='border-gray-100 border items-center justify-center chatRow'
    >
      <PlusIcon className='h-4 w-4' />
      <p>New Chat</p>
    </div>
  )
}

export default NewChat
