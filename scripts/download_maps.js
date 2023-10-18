// work around a node v20 bug: https://github.com/nodejs/node/issues/47822#issuecomment-1564708870
const net = require("net");
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}

const { createWriteStream } = require('fs')
const fs = require('fs').promises
const { promisify } = require('util')
const { pipeline } = require('stream/promises')

const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.brawlapi.com/v1/';
const token = process.env.BRAWLAPI_TOKEN || '';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function getStarlistMaps() {
  return fetch(starlistUrl + '/maps', {
    headers: { 'Authorization': 'Bearer ' + token },
    compress: true,
  }).then(r => r.json())
}

function getStarlistModes() {
  return fetch(starlistUrl + '/gamemodes', {
    headers: { 'Authorization': 'Bearer ' + token },
    compress: true,
  }).then(r => r.json())
}

function getStarlistIcons() {
  return fetch(starlistUrl + '/icons', {
    headers: { 'Authorization': 'Bearer ' + token },
    compress: true,
  }).then(r => r.json())
}

async function main() {
  const icons = await getStarlistIcons()
  await fs.mkdir('./out/avatars', { recursive: true })
  for (const icon of [].concat(Object.values(icons.player), Object.values(icons.club))) {
    await pipeline((await fetch(icon.imageUrl)).body, createWriteStream('./out/avatars/' + icon.id + '.png'))
    await sleep(500)
  }

  const maps = (await getStarlistMaps()).list
  await fs.mkdir('./out/maps', { recursive: true })
  for (const map of maps) {
    await pipeline((await fetch(map.imageUrl)).body, createWriteStream('./out/maps/' + map.id + '.png'))
    await sleep(500)
  }

  const modes = (await getStarlistModes()).list
  for (const mode of modes) {
    const modeId = mode.name.toLowerCase().replace(/-| /g, '-')
    await fs.mkdir('./out/modes/' + modeId, { recursive: true })
    await pipeline((await fetch(mode.imageUrl)).body, createWriteStream('./out/modes/' + modeId + '/icon.png'))
    await sleep(500)
    await pipeline((await fetch(mode.imageUrl2)).body, createWriteStream('./out/modes/' + modeId + '/background.png'))
    await sleep(500)
  }
}

main().catch(console.error)
