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
}

export interface FandomBrawlerData {
  attribution: string;
  shortDescription: string;
  fullDescription: string;
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
  attack: ScrapedAttack
  super: ScrapedAttack
  */
  // sprays
  // icons
  // videos
  // trait
  // hypercharge
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
    return JSON.stringify({
      kind: data.list[0],
      description: data.list[1],
    });
  };

  /*
  templates["skin gallery"] = (tmpl: any, list: any, parse: any) => {
    const data = parse(tmpl);
    console.log({ data });
    return "skins";
  };
  */
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

  private parseDescriptions(brawlerPage: any) {
    const description: string = brawlerPage.section("").text();
    const shortDescription: string = description
      .split("\n")[0]
      .replaceAll('"', "");
    const fullDescription: string = description
      .split("\n")
      .slice(1)
      .join("\n")
      .trim();

    return { shortDescription, fullDescription };
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

    return rows
  }

  private parseImageUrlByAlt(
    $: cheerio.CheerioAPI,
    alt: string[],
    title?: string[]
  ): Asset | undefined {
    const modelEl = $("#content img")
      .filter(
        (i, el) =>
          alt.every((word) => ($(el).attr("alt") ?? "").includes(word)) &&
          (title ?? []).every((word) =>
            ($(el).attr("title") ?? "").includes(word)
          )
      )
      .first();

    if (modelEl == undefined) {
      return undefined;
    }

    const src = modelEl?.attr("data-src") ?? modelEl.attr("src");
    const sourceUrl = src?.split("/smart")[0]?.split("/scale")[0]; // remove resizing parameters

    const filename = modelEl.attr("data-image-name");

    if (sourceUrl == undefined || filename == undefined) {
      return undefined;
    }

    return {
      filename,
      sourceUrl,
    };
  }

  private parseDefaultSkin($: cheerio.CheerioAPI) {
    return {
      model: this.parseImageUrlByAlt($, ["Default", "Skin"])!,
    };
  }

  private parseAvatar($: cheerio.CheerioAPI) {
    return {
      avatar: this.parseImageUrlByAlt($, ["Portrait"])!,
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
    const pinsTable = $("h3")
      .filter((i, el) => $(el).text() == "Pins")
      .next("table");

    if (pinsTable == undefined) {
      return [];
    }

    let skinAsset: Asset | undefined = undefined;
    const pins: { skin: Asset; pin: Pin }[] = [];
    for (const pin of pinsTable.find("td")) {
      const pinTd = $(pin);
      const img = pinTd.find("img").first();

      const alt = img.attr("alt");
      if (alt == undefined) {
        continue;
      }

      const asset = this.parseImageUrlByAlt($, [alt]);
      if (asset == undefined) {
        continue;
      }

      if (asset.filename.includes("Skin")) {
        skinAsset = asset;
      }

      const emote = pinTd.find("p").first().text();
      const rarity = pinTd.find("i").first().text();

      if (
        skinAsset != undefined &&
        emote != undefined &&
        rarity != undefined &&
        asset.filename.includes("Pin")
      ) {
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

  private parseSkins(brawlerPage: any, $: cheerio.CheerioAPI) {
    const skinTemplates: any[] = brawlerPage
      .templates("skin gallery")
      .map((t: any) => t.json());

    const pins = this.parsePins($);
    const pinsFor = (skin: Asset) =>
      pins.filter((p) => p.skin.filename == skin.filename).map((p) => p.pin);

    const voicelines = this.parseVoicelines(brawlerPage, $);
    const voicelinesFor = (skinName: string) =>
      voicelines.filter((v) => v.skinName == skinName).map((v) => v.voiceline);

    const skinData: Skin[] = [];
    for (let i = 0; i < skinTemplates.length; i++) {
      const template = skinTemplates[i];

      const addSkin = (skin: Omit<Skin, "asset" | "petSkins" | "pins" | "voicelines">) => {
        const asset = this.parseImageUrlByAlt(
          $,
          [skin.name],
          [...(template.for ? [template.for] : [])]
        );

        if (asset == undefined) {
          return;
        }

        if (template.for == undefined) {
          skinData.push({
            ...skin,
            asset,
            petSkins: [],
            pins: pinsFor(asset),
            voicelines: voicelinesFor(skin.name),
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
          campaign: e.campaign.join(", "),
          cost: e.cost
            ? e.cost.join(", ").replaceAll(" • E", "").replaceAll(" • S", "")
            : undefined,
          exclusive: e.cost?.some((c: string) => c.endsWith(" • E")) ?? false,
          seasonal: e.cost?.some((c: string) => c.endsWith(" • S")) ?? false,
        });
      }

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
          continue
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
      ...this.parseDescriptions(brawlerPage),
      ...this.parseHealthByLevel(brawlerPage),
      ...this.parseStats(brawlerPage),
      ...this.parseTips(brawlerPage),
      ...this.parseDefaultSkin($),
      ...this.parseAvatar($),
      ...this.parseSkins(brawlerPage, $),
      ...this.parseBalanceHistory(brawlerPage),
    };
  }
}
