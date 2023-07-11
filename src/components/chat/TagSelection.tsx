import axios from 'axios'
import React, { FunctionComponent } from 'react'
import useSWR from 'swr'
import Select, { ClearIndicatorProps } from 'react-select'

type Props = {}

const fetchTags = async () => {
  const { data } = await axios.get('/api/chat/get-tags')

  return [{ value: 'all', label: 'all' }, ...data]
}

const TagSelection = (props: Props) => {
  const { data: tagOptions, isLoading } = useSWR(
    '/api/chat/get-tags',
    fetchTags
  )

  const { data: tags, mutate: setTags } = useSWR('tagsKey', {
    fallbackData: ['all'],
  })

  return (
    <div>
      {/* TODO: can't style classnames using tailwind */}
      <Select
        instanceId='modelselectbox'
        className='my-2 text-gray-500'
        options={tagOptions}
        defaultValue={tags.map((tag: string) => ({ value: tag, label: tag }))}
        placeholder={tags.map((tag: string) => ({ value: tag, label: tag }))}
        isSearchable
        isMulti
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
        onChange={
          // (newTags) => console.log(`e`, newTags)
          (newTags) => {
            setTags(newTags.map((tag) => tag.value))
          }
        }
      />
    </div>
  )
}

export default TagSelection
