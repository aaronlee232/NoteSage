import axios from 'axios'
import React from 'react'

type Props = {}

const RefreshButton = (props: Props) => {
  return <button onClick={refreshNotes}>Refresh Notes</button>
}

const refreshNotes = async () => {
  await axios.get('/api/get-s3-files')
}

export default RefreshButton
