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

          <div className='bg-gray-100 flex-1'>{children}</div>
        </div>
      </div>
    </React.Fragment>
  )
}
