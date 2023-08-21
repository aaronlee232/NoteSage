export type Chat = {
  id: string
  title: string
  description: string
}

export type Message = {
  id: string
  chat_id: string
  role: string // sender
  content: string
}

export type Tag = {
  id: string
  name: string
}

export type ModelOption = {
  value: string
  label: string
}
