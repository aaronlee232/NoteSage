import { Chat, Tag } from 'types'
import { create } from 'zustand'

type ChatStore = {
  activeChatId: string
  chats: Chat[]
  setChats: (newChats: Chat[]) => void
  updateChat: (chatId: string, newTitle: string, newDescription: string) => void
  removeChat: (chatId: string) => void
  setActiveChatId: (chatId: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChatId: '',
  chats: [],
  setChats: (newChats) => set((state) => ({ chats: newChats })),
  updateChat: (chatId: string, newTitle: string, newDescription: string) =>
    set((state) => {
      const newChats: Chat[] = []
      for (let chat of state.chats) {
        if (chat.id == chatId) {
          newChats.push({
            id: chatId,
            title: newTitle,
            description: newDescription,
          })
        } else {
          newChats.push(chat)
        }
      }

      return { chats: newChats }
    }),
  removeChat: (chatId) =>
    set((state) => {
      const reducedChats = state.chats.filter((chat) => chat.id != chatId)

      return { chats: reducedChats }
    }),
  setActiveChatId: (chatId) => {
    set((state) => ({ activeChatId: chatId }))
  },
}))

type SidebarStore = {
  show: boolean
  setShow: (displayStatus: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  show: true,
  setShow: (displayStatus) => set((state) => ({ show: displayStatus })),
}))

type TagStore = {
  tags: Tag[]
  selectedTagNames: string[]
  setTags: (newTags: Tag[]) => void
  setSelectedTagNames: (selectedTags: string[]) => void
  removeTag: (tagId: string) => void
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  selectedTagNames: [],
  setTags: (newTags) => set((state) => ({ tags: newTags })),
  setSelectedTagNames: (tagNames) =>
    set((state) => ({ selectedTagNames: tagNames })),
  removeTag: (tagId) =>
    set((state) => {
      const reducedTags = state.tags.filter((tag) => tag.id != tagId)

      return { tags: reducedTags }
    }),
}))

type ModelStore = {
  selectedModel: string
  setSelectedModel: (model) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  selectedModel: 'gpt-3.5-turbo',
  setSelectedModel: (model) => set((state) => ({ selectedModel: model })),
}))
