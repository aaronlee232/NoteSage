import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useModelStore } from '@/lib/stores'
import axios from 'axios'
import { ModelOption } from 'types'
import { Separator } from './ui/separator'

type Props = {}

const SelectModel = (props: Props) => {
  const { setSelectedModel } = useModelStore((store) => store)
  const [chatCompletionModels, setChatCompletionModels] = useState<
    ModelOption[]
  >([])
  const [completionModels, setCompletionModels] = useState<{
    [key: string]: ModelOption[]
  }>({ davinci: [], ada: [], curie: [], babbage: [] })

  const completionModelTypes = ['davinci', 'ada', 'curie', 'babbage']

  useEffect(() => {
    const fetchModels = async () => {
      const response = await axios.get('/api/get-models')

      setChatCompletionModels(
        response.data
          .filter((model) => model.value.includes('gpt'))
          .sort((a, b) => a.value.localeCompare(b.value)) 
      )

      completionModelTypes.forEach((type) => {
        completionModels[type] = response.data
          .filter((model) => model.value.includes(type))
          .sort((a, b) => a.value.localeCompare(b.value))

        setCompletionModels(completionModels)
      })
    }

    fetchModels()
  }, [])

  const handleSelect = (value) => {
    setSelectedModel(value)
  }

  return (
    <Select onValueChange={handleSelect} defaultValue='gpt-3.5-turbo'>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select a Model' />
      </SelectTrigger>
      <SelectContent className='max-h-72 overflow-y-auto'>
        <SelectGroup>
          <SelectLabel className='mb-2'>Chat Completion Models</SelectLabel>
          {chatCompletionModels.map((model) => (
            <SelectItem value={model.value}>{model.label}</SelectItem>
          ))}

          {completionModelTypes.map((type) => {
            return (
              <>
                <Separator className='my-2' />
                <SelectLabel>{type}</SelectLabel>

                {completionModels[type].map((model) => (
                  <SelectItem value={model.value}>{model.label}</SelectItem>
                ))}
              </>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectModel
