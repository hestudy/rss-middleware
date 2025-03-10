import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 1,
})

export const textSplit = async (text: string) => {
  return await splitter.createDocuments([text])
}
