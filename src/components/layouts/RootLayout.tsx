import React from 'react'
import HeadComponent from '../Head'
import SideBar from '../SideBar'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <React.Fragment>
      <HeadComponent />
      <div>
        <div className='flex'>
          <SideBar />

          <Toaster position='top-right' reverseOrder={false} />

          <div className='flex-1 bg-gray-100 bg-dotted-spacing-12 bg-dotted-radius-[1.3px] bg-dotted-gray-500/30'>
            {children}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
