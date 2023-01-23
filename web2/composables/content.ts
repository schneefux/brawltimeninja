import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'
import { useAsync, useContext } from './compat'
import { computed } from 'vue'

export const useContent = (path: string) => {
  const { error } = useContext()
  const post = useAsync(async () => {
    try {
      const posts = import.meta.glob(`~/assets/content/**/*.png`, { as: 'raw' })
      const data = await posts[`/assets/content/${path}.md`]()
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
  }, `content-${path}`)

  return {
    post,
  }
}
