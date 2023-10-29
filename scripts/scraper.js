// @ts-check
const wtf = require('wtf_wikipedia')
wtf.extend(require('wtf-plugin-api'))
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')
const stringSimilarity = require("string-similarity")
const Axios = require('axios')
const { promisify } = require('util')
const stream = require('stream')
const finished = promisify(stream.finished)
const { dirname } = require('path')

const DOMAIN = 'brawlstars.fandom.com'
const OUT_DIR = "./out"
const BRAWLERS_DIR = "/brawlers/"
const GADGETS_DIR = "/gadgets/"
const STARPOWERS_DIR = "/starpowers/"

function printProgress(curPercentage, size, step) {
  const dots = ".".repeat(Math.round(curPercentage*size))
  const left = size - Math.round(curPercentage*size)
  const empty = " ".repeat(left)
  console.log(`[${dots}${empty}] ${Math.round(curPercentage*100)}% - ${step}`)
}

function encodePath(path) {
  return encodeURIComponent(path).replaceAll('%2F', '/')
}

async function main() {
  const brawlerPages = await wtf.getCategoryPages("Category:Brawlers", {domain: DOMAIN, path:"api.php"})
  const brawlerNames = brawlerPages.map(brawlerPage => brawlerPage.title);

  // get ids of starpowers and gadgets
  const brawltimeNinjaStarpowerJSONFull = await fetch("https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.starpowerName_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.starpower_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22afterDate%22%2C%22values%22%3A%5B%222023-10-01%22%5D%7D%2C%7B%22member%22%3A%22battle.starpower_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%7D&queryType=multi").then(response => response.json())
  const brawltimeNinjaGadgetJSONFull = await fetch("https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.gadgetName_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.gadget_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22afterDate%22%2C%22values%22%3A%5B%222023-10-01%22%5D%7D%2C%7B%22member%22%3A%22battle.gadget_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%7D&queryType=multi").then(response => response.json())

  const brawltimeNinjaStarpowerJSON = brawltimeNinjaStarpowerJSONFull["results"][0]["data"]
  const brawltimeNinjaGadgetJSON = brawltimeNinjaGadgetJSONFull["results"][0]["data"]

  const starpowerNameToIdDict = {}
  for (const starPowerJSON of brawltimeNinjaStarpowerJSON) {
    starpowerNameToIdDict[starPowerJSON["battle.starpowerName_measure"]] = starPowerJSON["battle.starpower_dimension"]
  }
  const gadgetNameToIdDict = {}
  for (const gadgetJSON of brawltimeNinjaGadgetJSON) {
    gadgetNameToIdDict[gadgetJSON["battle.gadgetName_measure"]] = gadgetJSON["battle.gadget_dimension"]
  }

  function getIdFromStarpowerName(name) {
    name = name.toUpperCase()
    const starpowerKeys = Object.keys(starpowerNameToIdDict)
    const matches = stringSimilarity.findBestMatch(name, starpowerKeys)
    const bestMatch = matches.bestMatch.target
    return starpowerNameToIdDict[bestMatch]
  }
  function getIdFromGadgetName(name) {
    name = name.toUpperCase()
    const gadgetKeys = Object.keys(gadgetNameToIdDict)
    const matches = stringSimilarity.findBestMatch(name, gadgetKeys)
    const bestMatch = matches.bestMatch.target
    return gadgetNameToIdDict[bestMatch]
  }

  const downloadQueue = []

  async function downloadFileToLocation(link, path) {
    path = OUT_DIR + path

    const parentFolder = dirname(path)
    await fs.promises.mkdir(parentFolder, { recursive: true })

    let actualSize = 0
    try {
      const fileMetadata = await fs.promises.stat(path)
      actualSize = fileMetadata.size
    } catch (err) {}

    if (actualSize > 0) {
      const httpMetadata = await Axios({
        method: 'head',
        url: link,
      })
      const expectedSize = parseInt(httpMetadata.headers['content-length'])

      if (actualSize == expectedSize) {
        // already downloaded
        return
      }
    }
    console.log('downloading', path)

    const writer = fs.createWriteStream(path);
    return Axios({
      method: 'get',
      url: link,
      responseType: 'stream',
    }).then(response => {
      // https://stackoverflow.com/a/61269447
      response.data.pipe(writer);
      return finished(writer);
    });
  }

  // iterate over all brawlers and scrape information
  let progress = 0
  console.log('Downloading Brawler information for ' + brawlerNames.length + ' brawlers')
  for (const brawlerName of brawlerNames) {
    let brawlerObj
    try {
      brawlerObj = await getBrawlerData(brawlerName)
    } catch (err) {
      console.error('Cannot scrape ' + brawlerName, err)
    }
    if (brawlerObj == undefined) {
      continue
    }

    await fs.promises.mkdir(OUT_DIR + brawlerObj.directory, { recursive: true })
    await fs.promises.writeFile(OUT_DIR + brawlerObj.directory + "data.json", JSON.stringify(brawlerObj))

    printProgress(++progress / brawlerNames.length, 20, brawlerName)
  }

  // download all assets
  progress = 0
  for (const { link, path } of downloadQueue) {
    if (link == undefined) {
      console.error('Invalid link for path ' + path)
      continue
    }

    await downloadFileToLocation(link, path)

    printProgress(++progress / downloadQueue.length, 20, '')
  }

  function getFirstParagraphFromSectionJson(sectionJson) {
    try {
      return sectionJson['paragraphs'][0]['sentences'][0]['text'].slice(1, -1)
    } catch {}
  }

  function getVoiceLineURLFromName(links, voiceLineName) {
    return links.find(link => link.toLowerCase().includes(voiceLineName.toLowerCase()))
  }

  function getSkinURLFromName(links, skinType, skinName) {
    const skinFileName = skinName.replaceAll(" ", "_")
    const brawlerFileName = skinType.replaceAll(" ", "_")
    return links.find(link => link.includes(brawlerFileName) && link.includes(skinFileName))
  }

  function getAccessoryURLFromIndex(links, kind, brawlerName, index) {
    const short = kind == 'gadgets' ? 'gd' : 'sp'
    return links.find(link => link.toLowerCase().includes(`${short}-${brawlerName.toLowerCase()}${index+1}`))
  }

  function getAllLinksFromDoc(brawlerDoc) {
    let links = []
    const attributes = ["src", "href", "data-src"]
    const allElements = brawlerDoc.getElementsByTagName('*')
    for (const element of allElements) {
      for (const attribute of attributes) {
        const attributeValue = element.getAttribute(attribute)
        if (attributeValue && attributeValue.includes("https")) {
          const link = attributeValue.replaceAll(/scale-to-.*?(?=\?)/g, "")
          links.push(link)
        }
      }
    }
    return links
  }

  function getVoiceLinesFromSection(voiceLineSectionJson, brawlerDocLinks, brawlerVoicelineDirectory) {
    const voiceLineElements = voiceLineSectionJson["templates"] ?? []
    return voiceLineElements.filter(ve => ve['filename'] != undefined).map(voiceLineElement => {
      const voiceLineFileName = voiceLineElement['filename'].replaceAll(" ", "_")
      const voiceLineLink = getVoiceLineURLFromName(brawlerDocLinks, voiceLineFileName)
      const voiceLineName = voiceLineElement['filename']
      const path = brawlerVoicelineDirectory + voiceLineName

      downloadQueue.push({ link: voiceLineLink, path })

      return {
        name: voiceLineName,
        description: voiceLineElement["filedescription"],
        path: encodePath(path),
      };
    });
  }

  async function getBrawlerData(brawlerName) {
    const wtfBrawler = await wtf.fetch(brawlerName, { domain: DOMAIN })
    // EN
    const brawlerUrl = wtfBrawler.url().replace("//en.", "//")
    const brawlerHtml = await fetch(brawlerUrl).then(response => response.text())
    const brawlerDoc = new JSDOM(brawlerHtml).window.document
    const brawlerDocLinks = getAllLinksFromDoc(brawlerDoc)
    // RU
    const brawlerUrlRU = brawlerDocLinks.find(link => link.includes("https://brawlstars.fandom.com/ru/wiki/"))
    let brawlerHtmlRU, brawlerDocRU, brawlerDocLinksRU
    if (brawlerUrlRU) {
      brawlerHtmlRU = await fetch(brawlerUrlRU).then(response => response.text())
      brawlerDocRU = new JSDOM(brawlerHtmlRU).window.document
      brawlerDocLinksRU = [...new Set(getAllLinksFromDoc(brawlerDocRU))]
    } else {
      console.log(brawlerName + " has no russian page")
    }

    const brawlerId = brawlerName.replace(/\.| /g, '_').toLowerCase()
    const brawlerDirectory = BRAWLERS_DIR + brawlerId + "/"
    const brawlerVoicelineDirectory = brawlerDirectory + "voice-lines/"
    const brawlerPinDirectory = brawlerDirectory + "pins/"
    const brawlerDescription = getFirstParagraphFromSectionJson(wtfBrawler.sections()[0].json())

    const brawler = {
      id: brawlerId,
      url: brawlerUrl,
      name: brawlerName,
      directory: brawlerDirectory,
      description: brawlerDescription,
      stats: {},
      gadgets: [],
      starpowers: [],
      tips: [],
      voicelines: [],
      history: [],
      skins: [],
    }

    // assign section ids
    let attackSectionID, superSectionID, gadgetSectionID, starPowerSectionID, tipSectionID, voiceLineSectionID, historySectionID, skinSectionID, lastSectionID

    for (let i = 0; i < wtfBrawler.sections().length; i++) {
      const section = wtfBrawler.sections()[i];
      const title = section.json()['title']
      if (title.includes("Attack")) { attackSectionID = i }
      if (title.includes("Super")) { superSectionID = i }
      if (title.includes("Gadget")) { gadgetSectionID = i }
      if (title.includes("Star Powers")) { starPowerSectionID = i }
      if (title.includes("Tips")) { tipSectionID = i }
      if (title.includes("Voice Lines")) { voiceLineSectionID = i }
      if (title.includes("History")) { historySectionID = i }
      if (title.includes("Skins")) { skinSectionID = i }
    }
    lastSectionID = wtfBrawler.sections().length - 1

    if (wtfBrawler.sections()[0].json()['infoboxes'] == undefined) {
      return
    }

    // stats
    const stats = wtfBrawler.sections()[0].json()['infoboxes'][0]

    // TODO: gadgetcharges missing
    const brawlerStatKeys = ["rarity", "class", "movementspeed", "voiceactor"]
    const brawlerAttackStatKeys = ["attackrange", "reload", "attackbullets", "attacksupercharge", "attackspread", "attackspeed", "attackwidth", "attackcooldown"]
    const brawlerSuperStatKeys = ["superrange", "superbullets", "supersupercharge", "superspread", "superspeed", "superwidth", "superminionrange", "superminion", "supermovementspeed", "superduration", "superreload"]
    const brawlerHealthKey = "health"
    const brawlerAttackKey = "attack"
    const brawlerSuperKey = "super"

    for (const key in stats) {
      stats[key] = stats[key]["text"].replace(/\s(\d)/g, ', $1')
    }
    const brawlerStats = {}
    brawlerStatKeys.forEach(key => {
      brawlerStats[key] = stats[key]
    });
    const brawlerAttackStats = {}
    brawlerAttackStatKeys.forEach(key => {
      brawlerAttackStats[key] = stats[key]
    });
    const brawlerSuperStats = {}
    brawlerSuperStatKeys.forEach(key => {
      brawlerSuperStats[key] = stats[key]
    });

    brawler["stats"] = brawlerStats

    function generateStatsPerLevelList(base) {
      base = parseInt(base)
      const statsPerLevel = []
      for (let level = 0; level < 11; level++) {
        statsPerLevel.push(base + level*(base/20))
      }
      return statsPerLevel
    }

    brawler["healthByLevel"] = generateStatsPerLevelList(stats[brawlerHealthKey])

    function getStatsByLevelWithKey(stats, statName) {
      function getIndexString(index) {
        return index == 1 ? "" : index.toString()
      }

      const statsByLevel = []
      let i = 1
      while (statName + getIndexString(i) in stats) {
        statsByLevel.push({
          name: stats[statName + "label" + getIndexString(i)],
          list: generateStatsPerLevelList(stats[statName + getIndexString(i)])
        })
        i++
      }
      return statsByLevel
    }

    // attack
    const attackSection = wtfBrawler.sections()[attackSectionID].json()
    brawler["attack"] = {
      name: attackSection["title"].replace("Attack: ", ""),
      description: getFirstParagraphFromSectionJson(attackSection),
      stats: brawlerAttackStats,
      statsByLevel: getStatsByLevelWithKey(stats, brawlerAttackKey),
    }

    // super
    const superSection = wtfBrawler.sections()[superSectionID].json()
    brawler["super"] = {
      name: superSection["title"].replace("Super: ", ""),
      description: getFirstParagraphFromSectionJson(superSection),
      stats: brawlerSuperStats,
      statsByLevel: getStatsByLevelWithKey(stats, brawlerSuperKey),
    }

    // gadgets
    let gadgetCounter = 0
    for (let i = gadgetSectionID; i < starPowerSectionID; i++) {
      const gadgetSection = wtfBrawler.sections()[i].json()
      const name = gadgetSection["title"]

      if (name == 'Gadgets') {
        // pages with only 1 gadget have the gadget section at top level,
        // pages with 2 have 1 section with 2 child sections
        // if the section title is 'Gadgets', this is the parent section - skip it
        continue
      }

      const id = getIdFromGadgetName(name)
      const description = getFirstParagraphFromSectionJson(gadgetSection)
      const link = getAccessoryURLFromIndex(brawlerDocLinks, 'gadgets', brawler.name, gadgetCounter)
      const path = GADGETS_DIR + id + ".png"
      brawler["gadgets"].push({
        name,
        description,
        id,
        path: encodePath(path),
      })

      downloadQueue.push({ link, path })

      gadgetCounter++
    }

    // star powers
    let starpowerCounter = 0
    for (let i = starPowerSectionID; i < tipSectionID; i++) {
      const starPowerSection = wtfBrawler.sections()[i].json()
      const name = starPowerSection['title']
      if (name == 'Star Powers') {
        // pages with only 1 star power have the star power section at top level,
        // pages with 2 have 1 section with 2 child sections
        // if the section title is 'Star Powers', this is the parent section - skip it
        continue
      }

      const description = getFirstParagraphFromSectionJson(starPowerSection)
      const id = getIdFromStarpowerName(name)
      const link = getAccessoryURLFromIndex(brawlerDocLinks, 'starpowers', brawler.name, starpowerCounter)
      const path = STARPOWERS_DIR + id + ".png"
      brawler["starpowers"].push({
        name,
        description,
        id,
        path: encodePath(path),
      })

      downloadQueue.push({ link, path })

      starpowerCounter++
    }

    // tips
    const tipsSection = wtfBrawler.sections()[tipSectionID].json()
    const tipsElements = tipsSection["lists"] != undefined ? tipsSection["lists"][0] : []
    brawler["tips"] = tipsElements.map(tipElement => tipElement["text"])

    // voice lines
    if (voiceLineSectionID) {
      const voiceLineSection = wtfBrawler.sections()[voiceLineSectionID].json()
      brawler["voicelines"] = getVoiceLinesFromSection(voiceLineSection, brawlerDocLinks, brawlerVoicelineDirectory)
    }

    // history (little refactoring required :])
    if (wtfBrawler.sections()[historySectionID] != undefined) {
    const historySection = wtfBrawler.sections()[historySectionID].json()
    let historyEntryDescriptionCount = 0
    let date = -1
    if (historySection["lists"] != undefined) {
    for (const historyEntryElement of historySection["lists"][0]) {
      if (historyEntryElement['text'].search("[0-9]+/[0-9]+/[0-9]+") != -1) {
        date = historyEntryElement['text']
      } else {
        const historyEntryDescriptions = historySection["templates"]
        let historyEntryType = ''
        if (historyEntryDescriptions.length-1 > historyEntryDescriptionCount) {
          historyEntryType = historyEntryDescriptions[historyEntryDescriptionCount]["list"][0]
        }
        brawler["history"].push({
          date: date,
          description: historyEntryElement['text'],
          type: historyEntryType
        });
        historyEntryDescriptionCount += 1
      }
    }
    }
    }

    // skins
    const SKINS_RELATIVE_PATH = "skins/"
    const skinSectionDepth = wtfBrawler.sections()[skinSectionID].json()['depth']
    let skinSections = []
    for (let sectionID = skinSectionID; sectionID <= lastSectionID; sectionID++) {
     const section = wtfBrawler.sections()[sectionID].json()
     if (sectionID != skinSectionID && section.depth <= skinSectionDepth) {
       break;
     }
     if ('templates' in section) {
       skinSections.push(section)
     }
    }
    const skinCategories = skinSections.map(skinSection => {
      const skinsElements = skinSection['templates'][0]
      const skinsElementKeys = Object.keys(skinsElements)
      const skinCategoryName = skinSection["title"] == "Skins" ? brawlerName : skinSection["title"]
      const skinType = skinCategoryName == brawlerName ? brawlerName : "Minion"
      const SKIN_CATEGORY_PATH = brawlerDirectory + SKINS_RELATIVE_PATH + skinCategoryName + "/"
      const skins = skinsElementKeys.map(skinElementKey => {
        if (skinElementKey.includes("name")) {
          const id = skinElementKey.replace("name", "")
          const skinName = skinsElements[skinElementKey]
          const link = getSkinURLFromName(brawlerDocLinks, skinType, skinName)
          const path = SKIN_CATEGORY_PATH + skinName + ".png"

          downloadQueue.push({ link, path })

          return {
            name: skinName,
            cost: skinsElements['cost' + id],
            campaign: skinsElements['campaign' + id],
            path: encodePath(path),
          }
        }
      })

      // default skin
      const defaultSkinLink = getSkinURLFromName(brawlerDocLinks, skinType, "Default")
      const defaultSkinPath = SKIN_CATEGORY_PATH + "Default" + ".png"
      const defaultSkin = {
        name: "Default",
        cost: undefined,
        campaign: undefined,
        path: encodePath(defaultSkinPath),
      }

      downloadQueue.push({ link: defaultSkinLink, path: defaultSkinPath })

      skins.unshift(defaultSkin)
      // add skins to skinCategory
      return {
        name: skinCategoryName,
        skins: skins.filter(element => element !== undefined),
        directory: SKIN_CATEGORY_PATH
      }
    });
    brawler["skins"] = skinCategories

    // model / default skin
    const modelLink = getSkinURLFromName(brawlerDocLinks, brawlerName, "Default")
    const modelPath = brawlerDirectory + "model.png"
    downloadQueue.push({ link: modelLink, path: modelPath })

    brawler["model"] = { path: encodePath(modelPath) }

    // portrait
    const portraitLink = getSkinURLFromName(brawlerDocLinks, brawlerName, "Portrait")
    const portraitPath = brawlerDirectory + "avatar.png"
    downloadQueue.push({ link: portraitLink, path: portraitPath })

    brawler["avatar"] = { path: encodePath(portraitPath) }

    // pins (russian)
    if (brawlerUrlRU) {
      const addedPins = []
      let pinLinks = brawlerDocLinksRU.filter(link => link.includes("_Pin"))
      pinLinks = pinLinks.filter((item, pos) => pinLinks.indexOf(item) == pos)
      const pins = pinLinks.map(pinLink => {
        let pinName = pinLink.split("/").filter(linkPart => linkPart.includes("Pin"))[0]
        pinName = pinName.split("_")[pinName.split("_").length -1]
        if (!addedPins.includes(pinName)) {
          addedPins.push(pinName)
          const path = brawlerPinDirectory + pinName

          downloadQueue.push({ link: pinLink, path })

          return {
            name: pinName,
            path: encodePath(path),
          }
        }
      })
      brawler["pins"] = pins.filter(element => element !== undefined)
    }

    // output
    return brawler
  }
}

main().catch(console.error)
