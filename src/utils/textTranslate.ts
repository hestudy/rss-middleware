import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { textSplit } from './textSplit'

export const textTranslate = async (args: {
  content: string
  model: string
  language: string
  prompt: string
  baseUrl?: string | null
  apiKey: string
}) => {
  if (!args.content) {
    console.log('content is empty')
    return ''
  }

  const model = new ChatOpenAI({
    model: args.model,
    configuration: {
      baseURL: args.baseUrl,
      apiKey: args.apiKey,
    },
  })

  console.log('text split:', args.content)
  const textSplitList = await textSplit(args.content)
  console.log('text split total:', textSplitList.length)

  const promptTemplate = PromptTemplate.fromTemplate(args.prompt)

  const translateList: string[] = []
  for (const item of textSplitList) {
    const prompt = await promptTemplate.invoke({
      content: item.pageContent,
      language: args.language,
    })
    console.log('use prompt:', prompt.toString())

    console.log('translating item:', args.language, item.pageContent)
    const content = (await model.invoke(prompt)).content.toString()

    if (content) {
      console.log('translate item success:', content)
      translateList.push(content)
    }
  }
  console.log('translated content:', translateList.join('\n\n'))
  return translateList.join('\n\n')
}
