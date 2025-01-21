import 'dotenv/config'
import wtf from "wtf_wikipedia";
import wtfPluginApi from "wtf-plugin-api";
import { JSDOM } from "jsdom";
import fs from "fs";
import stringSimilarity from "string-similarity";
import { scrapeSkins } from "./src/skins.mts";
import {
  addToDownloadQueue,
  executeDownloadQueue,
  printProgress,
} from "./src/downloader.mts";
import { getMatchingStaticURL, sanitize } from "./src/util.mts";
wtf.extend(wtfPluginApi);

const DOMAIN = "brawlstars.fandom.com";
const OUT_DIR = "./out";
const BRAWLERS_DIR = "/brawlers/";
const GADGETS_DIR = "/gadgets/";
const STARPOWERS_DIR = "/starpowers/";

async function queryKlicker(query) {
  const params = new URLSearchParams({
    queryType: "multi",
    query: JSON.stringify(query),
  });
  const json = await fetch(
    "https://cube.brawltime.ninja/cubejs-api/v1/load?" + params.toString(),
    {
      headers: {
        Authorization: process.env.CUBEJS_API_SECRET,
      },
    },
  ).then((response) => response.json());
  return json["results"];
}

class FuzzyDict {
  constructor(private dict: Record<string, string>) {}

  getValue(key: string): string {
    const upperKey = key.toUpperCase();
    const starpowerKeys = Object.keys(this.dict);
    const matches = stringSimilarity.findBestMatch(upperKey, starpowerKeys);
    const bestMatch = matches.bestMatch.target;
    return this.dict[bestMatch];
  }
}

function mapKlickerDataToDict(data, keyProp, valueProp) {
  const dict = {};
  for (const entry of data[0]["data"]) {
    dict[entry[keyProp]] = entry[valueProp];
  }
  return dict;
}

async function main() {
  const brawlerPages = await wtf.getCategoryPages("Category:Brawlers", {
    domain: DOMAIN,
    path: "api.php",
  });
  const brawlerNames = brawlerPages.map((brawlerPage) => brawlerPage.title);

  const previously = new Date();
  previously.setDate(previously.getDate());
  const previouslyStr = previously.toISOString().substring(0, 10);

  // get ids of starpowers and gadgets
  const starpowerNameToIdDict = new FuzzyDict(
    mapKlickerDataToDict(
      await queryKlicker({
        measures: ["battle.starpowerName_measure"],
        dimensions: ["battle.brawler_dimension", "battle.starpower_dimension"],
        filters: [
          {
            member: "battle.season_dimension",
            operator: "gte",
            values: [previouslyStr],
          },
          {
            member: "battle.starpower_dimension",
            operator: "notEquals",
            values: ["0"],
          },
        ],
      }),
      "battle.starpowerName_measure",
      "battle.starpower_dimension"
    )
  );

  const gadgetNameToIdDict = new FuzzyDict(
    mapKlickerDataToDict(
      await queryKlicker({
        measures: ["battle.gadgetName_measure"],
        dimensions: ["battle.brawler_dimension", "battle.gadget_dimension"],
        filters: [
          {
            member: "battle.season_dimension",
            operator: "gte",
            values: [previouslyStr],
          },
          {
            member: "battle.gadget_dimension",
            operator: "notEquals",
            values: ["0"],
          },
        ],
      }),
      "battle.gadgetName_measure",
      "battle.gadget_dimension"
    )
  );

  // iterate over all brawlers and scrape information
  let progress = 0;
  console.log(
    "Downloading Brawler information for " + brawlerNames.length + " brawlers"
  );
  for (const brawlerName of brawlerNames) {
    let brawlerObj;
    try {
      brawlerObj = await getBrawlerData(brawlerName);
    } catch (err) {
      console.error("Cannot scrape " + brawlerName, err);
    }
    if (brawlerObj == undefined) {
      continue;
    }

    await fs.promises.mkdir(OUT_DIR + brawlerObj.directory, {
      recursive: true,
    });
    await fs.promises.writeFile(
      OUT_DIR + brawlerObj.directory + "data.json",
      JSON.stringify(brawlerObj)
    );

    printProgress(++progress / brawlerNames.length, 20, brawlerName);
  }

  await executeDownloadQueue();

  function getFirstParagraphFromSectionJson(sectionJson) {
    try {
      return sectionJson["paragraphs"][0]["sentences"][0]["text"].slice(1, -1);
    } catch {}
  }

  function getVoiceLineURLFromName(links, voiceLineName) {
    return links.find((link) =>
      link.toLowerCase().includes(voiceLineName.toLowerCase())
    );
  }

  function getAccessoryURLFromIndex(links, kind, brawlerName, index) {
    const short = kind == "gadgets" ? "gd" : "sp";
    return links.find((link) =>
      link
        .toLowerCase()
        .includes(`${short}-${brawlerName.toLowerCase()}${index + 1}`)
    );
  }

  function getAllLinksFromDoc(brawlerDoc) {
    let links = [];
    const attributes = ["src", "href", "data-src"];
    const allElements = brawlerDoc.getElementsByTagName("*");
    for (const element of allElements) {
      for (const attribute of attributes) {
        const attributeValue = element.getAttribute(attribute);
        if (attributeValue && attributeValue.includes("https")) {
          const link = attributeValue.replaceAll(/scale-to-.*?(?=\?)/g, "");
          links.push(link);
        }
      }
    }
    return links;
  }

  function getVoiceLinesFromSection(
    voiceLineSectionJson,
    brawlerDocLinks,
    brawlerVoicelineDirectory
  ) {
    const voiceLineElements = voiceLineSectionJson["templates"] ?? [];
    return voiceLineElements
      .filter((ve) => ve["filename"] != undefined)
      .map((voiceLineElement) => {
        const voiceLineFileName = voiceLineElement["filename"].replaceAll(
          " ",
          "_"
        );
        const voiceLineLink = getVoiceLineURLFromName(
          brawlerDocLinks,
          voiceLineFileName
        );
        const voiceLineName = voiceLineElement["filename"];
        const path = brawlerVoicelineDirectory + sanitize(voiceLineName);

        addToDownloadQueue(voiceLineLink, path);

        return {
          name: voiceLineName,
          description: voiceLineElement["filedescription"],
          path,
        };
      });
  }

  async function getBrawlerData(brawlerName) {
    const wtfBrawler = await wtf.fetch(brawlerName, { domain: DOMAIN });
    // EN
    const brawlerUrl = wtfBrawler.url().replace("//en.", "//");
    const brawlerHtml = await fetch(brawlerUrl).then((response) =>
      response.text()
    );
    const brawlerDoc = new JSDOM(brawlerHtml).window.document;
    const brawlerDocLinks = getAllLinksFromDoc(brawlerDoc);
    // RU
    const brawlerUrlRU = brawlerDocLinks.find((link) =>
      link.includes("https://brawlstars.fandom.com/ru/wiki/")
    );
    let brawlerHtmlRU, brawlerDocRU, brawlerDocLinksRU;
    if (brawlerUrlRU) {
      brawlerHtmlRU = await fetch(brawlerUrlRU).then((response) =>
        response.text()
      );
      brawlerDocRU = new JSDOM(brawlerHtmlRU).window.document;
      brawlerDocLinksRU = [...new Set(getAllLinksFromDoc(brawlerDocRU))];
    } else {
      console.log(brawlerName + " has no russian page");
    }

    const brawlerId = brawlerName.replace(/\.| |&/g, "_").toLowerCase();
    const brawlerDirectory = BRAWLERS_DIR + brawlerId + "/";
    const brawlerVoicelineDirectory = brawlerDirectory + "voice-lines/";
    const brawlerPinDirectory = brawlerDirectory + "pins/";
    const brawlerDescription = getFirstParagraphFromSectionJson(
      wtfBrawler.sections()[0].json()
    );

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
      skins: [] as any[],
    };

    // assign section ids
    let attackSectionID,
      superSectionID,
      gadgetSectionID,
      starPowerSectionID,
      tipSectionID,
      voiceLineSectionID,
      historySectionID;

    for (let i = 0; i < wtfBrawler.sections().length; i++) {
      const section = wtfBrawler.sections()[i];
      const title = section.json()["title"];
      if (title.includes("Attack")) {
        attackSectionID = i;
      }
      if (title.includes("Super")) {
        superSectionID = i;
      }
      if (title.includes("Gadget")) {
        gadgetSectionID = i;
      }
      if (title.includes("Star Powers") || title.includes("Star Power")) {
        starPowerSectionID = i;
      }
      if (title.includes("Tips")) {
        tipSectionID = i;
      }
      if (title.includes("Voice Lines")) {
        voiceLineSectionID = i;
      }
      if (title.includes("History")) {
        historySectionID = i;
      }
    }

    if (wtfBrawler.sections()[0].json()["infoboxes"] == undefined) {
      return;
    }

    // stats
    const stats = wtfBrawler.sections()[0].json()["infoboxes"][0];

    // TODO: gadgetcharges missing
    const brawlerStatKeys = ["rarity", "class", "movementspeed", "voiceactor"];
    const brawlerAttackStatKeys = [
      "attackrange",
      "reload",
      "attackbullets",
      "attacksupercharge",
      "attackspread",
      "attackspeed",
      "attackwidth",
      "attackcooldown",
    ];
    const brawlerSuperStatKeys = [
      "superrange",
      "superbullets",
      "supersupercharge",
      "superspread",
      "superspeed",
      "superwidth",
      "superminionrange",
      "superminion",
      "supermovementspeed",
      "superduration",
      "superreload",
    ];
    const brawlerHealthKey = "health";
    const brawlerAttackKey = "attack";
    const brawlerSuperKey = "super";

    for (const key in stats) {
      stats[key] = stats[key]["text"].replace(/\s(\d)/g, ", $1");
    }
    const brawlerStats = {};
    brawlerStatKeys.forEach((key) => {
      brawlerStats[key] = stats[key];
    });
    const brawlerAttackStats = {};
    brawlerAttackStatKeys.forEach((key) => {
      brawlerAttackStats[key] = stats[key];
    });
    const brawlerSuperStats = {};
    brawlerSuperStatKeys.forEach((key) => {
      brawlerSuperStats[key] = stats[key];
    });

    brawler["stats"] = brawlerStats;

    function generateStatsPerLevelList(base) {
      base = parseInt(base);
      const statsPerLevel = [];
      for (let level = 0; level < 11; level++) {
        statsPerLevel.push(base + level * (base / 10));
      }
      return statsPerLevel;
    }

    brawler["healthByLevel"] = generateStatsPerLevelList(
      stats[brawlerHealthKey]
    );

    function getStatsByLevelWithKey(stats, statName) {
      function getIndexString(index) {
        return index == 1 ? "" : index.toString();
      }

      const statsByLevel = [];
      let i = 1;
      while (statName + getIndexString(i) in stats) {
        statsByLevel.push({
          name: stats[statName + "label" + getIndexString(i)],
          list: generateStatsPerLevelList(stats[statName + getIndexString(i)]),
        });
        i++;
      }
      return statsByLevel;
    }

    // attack
    const attackSection = wtfBrawler.sections()[attackSectionID].json();
    brawler["attack"] = {
      name: attackSection["title"].replace("Attack: ", ""),
      description: getFirstParagraphFromSectionJson(attackSection),
      stats: brawlerAttackStats,
      statsByLevel: getStatsByLevelWithKey(stats, brawlerAttackKey),
    };

    // super
    const superSection = wtfBrawler.sections()[superSectionID].json();
    brawler["super"] = {
      name: superSection["title"].replace("Super: ", ""),
      description: getFirstParagraphFromSectionJson(superSection),
      stats: brawlerSuperStats,
      statsByLevel: getStatsByLevelWithKey(stats, brawlerSuperKey),
    };

    // gadgets
    let gadgetCounter = 0;
    for (let i = gadgetSectionID; i < starPowerSectionID; i++) {
      const gadgetSection = wtfBrawler.sections()[i].json();
      const name = gadgetSection["title"];

      if (name == "Gadgets") {
        // pages with only 1 gadget have the gadget section at top level,
        // pages with 2 have 1 section with 2 child sections
        // if the section title is 'Gadgets', this is the parent section - skip it
        continue;
      }

      const id = gadgetNameToIdDict.getValue(name);
      const description = getFirstParagraphFromSectionJson(gadgetSection);
      const link = getAccessoryURLFromIndex(
        brawlerDocLinks,
        "gadgets",
        brawler.name,
        gadgetCounter
      );
      const path = GADGETS_DIR + id + ".png";
      brawler["gadgets"].push({
        name,
        description,
        id,
        path,
      });

      addToDownloadQueue(link, path);

      gadgetCounter++;
    }

    // star powers
    let starpowerCounter = 0;
    for (let i = starPowerSectionID; i < tipSectionID; i++) {
      const starPowerSection = wtfBrawler.sections()[i].json();
      const name = starPowerSection["title"];
      if (name == "Star Powers") {
        // pages with only 1 star power have the star power section at top level,
        // pages with 2 have 1 section with 2 child sections
        // if the section title is 'Star Powers', this is the parent section - skip it
        continue;
      }

      if (name.startsWith("Hypercharge") || name.startsWith("Mutation")) {
        break;
      }

      const description = getFirstParagraphFromSectionJson(starPowerSection);
      const id = starpowerNameToIdDict.getValue(name);
      const link = getAccessoryURLFromIndex(
        brawlerDocLinks,
        "starpowers",
        brawler.name,
        starpowerCounter
      );
      const path = STARPOWERS_DIR + id + ".png";
      brawler["starpowers"].push({
        name,
        description,
        id,
        path,
      });

      addToDownloadQueue(link, path);

      starpowerCounter++;
    }

    // tips
    const tipsSection = wtfBrawler.sections()[tipSectionID].json();
    const tipsElements =
      tipsSection["lists"] != undefined ? tipsSection["lists"][0] : [];
    brawler["tips"] = tipsElements.map((tipElement) => tipElement["text"]);

    // voice lines
    if (voiceLineSectionID) {
      const voiceLineSection = wtfBrawler.sections()[voiceLineSectionID].json();
      brawler["voicelines"] = getVoiceLinesFromSection(
        voiceLineSection,
        brawlerDocLinks,
        brawlerVoicelineDirectory
      );
    }

    // history (little refactoring required :])
    if (wtfBrawler.sections()[historySectionID] != undefined) {
      const historySection = wtfBrawler.sections()[historySectionID].json();
      let historyEntryDescriptionCount = 0;
      let date = -1;
      if (historySection["lists"] != undefined) {
        for (const historyEntryElement of historySection["lists"][0]) {
          if (
            historyEntryElement["text"].search("[0-9]+/[0-9]+/[0-9]+") != -1
          ) {
            date = historyEntryElement["text"];
          } else {
            const historyEntryDescriptions = historySection["templates"];
            let historyEntryType = "";
            if (
              historyEntryDescriptions.length - 1 >
              historyEntryDescriptionCount
            ) {
              historyEntryType =
                historyEntryDescriptions[historyEntryDescriptionCount][
                  "list"
                ][0];
            }
            brawler["history"].push({
              date: date,
              description: historyEntryElement["text"],
              type: historyEntryType,
            });
            historyEntryDescriptionCount += 1;
          }
        }
      }
    }

    brawler["skins"] = await scrapeSkins(brawlerName);
    brawler["skins"].forEach((skin) =>
      addToDownloadQueue(skin.link, skin.path)
    );

    // model / default skin
    const modelLink = getMatchingStaticURL(brawlerDocLinks, [
      brawlerName,
      "Skin",
      "Default",
    ]);
    const modelPath = brawlerDirectory + "model.png";
    addToDownloadQueue(modelLink, modelPath);

    brawler["model"] = { path: modelPath };

    // portrait
    const portraitLink = getMatchingStaticURL(brawlerDocLinks, [
      brawlerName,
      "Portrait",
    ]);
    const portraitPath = brawlerDirectory + "avatar.png";
    addToDownloadQueue(portraitLink, portraitPath);

    brawler["avatar"] = { path: portraitPath };

    // pins (russian)
    if (brawlerUrlRU) {
      const addedPins = [];
      let pinLinks = brawlerDocLinksRU.filter((link) => link.includes("_Pin"));
      pinLinks = pinLinks.filter((item, pos) => pinLinks.indexOf(item) == pos);
      const pins = pinLinks.map((pinLink) => {
        let pinName = pinLink
          .split("/")
          .filter((linkPart) => linkPart.includes("Pin"))[0];
        pinName = pinName.split("_")[pinName.split("_").length - 1];
        if (!addedPins.includes(pinName)) {
          addedPins.push(pinName);
          const path = brawlerPinDirectory + sanitize(pinName);

          addToDownloadQueue(pinLink, path);

          return {
            name: pinName,
            path,
          };
        }
      });
      brawler["pins"] = pins.filter((element) => element !== undefined);
    }

    // output
    return brawler;
  }
}

main().catch(console.error);
