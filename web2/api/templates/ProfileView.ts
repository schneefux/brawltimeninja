import Handlebars from "handlebars";
import fs from "fs/promises";
import url from "url";
import path from "path";
import { fetch } from "undici";
import { Player } from "@/model/Api";
import { root } from "../../server/root.js";

export default class ProfileView {
  private template: any;
  private cache: Map<string, string> = new Map();

  private async compileTemplate() {
    if (this.template == undefined) {
      const source = await fs.readFile(
        path.join(root, "api/templates/profile.handlebars"),
        "utf-8"
      );
      this.template = Handlebars.compile(source);
    }
  }

  private async readLocal(p: string): Promise<string> {
    if (this.cache.has(p)) {
      return this.cache.get(p)!;
    }

    const filetype = path.extname(p) == '.png' ? 'png' : 'jpeg';
    const data =
      `data:image/${filetype};base64,` +
      (await fs.readFile(path.join(root, p), { encoding: "base64" }));
    this.cache.set(p, data);
    return data;
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
        color: player.nameColor.replace("0x", "#"),
      },
      ...(player.club?.tag != undefined
        ? [
            {
              image: await this.readLocal("./assets/images/icon/club.png"),
              title: player.club.name,
              subtitle: player.club.tag,
            },
          ]
        : []),
    ];

    const stats = [
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_trophy_medium.png"
        ),
        value: player.trophies,
      },
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_leaderboards.png"
        ),
        value: player.highestTrophies,
      },
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_player_level.png"
        ),
        value: player.expLevel,
      },
      {
        image: await this.readLocal("./assets/images/icon/icon_3v3.png"),
        value: player["3vs3Victories"],
      },
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_solo_showdown.png"
        ),
        value: player.soloVictories,
      },
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_duo_showdown.png"
        ),
        value: player.duoVictories,
      },
      {
        image: await this.readLocal("./assets/images/icon/icon_brawlers.png"),
        value: Object.values(player.brawlers).length,
      },
      {
        image: await this.readLocal("./assets/images/icon/scrap_pile.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.gears.length,
          0
        ),
      },
      {
        image: await this.readLocal("./assets/images/icon/SP_base@4x.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.starPowers.length,
          0
        ),
      },
      {
        image: await this.readLocal("./assets/images/icon/Gadget.png"),
        value: Object.values(player.brawlers).reduce(
          (count, brawler) => count + brawler.gadgets.length,
          0
        ),
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
        image: await this.readLocal(
          "./assets/images/icon/icon_trophy_medium.png"
        ),
        value: brawler.trophies,
      },
      {
        image: await this.readLocal(
          "./assets/images/icon/icon_leaderboards.png"
        ),
        value: brawler.highestTrophies,
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
        yOffset: 24 + Math.floor(index / 2) * 74,
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
