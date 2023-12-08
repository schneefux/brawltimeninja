import Handlebars from "handlebars";
import fs from "fs/promises";
import url from "url";
import path from "path";
import { Player } from "~/model/Api";
import { calculateAccountRating, totalBrawlers, xpToHours } from "../../lib/util";
import { PlayerTotals } from "~/stores/brawlstars";

export default class ProfileView {
  private template: any;
  private cache: Map<string, string> = new Map();

  private async compileTemplate() {
    if (this.template == undefined) {
      const source = await import("../templates/profile.handlebars?raw");
      this.template = Handlebars.compile(source.default);
    }
  }

  private async readIcon(name: string): Promise<string> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    const filePath = new URL(`../../assets/images/icon/${name}`, import.meta.url).pathname
    const filetype = path.extname(filePath) == '.png' ? 'png' : 'jpeg';
    const data = `data:image/${filetype};base64,${
      await fs.readFile(filePath, { encoding: "base64" })
    }`;
    this.cache.set(name, data);
    return data
  }

  private async readRemote(u: string | undefined): Promise<string> {
    if (u == undefined) {
      // transparent 1x1
      return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    }

    if (this.cache.has(u)) {
      return this.cache.get(u)!;
    }

    const res = await fetch(u);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filetype = path.extname(url.parse(u).pathname!) == '.png' ? 'png' : 'jpeg';
    const data = `data:image/${filetype};base64,${buffer.toString("base64")}`;
    this.cache.set(u, data);
    return data;
  }

  async render(
    player: Player,
    playerTotals: PlayerTotals | undefined,
    brawlerId: string,
    backgroundFilename: string,
    mediaUrl: string,
  ): Promise<string> {
    await this.compileTemplate();

    const brawler = player.brawlers[brawlerId];

    const headers = [
      {
        image: await this.readRemote(`${mediaUrl}/brawlers/${brawlerId}/avatar.png?size=160`),
        title: player.name,
        subtitle: player.tag,
        color: (player.nameColor || '0x00000000').replace("0x", "#"),
      },
      ...(player.club?.tag != undefined
        ? [
            {
              image: await this.readIcon("club.png"),
              title: player.club.name,
              subtitle: player.club.tag,
            },
          ]
        : []),
    ];

    const accountRating = calculateAccountRating(player, totalBrawlers);

    // Icons are either Brawl Stars' or icons8 "stickers" style
    const stats = [
      {
        image: await this.readIcon("icons8-story-time-100.png"),
        value: Math.floor(xpToHours(player.expPoints)),
        unit: "Hours",
      },
      {
        image: await this.readIcon("icons8-star-100.png"),
        value: accountRating.rating,
        unit: "Rating",
      },
      ...(playerTotals != undefined ? [
        {
          image: await this.readIcon("icons8-discount-100.png"),
          value: (playerTotals.winRate * 100).toFixed(2),
          unit: "Recent Win Rate",
        },
        {
          image: await this.readIcon("icons8-counter-100.png"),
          value: playerTotals.picks,
          unit: "Battles Tracked",
        },
      ] : []),
      {
        image: await this.readIcon(
          "icon_trophy_medium.png"
        ),
        value: player.trophies,
        unit: "Trophies",
      },
      {
        image: await this.readIcon(
          "icon_leaderboards.png"
        ),
        value: player.highestTrophies,
        unit: "Highest",
      },

      {
        image: await this.readIcon(
          "icon_player_level.png"
        ),
        value: player.expLevel,
        unit: "Level",
      },
      {
        image: await this.readIcon("icon_3v3.png"),
        value: player["3vs3Victories"],
        unit: "Wins",
      },
      {
        image: await this.readIcon(
          "icon_solo_showdown.png"
        ),
        value: player.soloVictories,
        unit: "Wins",
      },
      {
        image: await this.readIcon(
          "icon_duo_showdown.png"
        ),
        value: player.duoVictories,
        unit: "Wins",
      },
      {
        image: await this.readIcon("icon_brawlers.png"),
        value: Object.values(player.brawlers).length,
        unit: "Brawlers",
      },
      {
        image: await this.readIcon("scrap_pile.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.gears.length,
          0
        ),
        unit: "Gears",
      },
      {
        image: await this.readIcon("SP_base@4x.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.starPowers.length,
          0
        ),
        unit: "Star Powers",
      },
      {
        image: await this.readIcon("Gadget.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.gadgets.length,
          0
        ),
        unit: "Gadgets",
      },
    ];

    const accessories = [
      await Promise.all(
        brawler.starPowers.map((sp) => this.readRemote(`${mediaUrl}/starpowers/${sp.id}.png?size=80`))
      ),
      await Promise.all(
        brawler.gadgets.map((g) => this.readRemote(`${mediaUrl}/gadgets/${g.id}.png?size=80`))
      ),
      await Promise.all(
        brawler.gears.map((g) => this.readRemote(`${mediaUrl}/gears/${g.name.toLowerCase()}_${g.level}.png?size=80`))
      ),
    ];

    const brawlerStats = [
      {
        image: await this.readIcon("icon_trophy_medium.png"),
        value: brawler.trophies,
        unit: "Trophies",
      },
      {
        image: await this.readIcon("icon_leaderboards.png"),
        value: brawler.highestTrophies,
        unit: "Highest",
      },
    ];

    const brawlerModel = await this.readRemote(`${mediaUrl}/brawlers/${brawlerId}/model.png?size=400`)
    const background = await this.readRemote(`${mediaUrl}/backgrounds/${backgroundFilename}`).catch(() => {
      throw new Error("Invalid background");
    });

    const context = {
      background,
      attribution: 'brawltime.ninja',
      timestamp: new Date().toLocaleDateString(),
      headers: headers.map((h, index) => ({
        ...h,
        yOffset: index * 90,
        color: h.color ?? "white",
      })),
      stats: stats.map((s, index) => ({
        ...s,
        xOffset: 20 + (index % 2) * 240,
        yOffset: playerTotals == undefined ? 18 + Math.floor(index / 2) * 62 : 10 + Math.floor(index / 2) * 54,
      })),
      brawlerStats: brawlerStats.map((s, index) => ({
        ...s,
        xOffset: 20 + (index % 2) * 240,
        yOffset: 8 + Math.floor(index / 2) * 74,
      })),
      accessories: accessories.flatMap((as, rowIndex) =>
        as.map((a, columnIndex) => ({
          x: columnIndex * 56,
          y: 80 + 64 * rowIndex,
          image: a,
        }))
      ),
      brawlerModel,
    };

    return this.template(context);
  }
}
