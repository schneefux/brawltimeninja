// @ts-ignore
import wtf from "wtf_wikipedia";
// @ts-ignore
import wtfPluginApi from "wtf-plugin-api";
import { Cache } from "~/lib/cache";
import { brawlerId } from "~/lib/util";
import * as cheerio from "cheerio";

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

export interface Pin {
  asset: Asset;
  rarity: string; // "Free" | "Common" | "Rare" | "Epic" | "Exclusive";
  emote: string; // "Happy" | "Sad" | "Angry" | "GG" | "Clap" | "Thanks" | "Phew" | "Special" | "Facepalm" | "Hypercharge";
}

export interface Spray {
  asset: Asset;
  rarity: string;
}

export interface PetSkin {
  for: string;
  asset: Asset;
}

export interface Skin {
  name: string;
  cost?: string;
  campaign?: string;
  rarity?: string;
  exclusive?: boolean;
  seasonal?: boolean;
  asset: Asset;
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
    list: number[];
  }[];
}

export interface Attack extends DescribeAble, StatsAble, StatsByLevelAble {}

export interface Super extends DescribeAble, StatsAble, StatsByLevelAble {}

export interface Hypercharge extends DescribeAble, StatsAble {}

export interface FandomBrawlerData {
  attribution: string;
  shortDescription: string;
  fullDescription: string;
  trait: string | undefined;
  attack: Attack;
  super: Super;
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
  /*
  gadgets: ScrapedAccessory[]
  starpowers: ScrapedAccessory[]
  */
  // videos
  // … translations via GPT-4o
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

  private parseDescriptions(brawlerPage: any, $: cheerio.CheerioAPI) {
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

  private parseHealthByLevel(brawlerPage: any) {
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

  private parseAttack(brawlerPage: any, $: cheerio.CheerioAPI) {
    const attackSection = brawlerPage
      .sections()
      .find((s: any) => s.title().startsWith("Attack: "));

    const attackName = attackSection?.title().replace("Attack: ", "");
    const attackDescription = this.extractFirstQuote(attackSection?.text());

    if (attackName == undefined || attackDescription == undefined) {
      console.warn("Could not parse attack name or description");
    }

    const attackStats = this.parseInfoboxTable($, "Attack");

    return {
      attack: {
        name: attackName ?? "",
        description: attackDescription ?? "",
        stats: attackStats?.stats ?? [],
        statsByLevel: attackStats?.statsByLevel ?? [],
      },
    };
  }

  private parseSuper(brawlerPage: any, $: cheerio.CheerioAPI) {
    const superSection = brawlerPage
      .sections()
      .find((s: any) => s.title().startsWith("Super: "));

    const superName = superSection?.title().replace("Super: ", "");
    const superDescription = this.extractFirstQuote(superSection?.text());

    if (superName == undefined || superDescription == undefined) {
      console.warn("Could not parse super name or description");
    }

    const superStats = this.parseInfoboxTable($, "Super");

    return {
      super: {
        name: superName ?? "",
        description: superDescription ?? "",
        stats: superStats?.stats ?? [],
        statsByLevel: superStats?.statsByLevel ?? [],
      },
    };
  }

  private parseHypercharge(brawlerPage: any, $: cheerio.CheerioAPI) {
    const hyperchargeSection = brawlerPage
      .sections()
      .find((s: any) => s.title().startsWith("Hypercharge: "));

    if (hyperchargeSection == undefined) {
      return {
        hypercharge: undefined,
      };
    }

    const hyperchargeName = hyperchargeSection
      .title()
      .replace("Hypercharge: ", "");
    const hyperchargeDescription = this.extractFirstQuote(
      hyperchargeSection.text()
    );

    if (hyperchargeName == undefined || hyperchargeDescription == undefined) {
      console.warn("Could not parse hypercharge name or description");
    }

    const hyperchargeStats = this.parseInfoboxTable($, "Hypercharge");

    return {
      hypercharge: {
        name: hyperchargeName ?? "",
        description: hyperchargeDescription ?? "",
        stats: hyperchargeStats?.stats ?? [],
      },
    };
  }

  private parseInfoboxTable($: cheerio.CheerioAPI, sectionName: string) {
    const brawlerInfobox = $(".portable-infobox");
    const infoboxSection = brawlerInfobox
      .find("h2")
      .filter((i, el) => $(el).text() == sectionName)
      .first()
      .parent();

    if (infoboxSection.length == 0) {
      console.warn("Could not find infobox section", { sectionName });
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

    const statsByLevel = names
      .map((name, columnIndex) => ({
        name,
        list: values
          .filter((v) => v.columnIndex == columnIndex)
          .map((v) => v.value),
      }))
      .filter((s) => s.name != "Level");

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
        .flatMap((s: any) => s.list(0).lines())
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
              .find((src) => src.includes(data.file.replaceAll(" ", "_")));

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
    attr: "title" | "alt"
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

  private parseDefaultSkin(brawlerName: string, $: cheerio.CheerioAPI) {
    return {
      model: this.findAssetByAttr($, `${brawlerName} Skin-Default`, "alt")!,
    };
  }

  private parseAvatar(brawlerName: string, $: cheerio.CheerioAPI) {
    return {
      avatar: this.findAssetByAttr($, `${brawlerName} Portrait`, "alt")!,
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
  ) {
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

  private parseBalanceHistory(brawlerPage: any) {
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

  async getBrawlerData(
    brawlerName: string
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
      ...this.parseDescriptions(brawlerPage, $),
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
    };
  }
}
