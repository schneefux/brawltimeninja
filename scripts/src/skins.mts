import wtf from "wtf_wikipedia";
import wtfPluginApi from "wtf-plugin-api";
wtf.extend(wtfPluginApi);
import {
  brawlerId,
  getAllLinks,
  getMatchingStaticURL,
  getSectionWithSubSections,
  mapTemplateToArrayOfObjects,
  sanitize,
} from "./util.mts";
import { pathToFileURL } from "url";

const DOMAIN = "brawlstars.fandom.com";

export async function scrapeSkins(brawlerName: string): Promise<
  {
    name: string;
    rarity: string | undefined;
    campaign: string | undefined;
    cost: string | undefined;
    for: string | undefined;
    link: string;
    path: string;
  }[]
> {
  const wtfBrawler: any = await wtf.fetch(brawlerName, { domain: DOMAIN });

  const skinSections = getSectionWithSubSections(wtfBrawler, (title) =>
    title.startsWith("Skins")
  );
  const skinTemplates = skinSections
    .map((section) =>
      section.templates().find((t) => t.json().template == "skin gallery")
    )
    .filter((t) => t != undefined);
  const skinData: {
    name: string;
    rarity: string | undefined;
    campaign: string | undefined;
    cost: string | undefined;
    for: string | undefined; // 'Minion'
  }[] = ([] as any[]).concat(
    ...skinTemplates.map((template) => [
      {
        name: "Default",
        rarity: undefined,
        campaign: undefined,
        cost: undefined,
        for: template.json().for,
      },
    ]),
    ...skinTemplates.map((template) =>
      mapTemplateToArrayOfObjects(template.json(), [
        "name",
        "rarity",
        "campaign",
        "cost",
      ]).map((e) => ({
        ...e,
        for: template.json().for,
      }))
    ),
    ...skinTemplates.map((template) =>
      template.json().trueskins == "yes"
        ? [
            {
              name: "True Silver",
              rarity: undefined,
              campaign: undefined,
              cost: "10000 Coins",
              for: template.json().for,
            },
            {
              name: "True Gold",
              rarity: undefined,
              campaign: undefined,
              cost: "25000 Coins",
              for: template.json().for,
            },
          ]
        : []
    )
  );

  const brawlerUrl: string = wtfBrawler.url().replace("//en.", "//");
  const brawlerHtml = await fetch(brawlerUrl).then((response) =>
    response.text()
  );
  const brawlerDocLinks = getAllLinks(brawlerHtml);
  return skinData
    .map((skin) => {
      const skinType = skin.for ?? "Skin";
      const link = getMatchingStaticURL(brawlerDocLinks, [
        brawlerName,
        skinType,
        skin.name,
      ]);

      if (link == undefined) {
        console.warn("Could not find skin link", brawlerName, skin);
        return undefined;
      }

      const path = `/brawlers/${brawlerId(brawlerName)}/skins/${sanitize(
        skinType
      )}/${sanitize(skin.name)}.png`;

      return {
        ...skin,
        link,
        path,
      };
    })
    .filter(
      (skin): skin is Exclude<typeof skin, undefined> => skin != undefined
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const brawlerName = process.argv[2];
  console.log(await scrapeSkins(brawlerName));
}
