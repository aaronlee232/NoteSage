import { pipeline } from '@xenova/transformers'
import { encode } from 'gpt-3-encoder'

/**
 * Generate embedding for the given text using a pre-trained model.
 *
 * @async
 * @param {string} text - The input text for which embeddings are to be generated.
 * @returns {Promise<number[]>} - A promise that resolves to an array of embeddings as numbers.
 * @throws {Error} - If there is an error during the embedding generation process.
 */
export const generateEmbeddingFromText = async (
  text: string
): Promise<number[]> => {
  const generateEmbeddingPipeline = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  )

  const embedding = await generateEmbeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  })
  return Array.from(embedding.data)
}

/**
 * Get the token count of the input text using a GPT-3 tokenizer.
 *
 * @param {string} text - The input text for which the token count is to be calculated.
 * @returns {number} - The number of tokens in the input text.
 */
export const getTokenCount = (text: string): number => {
  const encoded = encode(text)
  return encoded.length
}

/**
 * Calculate the similarity between two embeddings (vectors) using the dot product.
 *
 * @param {number[]} vectorA - The first vector for the similarity calculation.
 * @param {number[]} vectorB - The second vector for the similarity calculation.
 * @returns {number} - The similarity score between the two input vectors.
 * @throws {Error} - If the input vectors have different lengths.
 */
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
