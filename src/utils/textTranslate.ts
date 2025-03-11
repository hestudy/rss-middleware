import { getPayloadSdk } from '@/common/getPayloadSdk'
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
  const payload = await getPayloadSdk()
  const logger = payload.logger

  if (!args.content) {
    logger.info('content is empty')
    return ''
  }

  const model = new ChatOpenAI({
    model: args.model,
    configuration: {
      baseURL: args.baseUrl,
      apiKey: args.apiKey,
    },
  })

  logger.info('text split:' + args.content)
  const textSplitList = await textSplit(args.content)
  logger.info('text split total:' + textSplitList.length)

  const promptTemplate = PromptTemplate.fromTemplate(args.prompt)

  const translateList: string[] = []
  for (const item of textSplitList) {
    const prompt = await promptTemplate.invoke({
      content: item.pageContent,
      language: args.language,
    })
    logger.info('use prompt:' + prompt.toString())

    logger.info('translating item:' + args.language, item.pageContent)
    const content = (await model.invoke(prompt)).content.toString()

    if (content) {
      logger.info('translate item success:' + content)
      translateList.push(content)
    }
  }
  logger.info('translated content:' + translateList.join('\n\n'))
  return translateList.join('\n\n')
}
