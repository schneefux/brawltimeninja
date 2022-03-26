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

const DOMAIN = 'brawlstars.fandom.com'
const OUT_DIR = "./out"
const BRAWLERS_DIR = "/brawlers/"
const GADGETS_DIR = "/gadgets/"
const STARPOWERS_DIR = "/starpowers/"

let finishedBrawlers = []
function printProgress(curPercentage, size, finishedBrawler) {
  const dots = ".".repeat(Math.round(curPercentage*size))
  const left = size - Math.round(curPercentage*size)
  const empty = " ".repeat(left)
  console.log(`[${dots}${empty}] ${Math.round(curPercentage*100)}% - ` + finishedBrawler)
}

async function main() {
  const brawlerPages = await wtf.getCategoryPages("Category:Brawlers", {domain: DOMAIN, path:"api.php"})
  let brawlerNames = brawlerPages.map(brawlerPage => brawlerPage.title);

  // TODO remove after release of https://github.com/spencermountain/wtf_wikipedia/pull/473
  if (brawlerNames.length == 0) {
    brawlerNames = ['8-Bit', 'Amber', 'Ash', 'Barley', 'Bea', 'Belle', 'Bibi', 'Bo', 'Brock', 'Bull', 'Buzz', 'Byron', 'Carl', 'Colette', 'Colonel Ruffs', 'Colt', 'Crow', 'Darryl', 'Dynamike', 'Edgar', 'El Primo', 'Emz', 'Eve', 'Fang', 'Frank', 'Gale', 'Gene', 'Griff', 'Grom', 'Jacky', 'Jessie', 'Leon', 'Lola', 'Lou', 'Max', 'Meg', 'Mortis', 'Mr. P', 'Nani', 'Nita', 'Pam', 'Penny', 'Piper', 'Poco', 'Rico', 'Rosa', 'Sandy', 'Shelly', 'Spike', 'Sprout', 'Squeak', 'Stu', 'Surge', 'Tara', 'Tick']
  }

  // get ids of starpowers and gadgets
  const brawltimeNinjaStarpowerJSONFull = await fetch("https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.starpowerName_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.starpower_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22afterDate%22%2C%22values%22%3A%5B%222022-03-07%22%5D%7D%2C%7B%22member%22%3A%22battle.starpower_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%7D&queryType=multi").then(response => response.json())
  const brawltimeNinjaGadgetJSONFull = await fetch("https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.gadgetName_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.gadget_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22afterDate%22%2C%22values%22%3A%5B%222022-03-07%22%5D%7D%2C%7B%22member%22%3A%22battle.gadget_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%7D&queryType=multi").then(response => response.json())

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

  async function downloadFileToLocation(link, path) {
    if (link) {
      path = OUT_DIR + path

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
          console.log('skipping', path)
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
  }

  // iterate over all brawlers and scrape information
  for (const brawlerName of brawlerNames) {
    let brawlerObj = await getBrawlerData(brawlerName)
    await fs.promises.mkdir(OUT_DIR + brawlerObj.directory, { recursive: true });
    // download skins
    const skinCategories = brawlerObj.skins
    for (const skinCategory of skinCategories) {
      await fs.promises.mkdir(OUT_DIR + skinCategory.directory, { recursive: true });
      const skins = skinCategory.skins
      for (const skin of skins) {
        await downloadFileToLocation(skin.link, skin.path)
      }
    }
    // put default skin in main folder as model.png
    if (brawlerObj.model) {
      await downloadFileToLocation(brawlerObj.model.link, brawlerObj.model.path)
    }
    // put portrait in main folder as portrait.png
    if (brawlerObj.avatar) {
      await downloadFileToLocation(brawlerObj.avatar.link, brawlerObj.avatar.path)
    }
    // download voicelines
    await fs.promises.mkdir(OUT_DIR + brawlerObj.voiceLineDirectory, { recursive: true });
    const voiceLines = brawlerObj.voicelines
    for (const voiceLine of voiceLines) {
      await downloadFileToLocation(voiceLine.link, voiceLine.path)
    }
    // download pins
    await fs.promises.mkdir(OUT_DIR + brawlerObj.pinDirectory, { recursive: true });
    const pins = brawlerObj.pins
    if (pins) {
      for (const pin of pins) {
        await downloadFileToLocation(pin.link, pin.path)
      }
    }

    await fs.promises.writeFile(OUT_DIR + brawlerObj.directory + "data.json", JSON.stringify(brawlerObj))
    finishedBrawlers.push(brawlerName)
    printProgress(finishedBrawlers.length / brawlerNames.length, 20, brawlerName)
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
    const voiceLineElements = voiceLineSectionJson["templates"]
    return voiceLineElements.map(voiceLineElement => {
      const voiceLineFileName = voiceLineElement['filename'].replaceAll(" ", "_")
      const voicLineLink = getVoiceLineURLFromName(brawlerDocLinks, voiceLineFileName)
      const voiceLineName = voiceLineElement['filename']
      return {
        name: voiceLineName,
        description: voiceLineElement["filedescription"],
        link: voicLineLink,
        path: brawlerVoicelineDirectory + voiceLineName
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

    const brawler = {}
    brawler["id"] = brawlerId
    brawler["url"] = brawlerUrl
    brawler["name"] = brawlerName
    brawler["directory"] = brawlerDirectory
    brawler["voiceLineDirectory"] = brawlerVoicelineDirectory
    brawler["pinDirectory"] = brawlerPinDirectory
    brawler["description"] = getFirstParagraphFromSectionJson(wtfBrawler.sections()[0].json())
    brawler["stats"] = {}
    brawler["gadgets"] = []
    brawler["starpowers"] = []
    brawler["tips"] = []
    brawler["voicelines"] = []
    brawler["history"] = []
    brawler["skins"] = []

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
      stats[key] = stats[key]["text"]
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
    for (let i = gadgetSectionID+1; i < starPowerSectionID; i++) {
      const gadgetSection = wtfBrawler.sections()[i].json()
      const gadgetName = gadgetSection["title"]
      const gadgetId = getIdFromGadgetName(gadgetName)
      brawler["gadgets"].push({
        name: gadgetName,
        description: getFirstParagraphFromSectionJson(gadgetSection),
        id: gadgetId
      })
    }

    // star powers
    for (let i = starPowerSectionID+1; i < tipSectionID; i++) {
      const starPowerSection = wtfBrawler.sections()[i].json()
      const starpowerName = starPowerSection['title']
      const starpowerId = getIdFromStarpowerName(starpowerName)
      brawler["starpowers"].push({
        name: starpowerName,
        description: getFirstParagraphFromSectionJson(starPowerSection),
        id: starpowerId
      })
    }

    // tips
    const tipsSection = wtfBrawler.sections()[tipSectionID].json()
    const tipsElements = tipsSection["lists"][0]
    brawler["tips"] = tipsElements.map(tipElement => tipElement["text"])

    // voice lines
    if (voiceLineSectionID) {
      const voiceLineSection = wtfBrawler.sections()[voiceLineSectionID].json()
      brawler["voicelines"] = getVoiceLinesFromSection(voiceLineSection, brawlerDocLinks, brawlerVoicelineDirectory)
    }

    // history (little refactoring required :])
    const historySection = wtfBrawler.sections()[historySectionID].json()
    let historyEntryDescriptionCount = 0
    let date = -1
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

    // skins
    const SKINS_RELATIVE_PATH = "skins/"
    let skinSections = []
    if (skinSectionID == lastSectionID) {
      // single skin
      skinSections = [wtfBrawler.sections()[skinSectionID].json()]
    } else {
      for (let i = skinSectionID+1; i < lastSectionID+1; i++) {
        skinSections.push(wtfBrawler.sections()[i].json())
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
          return {
            name: skinName,
            cost: skinsElements['cost' + id],
            campaign: skinsElements['campaign' + id],
            link: getSkinURLFromName(brawlerDocLinks, skinType, skinName),
            path: SKIN_CATEGORY_PATH + skinName + ".png"
          }
        }
      });
      // default skin
      const defaultSkin = {
        name: "Default",
        cost: undefined,
        campaign: undefined,
        link: getSkinURLFromName(brawlerDocLinks, skinType, "Default"),
        path: SKIN_CATEGORY_PATH + "Default" + ".png"
      }
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
    brawler["model"] = {
      link: getSkinURLFromName(brawlerDocLinks, brawlerName, "Default"),
      path: brawlerDirectory + "model.png"
    }

    // portrait
    brawler["avatar"] = {
      link: getSkinURLFromName(brawlerDocLinks, brawlerName, "Portrait"),
      path: brawlerDirectory + "avatar.png"
    }

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
          return {
            name: pinName,
            link: pinLink,
            path: brawlerPinDirectory + pinName
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
