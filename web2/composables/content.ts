import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'
import { useBlockingAsync } from './compat'

const posts = import.meta.glob(`~/assets/content/**/*.md`, { as: 'raw' })

export async function usePost(folder: string) {
  return await useBlockingAsync<Record<string, any>>(async ({ params, error }) => {
    const path = `/assets/content/${folder}/${params.post as string}.md`

    if (!(path in posts)) {
      return
    }

    try {
      const data = await posts[path]()
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
      }
    } catch (e) {
      error({ statusCode: 500, message: 'Could not load post' })
    }
  }, 'post')
}
