const fs = require('fs').promises
const { createWriteStream } = require('fs')
const { promisify } = require('util')
const streamPipeline = promisify(require('stream').pipeline)
const fetch = require('node-fetch')

const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.brawlify.com/';
const token = process.env.BRAWLAPI_TOKEN || '';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function getStarlistBrawlers() {
  return fetch(starlistUrl + '/brawlers', {
    headers: { 'Authorization': 'Bearer ' + token },
    compress: true,
  }).then(r => r.json())
}

async function main() {
  const langs = (await fs.readdir('./json/', { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const starlistBrawlers = (await getStarlistBrawlers()).list
  const outBase = './out'

  for (const brawler of starlistBrawlers) {
    const name = brawler.name
    const id = name.replace(/\.| /g, '_').toLowerCase()
    const outDir = outBase + '/brawlers/' + id + '/'
    await fs.mkdir(outDir, { recursive: true })

    for (const lang of langs) {
      const dir = './json/' + lang
      const characters = JSON.parse(await fs.readFile(dir + '/characters.json', 'utf-8'))
      const skills = JSON.parse(await fs.readFile(dir + '/skills.json', 'utf-8'))
      // unlocks
      const cards = JSON.parse(await fs.readFile(dir + '/cards.json', 'utf-8'))
      const accessories = JSON.parse(await fs.readFile(dir + '/accessories.json', 'utf-8'))
      // gadgets
      const tids = JSON.parse(await fs.readFile(dir + '/tid.json', 'utf-8'))

      const character = characters.find(c => (c.itemName || '')
        .replace(/[.-]/g, '')
        .replace('ricochet', 'rico')
        .replace('ruffs', 'colonelruffs') == id.replace(/[_-]/g, ''))
      if (character == undefined) {
        console.log('brawler not found: ' + id)
        console.log(characters.map(c => c.itemName))
        return null
      }

      const characterDescription = tids['TID_' + character.rawTID + '_DESC']
      const mainSkill = skills.find(s => s.name == character.weaponSkill)
      const superSkill = skills.find(s => s.name == character.ultimateSkill)
      const characterUnlockCard = cards.find(c => c.name == character.name + '_unlock')
      const mainCard = cards.find(c => c.name == character.name + '_abi')
      const superCard = cards.find(c => c.name == character.name + '_ulti')
      const starCards = cards.filter(c => c.name.startsWith(character.name + '_unique'))
      const gadgetCards = cards.filter(c => c.name.startsWith(character.name) && c.iconExportName?.startsWith('icon_item_'))
      const gadgetAccessories = gadgetCards.map(g => accessories.find(a => a.name == g.name))
      const getStarpowerDescription = (c) =>
        (tids['TID_' + c.rawTID + '_DESC'] || '')
          .replace(/<VALUE1>/g, c.value?.toString() || '')
          .replace(/<VALUE2>/g, c.value2?.toString() || '')
          .replace(/<VALUE3>/g, c.value3?.toString() || '')
          .replace(/<\/?c\w{0,6}>/g, '') // color codes
          .replace(/\\n/g, '\n')
      const getGadgetDescription = (c, a) =>
        (tids['TID_' + c.rawTID + '_DESC'] || '')
          .replace(/<VALUE1>/g, a.customValue1?.toString() || '')
          .replace(/<VALUE2>/g, a.customValue2?.toString() || '')
          .replace(/<VALUE3>/g, a.customValue3?.toString() || '')
          .replace(/<VALUE4>/g, a.customValue4?.toString() || '')
          .replace(/<VALUE5>/g, a.customValue5?.toString() || '')
          .replace(/<VALUE6>/g, a.customValue6?.toString() || '')
          .replace(/<\/?c\w{0,6}>/g, '') // color codes
          .replace(/\\n/g, '\n')
      // FIXME assumes star list and in game order of star powers is the same!!!
      const starpowerIds = brawler.starPowers.map(s => s.id)
      const gadgetIds = brawler.gadgets.map(s => s.id)
      const starpowerDescriptions = starCards.reduce((d, c, index) => ({
        ...d,
        [starpowerIds[index]]: {
          name: c.tID,
          description: getStarpowerDescription(c),
        },
      }), {})
      const gadgetDescriptions = gadgetCards.reduce((d, c, index) => ({
        ...d,
        [gadgetIds[index]]: {
          name: c.tID,
          description: getGadgetDescription(c, gadgetAccessories[index]),
        },
      }), {})
      const getSkillDescription = (c, s) =>
        (tids['TID_' + c.rawTID + '_DESC'] || '')
          .replace(/<time>/g, s?.activeTime != null ? (s?.activeTime / 1000).toString() : '')
          .replace(/<num>/g, s?.msBetweenAttacks?.toString() || '')
          .replace(/\\n/g, '\n')
      if (mainSkill == undefined) {
        console.log('Could not find skill for ' + character.rawTID)
        continue
      }
      const mainDescription = getSkillDescription(mainCard, mainSkill)
      const superDescription = getSkillDescription(superCard, superSkill)

      // TODO values in starpower/gadget descriptions need custom formatting based on some type attribute
      // (implemented client-side)
      const starlistStarpowerDescriptions = brawler.starPowers.reduce((d, s) => ({
        ...d,
        [s.id]: {
          name: s.name.toUpperCase(),
          description: s.description,
        },
        [s.name.toUpperCase()]: s.description, // backwards compat, can be removed
      }), {})

      const starlistGadgetDescriptions = brawler.gadgets.reduce((d, g) => ({
        ...d,
        [g.id]: {
          name: g.name.toUpperCase(),
          description: g.description,
        },
        [g.name.toUpperCase()]: g.description, // backwards compat, can be removed
      }), {})

      if (lang == 'en') {
        // starlist has the better translation
        Object.assign(gadgetDescriptions, starlistGadgetDescriptions)
        Object.assign(starpowerDescriptions, starlistStarpowerDescriptions)
      } else {
        Object.assign(starlistGadgetDescriptions, gadgetDescriptions)
        Object.assign(starlistStarpowerDescriptions, starpowerDescriptions)
      }

      const rarityMap = {
        common: 'Common',
        epic: 'Epic',
        legendary: 'Legendary',
        mega_epic: 'Mythic',
        super_rare: 'Super Rare',
      }
      const rarity = characterUnlockCard == undefined ? undefined :
        characterUnlockCard.dynamicRarityStartSeason != null ? 'Chromatic' : rarityMap[characterUnlockCard.rarity]

      const brawlerInfo = {
        id,
        name: character.itemName,
        speed: character.speed / 300,
        health: character.hitpoints,
        offenseRating: character.offenseRating,
        defenseRating: character.defenseRating,
        utilityRating: character.utilityRating,
        description: characterDescription,
        rarity: rarity || brawler?.rarity.name,
        class: brawler?.class.name,
        unlock: brawler?.unlock,

        main: {
          cooldown: mainSkill.cooldown * 2,
          rechargeTime: mainSkill.rechargeTime,
          damage: mainSkill.damage != null ? mainSkill.damage : null,
          damageCount: mainSkill.numBulletsInOneAttack,
          damageLabel: mainCard.powerNumberTID,
          description: mainDescription,
          range: mainSkill.castingRange != null ? mainSkill.castingRange / 3 : null,
          charges: mainSkill.maxCharge,
          spread: mainSkill.spread,
        },
        super: {
          cooldown: superSkill.cooldown * 2,
          rechargeTime: superSkill.rechargeTime,
          damage: superSkill.damage != null ? superSkill.damage : null,
          damageCount: superSkill.numBulletsInOneAttack,
          damageLabel: superCard.powerNumberTID,
          description: superDescription,
          range: superSkill.castingRange != null ? superSkill.castingRange / 3 : null,
          charges: superSkill.maxCharge,
          spread: superSkill.spread,
        },
        starpowerDescriptions,
        gadgetDescriptions,
      }

      if (lang == 'en') {
        // backward compat
        await fs.writeFile(outDir + '/info', JSON.stringify(brawlerInfo))
      }
      await fs.writeFile(outDir + '/' + lang + '.json', JSON.stringify(brawlerInfo))
    }

    await streamPipeline((await fetch(brawler.imageUrl2)).body, createWriteStream(outDir + '/avatar.png'))
    await streamPipeline((await fetch('https://pixelcrux.com/Brawl_Stars/Images/Brawlers/Med/' + name.replace('8-Bit', '8-BIT') + '.png')).body, createWriteStream(outDir + '/model.png'))
    await sleep(100)

    await fs.mkdir(outBase + '/starpowers', { recursive: true })
    await fs.mkdir(outBase + '/gadgets', { recursive: true })
    for (const sp of brawler.starPowers) {
      await streamPipeline((await fetch(sp.imageUrl)).body, createWriteStream(outBase + '/starpowers/' + sp.id + '.png'))
      await sleep(100)
    }
    for (const sp of brawler.gadgets) {
      await streamPipeline((await fetch(sp.imageUrl)).body, createWriteStream(outBase + '/gadgets/' + sp.id + '.png'))
      await sleep(100)
    }
  }
}

main().catch(console.error)
