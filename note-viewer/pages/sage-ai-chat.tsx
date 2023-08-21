import React from 'react'
import { Navbar } from '@/components/Navbar'
import ChatInterface from '@/components/ChatInterface'
type Props = {}

const SageAiChat = (props: Props) => {
  return (
    <div className='h-screen flex flex-col bg-background'>
      <Navbar />

      <ChatInterface />
    </div>
  )
}

export default SageAiChat
