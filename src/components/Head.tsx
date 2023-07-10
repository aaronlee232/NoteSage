import React from 'react'
import Head from 'next/head'

type Props = {}

const HeadComponent = (props: Props) => {
  return (
    <>
      <Head>
        <title>NoteSage</title>
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
    </>
  )
}

export default HeadComponent
