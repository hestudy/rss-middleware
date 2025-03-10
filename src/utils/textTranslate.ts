import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { textSplit } from './textSplit'

export const textTranslate = async (args: {
  content: string
  model: string
  language: string
  prompt: string
  baseUrl: string
  apiKey: string
}) => {
  if (!args.content) {
    return ''
  }

  const model = new ChatOpenAI({
    model: args.model,
    configuration: {
      baseURL: args.baseUrl,
      apiKey: args.apiKey,
    },
  })

  const textSplitList = await textSplit(args.content)

  const promptTemplate = PromptTemplate.fromTemplate(args.prompt)

  const translateList: string[] = []
  for (const item of textSplitList) {
    const prompt = await promptTemplate.invoke({
      content: item.pageContent,
      language: args.language,
    })

    const content = (await model.invoke(prompt)).content.toString()

    if (content) {
      translateList.push(content)
    }
  }
  return translateList.join('\n\n')
}
