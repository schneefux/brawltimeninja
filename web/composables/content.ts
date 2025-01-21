import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'
import { useBlockingAsync } from './compat'

const posts = import.meta.glob(`~/assets/content/**/*.md`, {
  query: '?raw',
  import: 'default',
})

function renderMarkdown(content: string) {
  const md = new MarkdownIt({
    html: true,
  })

  const splits = content.match(/^---(.*?)---(.*)/s)!
  const frontmatter = yaml.load(splits[1]) as Record<string, any>
  const body = md.render(splits[2])

  return {
    frontmatter,
    body,
  }
}

export async function usePost(folder: string) {
  return await useBlockingAsync<Record<string, any>>(async ({ params, error }) => {
    const path = `/assets/content/${folder}/${params.post as string}.md`

    if (!(path in posts)) {
      return
    }

    try {
      const data = await posts[path]() as string
      const { body, frontmatter } = renderMarkdown(data)

      return {
        body,
        ...frontmatter,
        createdAt: frontmatter.createdAt.toISOString(),
      }
    } catch (e) {
      error({ statusCode: 500, message: 'Could not load post' })
    }
  }, 'post')
}
