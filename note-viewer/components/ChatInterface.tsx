import React from 'react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import { useSidebarStore } from '@/lib/stores'

type Props = {}

const ChatInterface = (props: Props) => {
  const { show } = useSidebarStore((store) => store)

  return (
    <div className='flex-grow flex flex-row bg-muted'>
      {/* Chat Group Sidebar */}
      <ChatSidebar />

      {/* Chat Window */}
      <ChatWindow />
    </div>
  )
}

export default ChatInterface
