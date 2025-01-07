import Handlebars from "handlebars";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { Player } from "~/model/Api";
import { calculateAccountRating, xpToHours } from "../../lib/util";
import { PlayerTotals } from "~/stores/brawlstars";
import { fetch, Agent } from "undici";

export default class ProfileView {
  private template: any;
  private cacheDir: string;
  private agent: Agent;

  constructor() {
    this.cacheDir = fsSync.mkdtempSync(path.join(os.tmpdir(), 'brawltime-profile-view-'));

    process.on('beforeExit', () => {
      fsSync.rmSync(this.cacheDir, { recursive: true, force: true });
    });

    this.agent = new Agent({
      bodyTimeout: 30000,
      headersTimeout: 30000,
    })
  }

  private async compileTemplate() {
    if (this.template == undefined) {
      const source = await import("../templates/profile.handlebars?raw");
      this.template = Handlebars.compile(source.default);
    }
  }

  private async readIcon(name: string): Promise<string> {
    const filePath = new URL(`../../assets/images/icon/${name}`, import.meta.url).pathname
    return this.readImageAsDataURI(filePath);
  }

  private urlToFilename(url: string): string {
    const ext = path.extname(new URL(url).pathname).split('.').pop();
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `${hash}.${ext}`;
  }

  private async readImageAsDataURI(imagePath: string): Promise<string> {
    const filetype = path.extname(imagePath) == '.png' ? 'png' : 'jpeg';
    return `data:image/${filetype};base64,${
      await fs.readFile(imagePath, { encoding: "base64" })
    }`;
  }

  private async readRemote(u: string | undefined): Promise<string> {
    if (u == undefined) {
      // transparent 1x1
      return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    }

    const cacheFilePath = path.join(this.cacheDir, this.urlToFilename(u))
    if (fsSync.existsSync(cacheFilePath)) {
      const stats = await fs.stat(cacheFilePath);

      // expire after 24h
      if (Date.now() < stats.mtimeMs + 24 * 60 * 60 * 1000) {
        return this.readImageAsDataURI(cacheFilePath);
      }
    }

    const res = await fetch(u, { dispatcher: this.agent });
    const buffer = Buffer.from(await res.arrayBuffer());
    const filetype = path.extname(new URL(u).pathname) == '.png' ? 'png' : 'jpeg';
    const data = `data:image/${filetype};base64,${buffer.toString("base64")}`;
    fs.writeFile(cacheFilePath, buffer);
    return data;
  }

  async render(
    player: Player,
    playerTotals: PlayerTotals | undefined,
    brawlersCount: number,
    brawlerId: string | 'best',
    backgroundFilename: string,
    mediaUrl: string,
  ): Promise<string> {
    await this.compileTemplate();

    if (brawlerId == 'best') {
      brawlerId = Object.entries(player.brawlers)
        .sort(([id1, b1], [id2, b2]) => b2.trophies - b1.trophies)[0][0]
    }

    const brawler = player.brawlers[brawlerId];

    const headers = [
      {
        image: await this.readRemote(`${mediaUrl}/brawlers/${brawlerId}/avatar.png?size=160`),
        title: player.name,
        subtitle: player.tag,
        color: player.nameColor,
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

    const accountRating = calculateAccountRating(player, brawlersCount);

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
        image: await this.readIcon("gear_icon.png"),
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
