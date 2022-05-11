import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'
import { useAsync, useContext } from '@nuxtjs/composition-api'

export const useContent = (url: string) => {
    const { $http, error, env } = useContext()
    const post = useAsync(async () => {
      try {
        const localhost = process.server ? `http://${env.HOST ?? 'localhost'}:${env.PORT ?? 3000}` : '/'
        const data = await $http.get(url + '.md', {
          prefixUrl: localhost,
        }).then(r => r.text())
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
