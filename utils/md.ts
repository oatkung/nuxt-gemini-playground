import markdownit from 'markdown-it'
const md = markdownit()

export function mdToHtml (text: string) {
  const result = md.render(text);
  return result
}