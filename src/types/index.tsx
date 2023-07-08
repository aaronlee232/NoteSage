type Message = {
  content: string
  embedding: number[]
  similarity?: number
}

type Embedding = number[]

type FileObject = {
  content: string
  path: string
}
