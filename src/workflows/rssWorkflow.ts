import { WorkflowConfig } from 'payload'

export const rssWorkflow = {
  slug: 'rss-workflow',
  queue: 'rss',
  retries: 3,
  handler: async ({ tasks, req }) => {
    await tasks.fetchAndSaveRss('fetchAndSaveRss', {
      input: {},
    })

    await tasks.translateRss('translateRss', {
      input: {},
    })

    req.payload.logger.info('rss workflow complete')
  },
} as WorkflowConfig<'rss-workflow'>
