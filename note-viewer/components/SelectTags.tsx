import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'
import { supabase } from '@/lib/helpers/supabase'
import { isEmpty, isEmptyObject } from '@/lib/utils'
import { useTagStore } from '@/lib/stores'
import { Tag } from 'types'
import axios from 'axios'

type TagOption = Record<'value' | 'label', string>

export function SelectTags() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TagOption[]>([])
  const [inputValue, setInputValue] = useState('')
  const [tagOptions, setTagOptions] = useState<TagOption[]>([])

  const { tags, selectedTagNames, setTags, removeTag, setSelectedTagNames } =
    useTagStore((store) => store)

  useEffect(() => {
    const fetchTags = async () => {
      const response = await axios.get('api/get-tags')
      const intialTags: Tag[] = response.data

      setTagOptions(
        intialTags.map((tag) => ({ value: tag.name, label: tag.name }))
      )
    }
    fetchTags()
  }, [])

  useEffect(() => {
    setTagOptions(tags.map((tag) => ({ value: tag.name, label: tag.name })))
  }, [tags])

  useEffect(() => {
    const channel = supabase
      .channel('tag_table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tag',
        },
        (payload) => {
          if (payload.eventType == 'INSERT') {
            setTags([payload.new as Tag, ...tags])
          }

          if (payload.eventType == 'DELETE') {
            removeTag(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tags, setTags, removeTag])

  const handleUnselect = React.useCallback((tag: TagOption) => {
    setSelected((prev) => prev.filter((s) => s.value !== tag.value))
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '') {
            setSelected((prev) => {
              const newSelected = [...prev]
              newSelected.pop()
              return newSelected
            })
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === 'Escape') {
          input.blur()
        }
      }
    },
    []
  )

  const selectables = tagOptions.filter((tagOption) => {
    const alreadySelected = selected.some(
      (obj) => JSON.stringify(obj) === JSON.stringify(tagOption)
    )

    return !alreadySelected
  })

  useEffect(() => {
    if (isEmpty(selected)) {
      setSelectedTagNames(['all'])
    } else {
      setSelectedTagNames(selected.map((tag) => tag.value))
    }
  }, [selected])

  return (
    <Command
      onKeyDown={handleKeyDown}
      className='overflow-visible bg-transparent'
    >
      <div className='bg-background group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
        <div className='flex gap-1 flex-wrap'>
          {selected.map((tag) => {
            return (
              <Badge key={tag.value} variant='secondary'>
                {tag.label}
                <button
                  className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(tag)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(tag)}
                >
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              </Badge>
            )
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder='Select Tags...'
            className='ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1'
          />
        </div>
      </div>
      <div className='relative mt-2'>
        {open && selectables.length > 0 ? (
          <div className='absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
            <CommandGroup className='h-full overflow-auto'>
              {selectables.map((tag) => {
                return (
                  <CommandItem
                    key={tag.value}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={(value) => {
                      setInputValue('')
                      setSelected((prev) => [...prev, tag])
                    }}
                    className={'cursor-pointer'}
                  >
                    {tag.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
