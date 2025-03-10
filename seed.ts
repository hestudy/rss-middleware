import config from '@payload-config'
import { getPayload } from 'payload'
import { exit } from 'process'

const seed = async () => {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({
    collection: 'prompts',
  })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'prompts',
      data: {
        name: 'translate prompt',
        prompt: `You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.
        
Translate into {language}:
"""
{content}
"""
        `,
      },
    })
  }
}

seed().then(() => {
  exit()
})
