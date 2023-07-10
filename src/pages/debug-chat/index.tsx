import axios from 'axios'
import React, { FormEvent, useState } from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

const DebugChat = () => {
  const [chatId, setChatId] = useState(1)
  const [tag, setTag] = useState('all')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [usedChatHistory, setUsedChatHistory] = useState<Message[]>([])
  const [context, setContext] = useState<string>('')
  const [query, setQuery] = useState<string>('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
      { chatId, query, tag }
    )

    setChatHistory(data.chatHistory)
    setUsedChatHistory(data.usedChatHistory)
    setContext(data.context)
  }

  return (
    <main className='h-screen mx-64 px-20'>
      <h1 className='text-4xl my-10 text-center'>Document Assistant</h1>

      <div className='border p-4'>
        <div className='mb-10'>
          <h1 className='text-2xl text-center'>User-Facing Chat History</h1>
          {chatHistory &&
            chatHistory.map((message, index) => {
              return (
                <>
                  {/* <pre> */}
                  <ReactMarkdown key={index} children={message.content} />
                  {/* </pre> */}
                  <br />
                </>
              )
            })}
        </div>

        <div className='mb-10 text-center'>
          <form onSubmit={handleSubmit}>
            <label>Query:</label>
            <input
              type='text'
              onChange={({ target }) => {
                setQuery(target.value)
              }}
              className='text-black'
            />
            <br />
            <label>tag:</label>
            <input
              type='text'
              onChange={({ target }) => {
                setTag(target.value)
              }}
              defaultValue='all'
              className='text-black'
            />
            <br />
            <label>Chat id:</label>
            <input
              type='number'
              min='1'
              max='10'
              onChange={({ target }) => {
                setChatId(parseInt(target.value))
              }}
              className='text-black mx-2'
            />
            <br />
            <button type='submit'>Send</button>
          </form>
        </div>

        <div className='mb-10'>
          <h1 className='text-2xl text-center'>Context Used</h1>
          {context && (
            // <pre>
            <ReactMarkdown>{context}</ReactMarkdown>
            // </pre>
          )}
        </div>

        <div className='mb-10'>
          <h1 className='text-2xl text-center'>Actual History Used by AI</h1>
          {usedChatHistory &&
            usedChatHistory.map((message, index) => {
              return (
                <>
                  {/* <pre> */}
                  <ReactMarkdown key={index} children={message.content} />
                  {/* </pre> */}
                  <br />
                </>
              )
            })}
        </div>
      </div>
    </main>
  )
}

export default DebugChat
