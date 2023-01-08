const yaml = require('js-yaml')
const fs = require('fs/promises')

async function main() {
  const toc = []

  const base = './guides/'
  const files = await fs.readdir(base)
  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue
    }

    const data = await fs.readFile(base + file, { encoding: 'utf-8' })
    const splits = data.match(/^---(.*?)---(.*)/s)
    const frontmatter = yaml.load(splits[1])

    const { title, createdAt, description, image, author } = frontmatter
    const slug = file.replace(/\.md$/, '')
    toc.push({ title, createdAt, description, image, slug, author })
  }

  toc.sort((a, b) => b.createdAt - a.createdAt)

  await fs.writeFile(base + 'toc.json', JSON.stringify(toc), { encoding: 'utf-8' })
}

main().catch(console.error)
