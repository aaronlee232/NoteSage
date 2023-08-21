import React from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { LucideMessageSquare, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/stores'

type Props = {}

const ChatSearch = (props: Props) => {
  const [open, setOpen] = React.useState(false)

  const { chats, activeChatId, setActiveChatId } = useChatStore(
    (store) => store
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (value) => {
    setActiveChatId(value)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          'relative mb-8 w-full justify-start text-sm text-muted-foreground sm:pr-12'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className='hidden lg:inline-flex'>Search Chats...</span>
        <span className='inline-flex lg:hidden'>Search...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Type a command or search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading='Chats' className='pb-2'>
            {chats.map((chat) => (
              <CommandItem
                className='!px-4 flex flex-row justify-start items-start'
                key={chat.id}
                value={chat.id}
                onSelect={handleSelect}
              >
                <MessageSquare className='h-4 w-4 mt-1 mr-4 text-muted-foreground' />
                <div className='flex flex-col !max-w-[90%]'>
                  <h1 className='font-medium text-base pb-1'>{chat.title}</h1>
                  <p className='text-muted-foreground'>{chat.description}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default ChatSearch
