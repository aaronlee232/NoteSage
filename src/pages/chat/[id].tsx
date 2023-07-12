import Chat from '@/components/chat/Chat'
import ChatInput from '@/components/chat/ChatInput'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import React from 'react'

type Props = {
  id: string
}

const ChatPage = (props: Props) => {
  const { id: rawId } = props
  const id = parseInt(rawId)

  return (
    <div className='px-5 flex flex-col h-screen overflow-hidden'>
      <Chat chatId={id} />
      <ChatInput chatId={id} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query
  let chatId: any = id
  // If slug is "undefined", since "undefined" cannot be serialized, server will throw error
  // But null can be serializable
  if (!id) {
    chatId = null
  }
  // now we are passing the slug to the component
  return { props: { id: chatId } }
}

export default ChatPage
