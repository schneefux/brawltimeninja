const fetch = require('node-fetch')
const { createWriteStream } = require('fs')
const fs = require('fs').promises
const { promisify } = require('util')
const streamPipeline = promisify(require('stream').pipeline)

const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.brawlify.com/';
const token = process.env.BRAWLAPI_TOKEN || '';

function getStarlistTranslations() {
  return fetch(starlistUrl + '/translations', {
    headers: { 'Authorization': 'Bearer ' + token },
    compress: true,
  }).then(r => r.json())
}

async function main() {
  const translations = (await getStarlistTranslations()).strings
  await fs.mkdir('./out/maps', { recursive: true })
  for (const [lang, strings] of Object.entries(translations)) {
    const relevant = Object.fromEntries(Object.entries(strings)
      .filter(([key, value]) => key.startsWith('map_name_'))
      .map(([key, value]) => [key.replace('map_name_', ''), value]))
    await streamPipeline(JSON.stringify(relevant), createWriteStream('./out/maps/' + lang + '.json'))
  }
}

main().catch(console.error)
