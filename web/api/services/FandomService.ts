// @ts-ignore
import wtf from "wtf_wikipedia";
// @ts-ignore
import wtfPluginApi from "wtf-plugin-api";
import { Cache } from "~/lib/cache";
import { brawlerId, formatClickhouseDate, getTodaySeasonEnd } from "~/lib/util";
import * as cheerio from "cheerio";
import { KlickerService } from "@schneefux/klicker/service";

wtf.extend(wtfPluginApi);
const wtfOpts = { domain: "brawlstars.fandom.com", path: "api.php" };

const FANDOM_CACHE_MINUTES = 60 * 24;

export interface Asset {
  sourceUrl: string;
  filename: string;
}

export interface DownloadedAsset extends Asset {
  // TODO implement downloader
  updatedAt: Date;
  contentType: string;
  content: Buffer;
}

export interface BrawlerTip {
  brawlerId: string;
  description: string;
}

export interface HistoryEntry {
  date: Date;
  description: string;
}

export interface BalanceHistoryEntry {
  kind: "Buff" | "Nerf" | "Neutral";
  date: Date;
  description: string;
}

export interface FandomModeData {
  attribution: string;
  shortDescription: string;
  fullDescription: string;
  tips: string[];
  brawlerTips: BrawlerTip[];
  history: HistoryEntry[];
}

export interface Voiceline {
  trigger: string;
  description: string;
  asset: Asset | undefined;
}

export interface Pin extends AssetAble {
  rarity: string; // "Free" | "Common" | "Rare" | "Epic" | "Exclusive";
  emote: string; // "Happy" | "Sad" | "Angry" | "GG" | "Clap" | "Thanks" | "Phew" | "Special" | "Facepalm" | "Hypercharge";
}

export interface Spray extends AssetAble {
  rarity: string;
}

export interface PetSkin extends AssetAble {
  for: string;
}

export interface Skin extends AssetAble {
  name: string;
  cost?: string;
  campaign?: string;
  rarity?: string;
  exclusive?: boolean;
  seasonal?: boolean;
  petSkins: PetSkin[];
  pins: Pin[];
  voicelines: Voiceline[];
  sprays: Spray[];
  profileIcons: Asset[];
}

interface DescribeAble {
  name: string;
  description: string;
}

interface StatsAble {
  stats: {
    label: string;
    value: string;
  }[];
}

interface StatsByLevelAble {
  statsByLevel: {
    name: string;
    levels: number[];
    values: number[];
  }[];
}

interface AssetAble {
  asset: Asset;
}

interface IdAble {
  /** identifier used in the API and the database */
  brawlstarsId: string | undefined;
}

export interface Attack extends DescribeAble, StatsAble, StatsByLevelAble {}

export interface Hypercharge extends DescribeAble, StatsAble {}

export interface Accessory extends DescribeAble, AssetAble, StatsByLevelAble, IdAble {}

export interface FandomBrawlerData extends IdAble {
  attribution: string;
  shortDescription: string;
  fullDescription: string;
  trait: string | undefined;
  attack: Attack;
  altAttack: Attack | undefined;
  super: Attack;
  altSuper: Attack | undefined;
  hypercharge: Hypercharge | undefined;
  stats: {
    rarity: string;
    class: string;
    movementspeed: string;
    voiceactor: string;
  };
  healthByLevel: number[];
  tips: string[];
  model: Asset;
  avatar: Asset;
  skins: Skin[];
  history: BalanceHistoryEntry[];
  gadgets: Accessory[]
  starpowers: Accessory[]
  // videos
  // … translations via GPT-4o
}

interface KlickerData {
  brawlers: string[];
  gadgets: KlickerAccessory[];
  starpowers: KlickerAccessory[];
}

interface KlickerAccessory {
  brawler: string;
  name: string;
  id: string;
}

wtf.extend((models: any, templates: any) => {
  templates["rarity"] = 0; // return first arg (rarity name));

  templates["ogg"] = (tmpl: any, list: any, parse: any) => {
    const data = parse(tmpl);
    return JSON.stringify({
      file: data["filename"],
      description: data["filedescription"],
    });
  };

  templates["translate"] = (tmpl: any, list: any, parse: any) => {
    const data = parse(tmpl);
    return `${data.list[0]} (${data.list[1]})`;
  };

  templates["balance"] = (tmpl: any, list: any, parse: any) => {
    const data = parse(tmpl);

    if (data.list == undefined) {
      return "";
    }

    return JSON.stringify({
      kind: data.list[0],
      description: data.list[1],
    });
  };
});

export default class FandomService {
  private modeCache = new Cache<string, FandomModeData | undefined>(
    FANDOM_CACHE_MINUTES
  );

  constructor(private $klicker: KlickerService) {}

  public async update() {}

  async cachedGetModeData(modeName: string) {
    return await this.modeCache.getOrUpdate(modeName, async () => {
      console.log("Updating fandom mode cache for", modeName);

      const data = await this.getModeData(modeName);
      if (data == undefined) {
        console.log("No fandom mode data for", modeName);
      }

      return data;
    });
  }

  async getModeData(modeName: string): Promise<FandomModeData | undefined> {
    const modePage: any = await wtf.fetch(modeName, wtfOpts);
    if (modePage == null) {
      // does not exist
      return undefined;
    }

    const description: string = modePage.section("").text();
    const shortDescription: string = description
      .split("\n")[0]
      .replaceAll('"', "");
    const le5v5Description = modePage.section(modeName + " 5v5").text();
    const fullDescription: string =
      description.split("\n").slice(1).join("\n").trim() +
      (le5v5Description ? "\n\n" + le5v5Description : "");

    const brawlerTips: BrawlerTip[] = (
      modePage
        .section("Useful Brawlers")
        .list(0)
        .lines()
        .map((l: any) => l.text()) as string[]
    )
      .map((l: string) => {
        const groups = l.match(/^(\w+): (.*)$/);
        if (groups == null) {
          return undefined;
        }
        return {
          brawlerId: brawlerId({ name: groups[1] }),
          description: groups[2],
        };
      })
      .filter((t) => t != undefined);

    const tips: string[] = modePage
      .section("Tips")
      .list(0)
      .lines()
      .map((l: any) => l.text()) as string[];

    const history: HistoryEntry[] = (
      modePage
        .section("History")
        .list(0)
        .lines()
        .map((l: any) => l.text()) as string[]
    )
      .map((l: any) => {
        const groups = l.match(/^On (\d{2})\/(\d{2})\/(\d{2}), (.*)$/);
        if (groups == null) {
          return undefined;
        }
        const date = new Date(
          Date.parse(`20${groups[3]}-${groups[2]}-${groups[1]}`)
        );
        return { date, description: groups[4] };
      })
      .filter((l) => l != undefined);

    const url = modePage.url().replace("//en.", "//");

    return {
      attribution: url,
      shortDescription,
      fullDescription,
      tips,
      brawlerTips,
      history,
    };
  }

  private extractFirstQuote(text: string) {
    return text.match(/"(.*)"/)?.[1];
  }

  private parseDescriptions(brawlerPage: any) {
    const description: string = brawlerPage.section("").text();
    const shortDescription: string = this.extractFirstQuote(description) ?? "";

    if (shortDescription == "") {
      console.warn("Could not parse short description");
    }

    const fullDescription: string = description
      .split("\n")
      .slice(1)
      .join("\n")
      .trim();

    if (fullDescription == "") {
      console.warn("Could not parse full description");
    }

    let trait: string | undefined = undefined;

    const traitSection = brawlerPage.section("Trait");
    if (traitSection) {
      trait = this.extractFirstQuote(traitSection.text());
    }

    const traitsSection = brawlerPage.section("Traits");
    if (traitsSection) {
      trait = traitsSection
        .sections()
        .map((s: any) => this.extractFirstQuote(s.text()))
        .filter((t: string | undefined) => t != undefined)
        .join("\n");
    }

    return { shortDescription, fullDescription, trait };
  }

  private parseStats(brawlerPage: any) {
    const infobox = brawlerPage.infobox("brawler infobox").json();
    for (const key in infobox) {
      infobox[key] = infobox[key]["text"].replace(/\s(\d)/g, ", $1");
    }

    return {
      stats: {
        rarity: infobox["rarity"],
        class: infobox["class"],
        movementspeed: infobox["movementspeed"],
        voiceactor: infobox["voiceactor"],
      },
    };
  }

  private parseHealthByLevel(brawlerPage: any): Pick<FandomBrawlerData, "healthByLevel"> {
    const infobox = brawlerPage.infobox("brawler infobox");

    const generateStatsPerLevelList = (base: number) => {
      const statsPerLevel = [];
      for (let level = 0; level < 11; level++) {
        statsPerLevel.push(base + level * (base / 10));
      }
      return statsPerLevel;
    };

    return {
      healthByLevel: generateStatsPerLevelList(
        infobox.get("health").json().number
      ),
    };
  }

  private parseNameAndDescription(section: any, tag: string): DescribeAble {
    const name = section?.title().replace(/.*: /, "");
    const description = this.extractFirstQuote(section?.text());

    if (name == undefined || description == undefined) {
      console.warn("Could not parse " + tag + " name or description");
    }

    return {
      name: name ?? "",
      description: description ?? "",
    }
  }

  private parseAttack(brawlerPage: any, $: cheerio.CheerioAPI): Pick<FandomBrawlerData, "attack"|"altAttack"> {
    const attackSections = this.findSectionOrSections(brawlerPage, "Attack");

    if (attackSections.length == 0) {
      console.warn("Could not find attack section");
    }

    if (attackSections.length > 2) {
      console.warn("Found more than two attack sections");
    }

    const attackSection = attackSections[0];
    const { name, description } = this.parseNameAndDescription(attackSection, "attack");
    const attackStats = this.parseInfoboxTable($, "Attack");

    let altAttack: Attack | undefined = undefined;
    const altAttackSection = attackSections[1];
    if (altAttackSection) {
      const { name, description } = this.parseNameAndDescription(altAttackSection, "second attack");
      // TODO split stats and statsByLevel

      altAttack = {
        name,
        description,
        stats: attackStats?.stats ?? [],
        statsByLevel: attackStats?.statsByLevel ?? [],
      };
    }

    return {
      attack: {
        name,
        description,
        stats: attackStats?.stats ?? [],
        statsByLevel: attackStats?.statsByLevel ?? [],
      },
      altAttack,
    };
  }

  private parseSuper(brawlerPage: any, $: cheerio.CheerioAPI): Pick<FandomBrawlerData, "super"|"altSuper"> {
    const superSections = this.findSectionOrSections(brawlerPage, "Super");

    if (superSections.length == 0) {
      console.warn("Could not find super section");
    }

    if (superSections.length > 2) {
      console.warn("Found more than two super sections");
    }

    const superSection = superSections[0];
    const { name, description } = this.parseNameAndDescription(superSection, "super");
    const superStats = this.parseInfoboxTable($, "Super");

    let altSuper: Attack | undefined = undefined;
    const altSuperSection = superSections[1];
    if (altSuperSection) {
      const { name, description } = this.parseNameAndDescription(altSuperSection, "second super");
      // TODO split stats and statsByLevel

      altSuper = {
        name,
        description,
        stats: superStats?.stats ?? [],
        statsByLevel: superStats?.statsByLevel ?? [],
      };
    }

    return {
      super: {
        name,
        description,
        stats: superStats?.stats ?? [],
        statsByLevel: superStats?.statsByLevel ?? [],
      },
      altSuper,
    };
  }

  /** return subsections or the section itself */
  private findSectionOrSections(brawlerPage: any, startsWith: string) {
    const section = brawlerPage
      .sections()
      .find((s: any) => s.title().startsWith(startsWith));

    if (section == undefined) {
      return [];
    }

    const subsections = section.sections()

    if (subsections.length > 0) {
      return subsections;
    }
    return [section]
  }

  private parseHypercharge(brawlerPage: any, $: cheerio.CheerioAPI): Pick<FandomBrawlerData, "hypercharge"> {
    const hyperchargeSections = this.findSectionOrSections(brawlerPage, "Hypercharge");

    if (hyperchargeSections.length == 0) {
      return {
        hypercharge: undefined,
      };
    }

    if (hyperchargeSections.length > 1) {
      console.warn("Found multiple hypercharge sections");
    }

    const hyperchargeSection = hyperchargeSections[0];
    const { name, description } = this.parseNameAndDescription(hyperchargeSection, "hypercharge");
    const hyperchargeStats = this.parseInfoboxTable($, "Hypercharge");

    return {
      hypercharge: {
        name,
        description,
        stats: hyperchargeStats?.stats ?? [],
      },
    };
  }

  private parseGadgets(
    brawlerName: string,
    brawlerPage: any,
    $: cheerio.CheerioAPI,
    klickerGadgets: KlickerAccessory[],
  ): Pick<FandomBrawlerData, "gadgets"> {
    const gadgetSections = this.findSectionOrSections(brawlerPage, "Gadget");

    const gadgets: Accessory[] = [];
    for (let gadgetIndex = 0; gadgetIndex < gadgetSections.length; gadgetIndex++) {
      const gadgetSection = gadgetSections[gadgetIndex];
      const { name, description } = this.parseNameAndDescription(gadgetSection, "gadget");
      const gadgetStats = this.parseInfoboxTable($, `Gadget: ${name}`, true);
      const klickerGadget = klickerGadgets.find((s) => this.compareName(brawlerName, s.brawler) && this.compareName(name, s.name))

      if (klickerGadget == undefined) {
        console.warn("Could not find corresponding gadget in klicker", { brawler: brawlerName, gadget: name });
      }

      gadgets.push({
        brawlstarsId: klickerGadget?.id,
        name,
        description,
        asset: this.findAssetByAttr($, `GD-${brawlerName}${gadgetIndex + 1}`, "data-image-name")!,
        statsByLevel: gadgetStats?.statsByLevel ?? [],
      });
    }

    return {
      gadgets,
    };
  }

  private parseStarpowers(
    brawlerName: string,
    brawlerPage: any,
    $: cheerio.CheerioAPI,
    klickerStarpowers: KlickerAccessory[],
  ): Pick<FandomBrawlerData, "starpowers"> {
    const starpowerSections = this.findSectionOrSections(brawlerPage, "Star Power");

    const starpowers: Accessory[] = [];
    for (let starpowerIndex = 0; starpowerIndex < starpowerSections.length; starpowerIndex++) {
      const starpowerSection = starpowerSections[starpowerIndex];
      const { name, description } = this.parseNameAndDescription(starpowerSection, "gadget");
      const starpowerStats = this.parseInfoboxTable($, `Star Power: ${name}`, true);
      const klickerStarpower = klickerStarpowers.find((s) => this.compareName(brawlerName, s.brawler) && this.compareName(name, s.name))

      if (klickerStarpower == undefined) {
        console.warn("Could not find corresponding starpower in klicker", { brawler: brawlerName, starpower: name });
      }

      starpowers.push({
        brawlstarsId: klickerStarpower?.id,
        name,
        description,
        asset: this.findAssetByAttr($, `SP-${brawlerName}${starpowerIndex + 1}`, "data-image-name")!,
        statsByLevel: starpowerStats?.statsByLevel ?? [],
      });
    }

    return {
      starpowers,
    };
  }

  private parseInfoboxTable(
    $: cheerio.CheerioAPI,
    sectionName: string,
    optional = false,
  ): (StatsAble & StatsByLevelAble) | undefined {
    const brawlerInfobox = $(".portable-infobox");
    const infoboxSection = brawlerInfobox
      .find("h2")
      .filter((i, el) => $(el).text() == sectionName)
      .first()
      .parent();

    if (infoboxSection.length == 0) {
      if (!optional) {
        console.warn("Could not find infobox section ", { sectionName });
      }
      return;
    }

    const stats = infoboxSection
      .find(".pi-data")
      .map((i, el) => ({
        label: $(el).find(".pi-data-label").text(),
        value:
          $(el)
            .find(".pi-data-value")
            .html()
            ?.replace(/<br\s*\/?>/gi, "\n") ?? "",
      }))
      .get();

    const names = infoboxSection
      .find(".pi-group")
      .first()
      .find(".pi-data-value")
      .map((i, el) => $(el).text())
      .get();

    const values = infoboxSection
      .find(".pi-group")
      .map((rowIndex, el): { value: number; columnIndex: number }[] => {
        if (rowIndex == 0) {
          return [];
        }

        return $(el)
          .find(".pi-data-value")
          .map((columnIndex, el) => ({
            value: parseInt($(el).text()),
            columnIndex,
          }))
          .get();
      })
      .get();

    const levelColumnIndex = names.findIndex((name) => name == "Level");
    const levels = values.filter((v) => v.columnIndex == levelColumnIndex).map((v) => v.value);
    const statsByLevel = names
      .map((name, columnIndex) => ({
        name,
        levels,
        values: values
          .filter((v) => v.columnIndex == columnIndex)
          .map((v) => v.value),
      }))
      .filter((s) => s.name != "Level")

    return {
      stats,
      statsByLevel,
    };
  }

  private parseTips(brawlerPage: any) {
    return {
      tips: brawlerPage
        .section("Tips")
        .sections()
        .flatMap((s: any) => s.list(0)?.lines() ?? [])
        .map((l: any) => l.text()) as string[],
    };
  }

  private parseVoicelines(
    brawlerPage: any,
    $: cheerio.CheerioAPI
  ): { skinName: string; voiceline: Voiceline }[] {
    const voicelinesWikitext = (
      brawlerPage.section("Voice Lines").table(0).wikitext() as string
    ).split("\n");

    const headers: string[] = [];
    const rows: { skinName: string; voiceline: Voiceline }[] = [];
    let state: "header" | "body" = "header";
    let voiceline: Partial<Voiceline> = {};
    let skinName: string = "Default";
    let columnIndex = -1;

    const advance = () => {
      if (
        voiceline.trigger != undefined &&
        voiceline.description != undefined &&
        voiceline.asset != undefined
      ) {
        rows.push({
          skinName,
          voiceline: {
            trigger: voiceline.trigger,
            description: voiceline.description,
            asset: voiceline.asset,
          },
        });
      }
    };

    for (const line of voicelinesWikitext) {
      if (state == "header") {
        if (line.startsWith("!")) {
          headers.push(line.substring(1).trim());
        } else if (line.startsWith("|-")) {
          state = "body";
          continue;
        }
      }

      if (state == "body") {
        for (let part of line.split("'''")) {
          part = part.trim();

          if (part.startsWith("|")) {
            advance();
            columnIndex++;
            skinName = "Default";
            voiceline = {
              trigger: headers[columnIndex],
            };
            part = part.substring(1);
          }

          if (part == "-") {
            advance();
            columnIndex = -1;
          }

          if (part.startsWith("{") && part.endsWith("}")) {
            const data = JSON.parse(part);
            voiceline.description = data.description.replace(/"/g, "");

            const sourceUrl = $("audio")
              .map((i, el) => $(el).attr("src"))
              .get()
              .find((src) => src.toLowerCase().includes(data.file.toLowerCase().replaceAll(" ", "_")));

            voiceline.asset =
              sourceUrl != undefined
                ? {
                    sourceUrl,
                    filename: data.file,
                  }
                : undefined;
          }

          if (part.endsWith(":")) {
            advance();
            voiceline = {
              trigger: headers[columnIndex],
            };
            skinName = part
              .substring(0, part.length - 1)
              .replace("Normal", "Default");
          }
        }
      }
    }

    const voicelinesTable = this.findFirstTableInSection($, "Voice Lines");
    const audioButtonsCount = voicelinesTable.find(".audio-button").length;
    if (rows.length != audioButtonsCount) {
      console.warn("Parsed unexpected number of voicelines", {
        actual: rows.length,
        expected: audioButtonsCount,
      });
    }

    return rows;
  }

  private findFirstTableInSection($: cheerio.CheerioAPI, sectionName: string) {
    return $("h2,h3")
      .filter((i, el) => $(el).text() == sectionName)
      .nextAll("table")
      .first();
  }

  private findAssetByAttr(
    $: cheerio.CheerioAPI,
    value: string,
    attr: "title" | "alt" | "data-image-name"
  ): Asset | undefined {
    const img = $("#content img")
      .filter((i, el) => {
        const titleText = $(el).attr(attr) ?? "";
        return titleText.includes(value);
      })
      .first();

    if (img == undefined) {
      console.warn("Could not find image", value);
      return undefined;
    }

    const asset = this.parseImgAsAsset(img);

    if (asset == undefined) {
      console.warn("Could not parse image as asset", value);
      return undefined;
    }

    return asset;
  }

  private parseImgAsAsset(img: cheerio.Cheerio<any>): Asset | undefined {
    const src = img.attr("data-src") ?? img.attr("src");
    const queryParams = src?.split("?")[1]; // keep cb (cache buster) timestamp
    const sourceUrl =
      src?.split("/smart")[0]?.split("/scale")[0] +
      (queryParams ? "?" + queryParams : ""); // remove resizing parameters

    const filename = img.attr("data-image-name");

    if (sourceUrl == undefined) {
      return undefined;
    }

    if (filename == undefined) {
      return undefined;
    }

    return {
      filename,
      sourceUrl,
    };
  }

  private parseDefaultSkin(brawlerName: string, $: cheerio.CheerioAPI): Pick<FandomBrawlerData, "model"> {
    return {
      model: this.findAssetByAttr($, `${brawlerName} Skin-Default`, "alt")!,
    };
  }

  private parseAvatar(brawlerName: string, $: cheerio.CheerioAPI): Pick<FandomBrawlerData, "avatar"> {
    return {
      avatar: this.findAssetByAttr($, `${brawlerName} Portrait`, "data-image-name")!,
    };
  }

  /**
   * Map a template like
   * { name1: 'Panda', rarity1: 'Rare', ... }
   * to
   * [ { name: ['Panda'], rarity: ['Rare'] }, ... ]
   */
  public parseEnumeratedKeys(template: any): any[] {
    const keys = Object.keys(template);
    const values: Record<string, any[]> = {};

    keys.forEach((key) => {
      const match =
        key.match(/^(\w+?)(p?)(\d+)(?:_(\d+))?$/) ??
        key.match(/^(\w+?)(p)()(?:_(\d+))?$/);
      if (match == null) {
        return;
      }

      const keyName = match[1];
      const groupName = match[2];
      const index1 = match[3] != "" ? parseInt(match[3]) : 0;
      const index2 = match[4] != undefined ? parseInt(match[4]) - 1 : 0;

      if (values[groupName] == undefined) {
        values[groupName] = [];
      }

      if (values[groupName][index1] == undefined) {
        values[groupName][index1] = {};
      }

      if (values[groupName][index1][keyName] == undefined) {
        values[groupName][index1][keyName] = [];
      }

      values[groupName][index1][keyName][index2] = template[key];
    });

    return Object.values(values)
      .flat()
      .filter((v) => v != undefined);
  }

  private parsePins($: cheerio.CheerioAPI): { skin: Asset; pin: Pin }[] {
    const pinsTable = this.findFirstTableInSection($, "Pins");

    if (pinsTable == undefined) {
      return [];
    }

    let skinAsset: Asset | undefined = undefined;
    const pins: { skin: Asset; pin: Pin }[] = [];
    for (const pin of pinsTable.find("td")) {
      const pinTd = $(pin);

      if (pinTd.children().length == 0) {
        continue;
      }

      const img = pinTd.find("img").first();

      const asset = this.parseImgAsAsset(img);
      if (asset == undefined) {
        console.warn("Could not convert img to asset", { pin: pinTd.text() });
        continue;
      }

      if (asset.filename.includes("Skin")) {
        skinAsset = asset;
      }

      if (skinAsset == undefined) {
        continue;
      }

      const emote = pinTd.find("p").first().text();
      const rarity = pinTd.find("i").first().text();

      if (emote == undefined || rarity == undefined) {
        console.warn("Could not find emote or rarity", { pin: pinTd.text() });
        continue;
      }

      if (asset.filename.includes("Pin")) {
        pins.push({
          skin: skinAsset,
          pin: {
            asset,
            rarity,
            emote,
          },
        });
      }
    }

    return pins;
  }

  private parseSprays(
    $: cheerio.CheerioAPI
  ): { skinName: string; spray: Spray }[] {
    const spraysTable = this.findFirstTableInSection($, "Sprays");

    if (spraysTable == undefined) {
      return [];
    }

    const sprays: { skinName: string; spray: Spray }[] = [];
    for (const spray of spraysTable.find("td")) {
      const sprayTd = $(spray);

      if (sprayTd.children().length == 0) {
        continue;
      }

      const img = sprayTd.find("img").first();
      const name = sprayTd.find("p").first().text();
      const rarity = sprayTd.find("i").first().text();

      const asset = this.parseImgAsAsset(img);
      if (asset == undefined) {
        console.warn("Could not convert img to asset", {
          spray: sprayTd.text(),
        });
        continue;
      }

      if (name == undefined && rarity == undefined) {
        console.warn("Could not find name and rarity", {
          spray: sprayTd.text(),
        });
        continue;
      }

      sprays.push({
        skinName: name,
        spray: {
          asset,
          rarity,
        },
      });
    }

    return sprays;
  }

  private parseProfileIcons(
    $: cheerio.CheerioAPI
  ): { skinName: string; profileIcon: Asset }[] {
    const iconsTable = this.findFirstTableInSection($, "Profile Icons");

    if (iconsTable == undefined) {
      return [];
    }

    const profileIcons: { skinName: string; profileIcon: Asset }[] = [];
    for (const profileIcon of iconsTable.find("td")) {
      const profileIconTd = $(profileIcon);

      if (profileIconTd.children().length == 0) {
        continue;
      }

      const img = profileIconTd.find("img").first();
      const name = profileIconTd.text().trim();

      const asset = this.parseImgAsAsset(img);
      if (asset == undefined) {
        console.warn("Could not convert img to asset", {
          profileIcon: profileIconTd.text(),
        });
        continue;
      }

      if (name == undefined) {
        console.warn("Could not find name", {
          profileIcon: profileIconTd.text(),
        });
        continue;
      }

      profileIcons.push({
        skinName: name,
        profileIcon: asset,
      });
    }

    return profileIcons;
  }

  private parseSkins(
    brawlerName: string,
    brawlerPage: any,
    $: cheerio.CheerioAPI
  ): Pick<FandomBrawlerData, "skins"> {
    const skinTemplates: any[] = brawlerPage
      .templates("skin gallery")
      .map((t: any) => t.json());

    const popMatching = <T>(arr: T[], predicate: (t: T) => boolean): T[] => {
      const result: T[] = [];
      for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
          result.push(arr[i]);
          arr.splice(i, 1);
          i--;
        }
      }
      return result;
    };

    const pins = this.parsePins($);
    const popPinsFor = (skin: Asset) =>
      popMatching(pins, (p) => p.skin.filename == skin.filename).map(
        (p) => p.pin
      );

    const voicelines = this.parseVoicelines(brawlerPage, $);
    const popVoicelinesFor = (skinName: string) =>
      popMatching(voicelines, (v) => v.skinName == skinName).map(
        (v) => v.voiceline
      );

    const matchSkinName =
      (expectedSkinName: string) =>
      ({ skinName: actualSkinName }: { skinName: string }) => {
        if (expectedSkinName == actualSkinName) {
          return true;
        }

        const cleanedActualSkinName = actualSkinName
          .replace(brawlerName, "")
          .trim();

        if (expectedSkinName == "Default") {
          return (
            actualSkinName == brawlerName ||
            cleanedActualSkinName == "Hypercharge" ||
            cleanedActualSkinName == "Mastery"
          );
        }

        return expectedSkinName == cleanedActualSkinName;
      };

    const sprays = this.parseSprays($);
    const popSpraysFor = (skinName: string) =>
      popMatching(sprays, matchSkinName(skinName)).map((s) => s.spray);

    const profileIcons = this.parseProfileIcons($);
    const popProfileIconsFor = (skinName: string) =>
      popMatching(profileIcons, matchSkinName(skinName)).map(
        (i) => i.profileIcon
      );

    const skinData: Skin[] = [];
    for (let i = 0; i < skinTemplates.length; i++) {
      const template = skinTemplates[i];

      const addSkin = (
        skin: Omit<
          Skin,
          | "asset"
          | "petSkins"
          | "pins"
          | "voicelines"
          | "sprays"
          | "profileIcons"
        >
      ) => {
        const asset = this.findAssetByAttr(
          $,
          brawlerName +
            (template.for ? " " + template.for : " Skin") +
            "-" +
            skin.name +
            ".png",
          "title"
        );

        if (asset == undefined) {
          return;
        }

        if (template.for == undefined) {
          skinData.push({
            ...skin,
            asset,
            petSkins: [],
            pins: popPinsFor(asset),
            voicelines: popVoicelinesFor(skin.name),
            sprays: popSpraysFor(skin.name),
            profileIcons: popProfileIconsFor(skin.name),
          });
        } else {
          const correspondingSkin = skinData.find((s) => s.name == skin.name);
          if (correspondingSkin == undefined) {
            return;
          }

          correspondingSkin.petSkins.push({
            for: template.for,
            asset,
          });
        }
      };

      addSkin({
        name: "Default",
        rarity: undefined,
        campaign: undefined,
        cost: undefined,
        exclusive: false,
        seasonal: false,
      });

      const enumeratedKeys = this.parseEnumeratedKeys(template);
      for (let j = 0; j < enumeratedKeys.length; j++) {
        const e = enumeratedKeys[j];

        addSkin({
          name: e.name.join(", "),
          rarity: e.rarity ? e.rarity.join(", ") : undefined,
          campaign: e.campaign?.join(", "),
          cost: e.cost
            ? e.cost.join(", ").replaceAll(" • E", "").replaceAll(" • S", "")
            : undefined,
          exclusive: e.cost?.some((c: string) => c.endsWith(" • E")) ?? false,
          seasonal: e.cost?.some((c: string) => c.endsWith(" • S")) ?? false,
        });
      }

      if (template.trueskins) {
        addSkin({
          name: "True Silver",
          rarity: undefined,
          campaign: undefined,
          cost: "10000 Coins",
          exclusive: false,
          seasonal: false,
        });

        addSkin({
          name: "True Gold",
          rarity: undefined,
          campaign: undefined,
          cost: "25000 Coins",
          exclusive: false,
          seasonal: false,
        });
      }
    }

    if (pins.length > 0) {
      console.warn("Could not match all pins to skins", pins);
    }

    if (voicelines.length > 0) {
      console.warn("Could not match all voicelines to skins", voicelines);
    }

    if (sprays.length > 0) {
      console.warn("Could not match all sprays to skins", sprays);
    }

    if (profileIcons.length > 0) {
      console.warn("Could not match all profile icons to skins", profileIcons);
    }

    return {
      skins: skinData,
    };
  }

  private parseBalanceHistory(brawlerPage: any): Pick<FandomBrawlerData, "history"> {
    const balanceHistory = brawlerPage
      .section("History")
      .list(0)
      .lines()
      .map((l: any) => l.text()) as string[];

    let date: Date | undefined = undefined;
    const history: BalanceHistoryEntry[] = [];
    for (const line of balanceHistory) {
      if (line.endsWith(":")) {
        const groups = line.match(/^(\d{2})\/(\d{2})\/(\d{2}):$/);
        if (groups == null) {
          console.warn("Could not parse date", line);
          continue;
        }
        date = new Date(Date.parse(`20${groups[3]}-${groups[2]}-${groups[1]}`));
      }
      if (date != undefined && line.startsWith("{") && line.endsWith("}")) {
        const data = JSON.parse(line);
        history.push({
          kind: data.kind,
          date,
          description: data.description,
        });
      }
    }

    return {
      history,
    };
  }

  private async getBrawlers() {
    const data = await this.$klicker.query({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
      },
      sortId: 'picks',
    })

    return data.data.map(b => b.dimensionsRaw.brawler.brawler)
  }

  private async getAccessories(singular: string): Promise<KlickerAccessory[]> {
    const data = await this.$klicker.query({
      cubeId: 'battle',
      dimensionsIds: ['brawler', singular],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
        [singular + 'IdNeq']: ['0'],
      },
      sortId: 'picks',
    })

    return data.data.map(a => ({
      brawler: a.dimensionsRaw.brawler.brawler,
      name: a.dimensionsRaw[singular][singular + 'Name'],
      id: a.dimensionsRaw[singular][singular],
    }))
  }

  private parseBrawlerName(
    brawlerName: string,
    brawlers: string[],
  ): Pick<FandomBrawlerData, "brawlstarsId"> {
    const brawler = brawlers.find(b => this.compareName(brawlerName, b));

    if (brawler) {
      return {
        brawlstarsId: brawler,
      }
    }

    console.warn("Could not find a Brawler with a matching name in the database", brawlerName);
    return {
      brawlstarsId: undefined,
    }
  }

  private compareName(fandomName: string, klickerName: string): boolean {
    const filter = (str: string) => str.replace(/[^A-Z]/g, '');
    return filter(klickerName.toUpperCase()) === filter(fandomName.toUpperCase());
  }

  async getBrawlerKlickerData(): Promise<KlickerData> {
    const brawlers = await this.getBrawlers();
    const starpowers = await this.getAccessories('starpower');
    const gadgets = await this.getAccessories('gadget');

    return {
      brawlers,
      starpowers,
      gadgets,
    }
  }

  async getBrawlerData(
    brawlerName: string,
    klickerData: KlickerData,
  ): Promise<FandomBrawlerData | undefined> {
    const brawlerPage: any = await wtf.fetch(brawlerName, wtfOpts);
    const url = brawlerPage.url().replace("//en.", "//");
    const $ = await cheerio.fromURL(url);

    if (brawlerPage == null) {
      // does not exist
      return undefined;
    }

    return {
      attribution: url,
      ...this.parseBrawlerName(brawlerName, klickerData.brawlers),
      ...this.parseDescriptions(brawlerPage),
      ...this.parseAttack(brawlerPage, $),
      ...this.parseSuper(brawlerPage, $),
      ...this.parseHypercharge(brawlerPage, $),
      ...this.parseHealthByLevel(brawlerPage),
      ...this.parseStats(brawlerPage),
      ...this.parseTips(brawlerPage),
      ...this.parseDefaultSkin(brawlerName, $),
      ...this.parseAvatar(brawlerName, $),
      ...this.parseSkins(brawlerName, brawlerPage, $),
      ...this.parseBalanceHistory(brawlerPage),
      ...this.parseGadgets(brawlerName, brawlerPage, $, klickerData.gadgets),
      ...this.parseStarpowers(brawlerName, brawlerPage, $, klickerData.starpowers),
    };
  }
}
