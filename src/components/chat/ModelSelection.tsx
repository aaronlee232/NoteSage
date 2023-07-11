import axios from 'axios'
import React, { FunctionComponent } from 'react'
import useSWR from 'swr'
import Select, { ClearIndicatorProps } from 'react-select'

type Props = {}

const fetchModels = async () => {
  const { data } = await axios.get('/api/chat/get-models')
  return data
}

const ModelSelection = (props: Props) => {
  const { data: modelOptions, isLoading } = useSWR(
    '/api/chat/get-models',
    fetchModels
  )

  const { data: model, mutate: setModel } = useSWR('modelKey', {
    fallbackData: 'gpt-3.5-turbo',
  })

  return (
    <div>
      {/* TODO: can't style classnames using tailwind */}
      <Select
        instanceId='modelselectbox'
        className='my-2 text-gray-500'
        options={modelOptions}
        defaultValue={model}
        placeholder={model}
        isSearchable
        isLoading={isLoading}
        menuPosition='fixed'
        styles={{
          control: (baseStyles) => {
            return {
              ...baseStyles,
              backgroundColor: '#d7d7d7',
              borderColor: '#cbcbcb',
              boxShadow: 'none',
            }
          },
        }}
        onChange={(event) => setModel(event.value)}
      />
    </div>
  )
}

export default ModelSelection
