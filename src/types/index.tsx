type GUID = string

type Message = {
  id?: GUID
  chat_id?: number
  avatar?: string
  role: string
  content: string
  embedding?: number[]
  similarity?: number
}

type Embedding = number[]

type FileObject = {
  content: string
  path: string
}
