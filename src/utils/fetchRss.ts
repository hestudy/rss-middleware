import Parser from 'rss-parser'

const parser = new Parser()

export const fetchRss = async (url: string) => {
  return await parser.parseURL(url)
}
