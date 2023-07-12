import React from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

type Props = {
  message: Message
}

const Message = ({ message }: Props) => {
  const markdownText = `${message.content}`
  const isAi = message.role == 'assistant' && false // TODO: revist

  return (
    <div className={`py-5 text-gray-500 ${isAi && 'bg-gray-150'}`}>
      <div className='flex space-x-5 px-10 py-5 max-w-2xl mx-auto bg-gray-150/80 rounded-lg'>
        <img src={message.avatar} alt='' className='h-8 w-8' />

        <ReactMarkdown className='prose pt-1 text-md marker:text-gray-500'>
          {markdownText}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
