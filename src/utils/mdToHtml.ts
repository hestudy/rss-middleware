import markdownIt from 'markdown-it'
const md = markdownIt()

export const mdToHtml = (content: string) => {
  return md.render(content)
}
