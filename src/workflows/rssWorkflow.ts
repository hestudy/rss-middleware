import { revalidatePath } from 'next/cache'
import { WorkflowConfig } from 'payload'

export const rssWorkflow = {
  slug: 'rss-workflow',
  queue: 'rss',
  retries: 3,
  handler: async ({ tasks }) => {
    await tasks.fetchAndSaveRss('fetchAndSaveRss', {
      input: {},
    })

    await tasks.translateRss('translateRss', {
      input: {},
    })

    revalidatePath('/admin')
  },
} as WorkflowConfig<'rss-workflow'>
