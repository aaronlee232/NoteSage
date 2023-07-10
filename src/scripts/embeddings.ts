import { pipeline } from '@xenova/transformers'
import GPT3Tokenizer from 'gpt3-tokenizer'

export const generateEmbeddingFromText = async (
  text: string
): Promise<number[]> => {
  const generateEmbeddings = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  )

  const embeddings = await generateEmbeddings(text, {
    pooling: 'mean',
    normalize: true,
  })
  return Array.from(embeddings.data)
}

export const getTokenCount = (text: string): number => {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  const token_count = tokenizer.encode(text).text.length
  return token_count
}

export const getSimilarity = (vectorA: number[], vectorB: number[]) => {
  const dotProduct = (vectorA: number[], vectorB: number[]) => {
    let result = 0

    for (let i = 0; i < vectorA.length; i++) {
      if (vectorA.length !== vectorB.length) {
        throw new Error('Both arguments must be of same length')
      }

      result += vectorA[i] * vectorB[i]
    }
    return result
  }

  return dotProduct(vectorA, vectorB)
}
