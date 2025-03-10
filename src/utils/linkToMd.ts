export const linkToMd = async (url: string) => {
  return await fetch(`https://r.jina.ai/${url}`).then((res) => res.text())
}
