import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'
import { useAsync, useContext } from './compat'

export function requestStatic(file: string) {
  if (import.meta.env.SSR) {
    // TODO
    /*
    const fs = require('fs/promises')
    const path = require('path')
    const safeSuffix = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '')
    return fs.readFile(path.join('./static/', safeSuffix), 'utf8')
    */
   return Promise.resolve('[]')
  } else {
    return fetch(window.origin + '/' + file).then(r => r.text())
  }
}

export const useContent = (url: string) => {
    const { error } = useContext()
    const post = useAsync(async () => {
      try {
        const data = await requestStatic(url + '.md')
        const md = new MarkdownIt({
          html: true,
        })
        const splits = data.match(/^---(.*?)---(.*)/s)!
        const frontmatter = yaml.load(splits[1]) as Record<string, any>
        const markdown = md.render(splits[2])

        return {
          body: markdown,
          ...frontmatter,
          createdAt: frontmatter.createdAt.toISOString(),
        } as Record<string, any>
      } catch (e) {
        console.error(e)
        error({ statusCode: 404, message: 'Post not found' })
      }
    }, `content-${url}`)

  return {
    post,
  }
}
