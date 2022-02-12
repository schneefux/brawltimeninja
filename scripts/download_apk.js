const fetch = require('node-fetch')
const { promisify } = require('util')
const streamPipeline = promisify(require('stream').pipeline)
const fs = require('fs')

async function main() {
  let text = ''
  let path = ''
  let index = 0
  const base = 'https://www.apkmirror.com'
  const headers = {
    'user-agent': ' Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
  }
  text = await fetch(base + '/apk/supercell/brawl-stars/', headers).then(r => r.text())

  index = text.indexOf('All versions')
  text = text.slice(index)
  index = text.indexOf('</a>')
  text = text.slice(0, index)
  index = text.indexOf('href="')
  text = text.slice(index + 'href="'.length)
  index = text.indexOf('#disqus_thread')
  path = text.slice(0, index)
  console.log('found latest apk at ' + path)

  text = await fetch(base + path, headers).then(r => r.text())
  index = text.indexOf('href="' + path)
  text = text.slice(index + 'href="'.length)
  index = text.indexOf('">')
  path = text.slice(0, index)

  text = await fetch(base + path, headers).then(r => r.text())
  index = text.indexOf('downloadButton')
  text = text.slice(index)
  index = text.indexOf('">')
  text = text.slice(0, index)
  index = text.indexOf('href="')
  path = text.slice(index + 'href="'.length)
  console.log('found download page ' + path)

  text = await fetch(base + path, headers).then(r => r.text())
  index = text.indexOf('If not,')
  text = text.slice(index)
  index = text.indexOf('">here')
  text = text.slice(0, index)
  index = text.indexOf('href="')
  path = text.slice(index + 'href="'.length)
  console.log('found download path ' + path)

  const data = await fetch(base + path, headers)
  await streamPipeline(data.body, fs.createWriteStream('brawlstars.apk'))
  console.log('completed download of apk ' + path)
}

main().catch(console.error)
