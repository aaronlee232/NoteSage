import React from 'react'

type Props = {
  message: Message
}

const Message = ({ message }: Props) => {
  const isAi = message.role == 'assistant'
  console.log('message:', message)
  console.log('isAi:', isAi)

  return (
    <div className={`py-5 text-gray-500 ${isAi && 'bg-gray-200/30'}`}>
      <div className='flex space-x-5 px-10 max-w-2xl mx-auto'>
        <img src={message.avatar} alt='' className='h-8 w-8' />
        <p className='pt-1 text-md'>{message.content}</p>
      </div>
    </div>
  )
}

export default Message
