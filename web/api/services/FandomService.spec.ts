import { expect, test } from "vitest";
import FandomService, {
  Accessory,
  Asset,
  Attack,
  BalanceHistoryEntry,
  Hypercharge,
  Skin,
  Spray,
  Voiceline,
} from "./FandomService";
import { MockAgent, setGlobalDispatcher } from "undici";

import fandomEdgarJson from "./fixtures/fandom-Edgar.json";
import fandomEdgarHtml from "./fixtures/fandom-Edgar.html?raw";
import fandomEdgarRuHtml from "./fixtures/fandom-ru-Edgar.html?raw";
import fandomShellyJson from "./fixtures/fandom-Shelly.json";
import fandomShellyHtml from "./fixtures/fandom-Shelly.html?raw";
import fandomShellyRuHtml from "./fixtures/fandom-ru-Shelly.html?raw";
import fandomNitaJson from "./fixtures/fandom-Nita.json";
import fandomNitaHtml from "./fixtures/fandom-Nita.html?raw";
import fandomNitaRuHtml from "./fixtures/fandom-ru-Nita.html?raw";
import fandomShadeJson from "./fixtures/fandom-Shade.json";
import fandomShadeHtml from "./fixtures/fandom-Shade.html?raw";
import fandomShadeRuHtml from "./fixtures/fandom-ru-Shade.html?raw";
import fandomBonnieJson from "./fixtures/fandom-Bonnie.json";
import fandomBonnieHtml from "./fixtures/fandom-Bonnie.html?raw";
import fandomBonnieRuHtml from "./fixtures/fandom-ru-Bonnie.html?raw";
import fandomGemgrabJson from "./fixtures/fandom-gemgrab.json";
import fandomGemgrabHtml from "./fixtures/fandom-gemgrab.html?raw";
import cubeBrawlersJson from "./fixtures/cube-brawlers.json?raw";
import cubeStarpowersJson from "./fixtures/cube-starpowers.json?raw";
import cubeGadgetsJson from "./fixtures/cube-gadgets.json?raw";
import AuthService from "./AuthService";
import { BrawltimeKlickerService } from "~/plugins/klicker.service";
import customFetch from "~/lib/fetch";

const mockAgent = new MockAgent({ connections: 1 });
mockAgent.disableNetConnect();
setGlobalDispatcher(mockAgent);

mockAgent.get("http://cube.test")
  .intercept({
    path: /.*/,
  })
  .reply<any>((req) => {
    if (req.path.includes("map.brawler_dimension")) {
      return {
        statusCode: 200,
        data: cubeBrawlersJson,
      }
    }

    if (req.path.includes("battle.starpower_dimension")) {
      return {
        statusCode: 200,
        data: cubeStarpowersJson,
      }
    }

    if (req.path.includes("battle.gadget_dimension")) {
      return {
        statusCode: 200,
        data: cubeGadgetsJson,
      }
    }

    console.warn("Unhandled cube request", req.path);

    return {
      statusCode: 500,
    }
  })
  .persist();

const authService = new AuthService();
const klickerService = new BrawltimeKlickerService(
  'http://cube.test',
  () => authService.getToken(),
  (url, input) => customFetch(url as string, {
    ...input as any,
    agent: mockAgent,
  }) as any
)
const fandomService = new FandomService(klickerService);
const klickerData = await fandomService.getBrawlerKlickerData();

test("should parse mode page (Gem Grab)", async () => {
  const mockPoolFandom = mockAgent.get("https://brawlstars.fandom.com");

  mockPoolFandom
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Gem_Grab",
    })
    .reply(200, fandomGemgrabJson);

  mockPoolFandom
    .intercept({
      path: "/wiki/Gem_Grab",
    })
    .reply(200, fandomGemgrabHtml);

  const data = (await fandomService.getModeData("Gem Grab"))!;
  expect(data).toBeDefined();
  expect(data.attribution).toBe("https://brawlstars.fandom.com/wiki/Gem_Grab");
  expect(data.shortDescription).toBe(
    "Collect Gems that pop out of the Gem Mine in the middle of the map. Or, just take them from fallen opponents! Hold ten gems for the duration of a countdown to win the game!"
  );
  expect(data.fullDescription).toBe(
    `In the Gem Grab Event, there are two teams consisting of three players each. In the middle of the arena, there is a gem mine that produces purple Gems every 7 seconds. The objective of the game mode is for your team to obtain 10 Gems. When a player is defeated, they will drop all of the Gems that they have picked up. Once a team has 10 Gems, a countdown will appear on screen which lasts 15 seconds. If the counter reaches 0, the team that activated the countdown will win. The countdown will stop and reset if a Brawler is defeated and drops enough Gems for their team to drop below 10, or if the other team accumulates the same amount of Gems. If both teams have more than 10 Gems and the same number of Gems, the countdown will not start until one team has more Gems than the other.

There can never be more than 29 Gems in play at once (unless the Angry Robo Modifier is active). When the 29th Gem is spawned, a 30-second countdown will begin. Once this timer expires, the game will end, and the team holding the most Gems will win. When 15 Gems are lying on the map, the mine will not produce any more Gems until a Brawler picks one up.

Gem Grab 5v5 has two teams consisting of five players each. There are one or two gem mines, and the objective of the game mode is for your team to obtain 20 Gems. There can never be more than 39 Gems in play at once. When the 39th Gem is spawned, a 30-second countdown will begin. Once this timer expires, the game will end, and the team holding the most Gems will win. When 20 Gems are lying on the map, the mine will not produce any more Gems until a Brawler picks one up.`
  );
  expect(data.tips.length).toBeGreaterThan(5);
  expect(data.tips[0]).toBe(
    "Controlling the area around the gem mine is important early in the game. Keep enemy Brawlers away while your team collects the Gems as they appear."
  );
  expect(Object.keys(data.brawlerTips).length).toBeGreaterThan(5);
  const nitaTip = data.brawlerTips.find((tip) => tip.brawlerId == "nita")!;
  expect(nitaTip).toBeDefined();
  expect(nitaTip.description).toBe(
    `With her relatively high health and area damage, Nita is an excellent counter to groups of enemies collecting Gems. In addition, Bruce can not only track down enemies that are hiding in bushes and force them to move away, but can also be used to protect the Gem carrier, as well as hinder enemies from collecting the Gems if the Gem carrier gets taken out. Nita can also use her Bear Paws stun gadget to immobilize the enemy team. In close scenarios, Bruce can act as a shield, tanking enough damage long enough for Nita's team to escape.`
  );
  expect(data.history.length).toBeGreaterThan(5);
  expect(data.history[0].date.toISOString()).toBe("2017-12-18T00:00:00.000Z");
  expect(data.history[0].description).toBe(
    "Star Player is now less likely to be awarded to players who dropped a lot of Gems."
  );
});

test("should parse Brawler page (Edgar)", async () => {
  const mockPool = mockAgent.get("https://brawlstars.fandom.com");

  mockPool
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Edgar",
    })
    .reply(200, fandomEdgarJson);

  mockPool
    .intercept({
      path: "/wiki/Edgar",
    })
    .reply(200, fandomEdgarHtml);

  mockPool
    .intercept({
      path: "/ru/wiki/Эдгар",
    })
    .reply(200, fandomEdgarRuHtml);

  const data = (await fandomService.getBrawlerData("Edgar", klickerData))!;

  expect(data.brawlstarsId).toBe("EDGAR");
  expect(data.attribution).toBe("https://brawlstars.fandom.com/wiki/Edgar");
  expect(data.shortDescription).toBe(
    `Edgar believes nobody understands him. Certainly not his mom, who thinks he's going through a phase. Only he knows the darkness in his soul is eternal.`
  );
  expect(data.fullDescription).toBe(
    `Edgar is an Epic Brawler who could be unlocked for free as a Brawlidays 2020 gift from December 19th to January 7th or can be unlocked from the Starr Road. He has moderate health, potentially high burst damage and great mobility with his Super and his very fast movement speed, but a short attack range. His Trait allows his Super and Hypercharge to charge itself over time. He attacks with two quick short-ranged punches with an extremely short cooldown and reload speed that also slightly heal him per hit on an enemy Brawler. His Super is a quick jump over obstacles that grants him a speed boost upon landing. His first Gadget, Let's Fly, drastically increases his Trait's Super-charge for a short period of time. His second Gadget, Hardcore, provides him a shield that absorbs damage and decays over time. His first Star Power, Hard Landing, allows his Super to deal moderate damage to enemies in his Super's landing area of effect. His second Star Power, Fisticuffs, increases the amount he heals per punch. His Hypercharge, Outburst, increases his Super charge rate and reload speed after using his Super.`
  );
  expect(data.trait).toBe("This Brawler charges Super over time.");

  expect(data.stats).toEqual({
    rarity: "Epic",
    class: "Assassin",
    movementspeed: `820 (Very Fast), 0–2333 (with Super), 1020 (after Super), 1017 (with Hypercharge), 1217 (after Super with Hypercharge)`,
    voiceactor: "David Autovino",
  });

  expect(data.healthByLevel).toEqual([
    3300, 3630, 3960, 4290, 4620, 4950, 5280, 5610, 5940, 6270, 6600,
  ]);

  expect(data.attack).toEqual({
    name: "Fight Club",
    description:
      "Hits enemies with quick punches from his scarf, healing himself for each landed punch.",
    stats: [
      {
        label: "Range",
        value: "2 (Short)",
      },
      {
        label: "Reload",
        value: "0.7 seconds (Very Fast)\n0.35 seconds (with Hypercharge)",
      },
      {
        label: "Projectiles per attack",
        value: "2",
      },
      {
        label: "Super charge per hit",
        value:
          "8.37%\n9.207% (with Super Charge Gear)\n16.74% (with Hypercharge)\n17.577% (with Super Charge Gear and Hypercharge)",
      },
      {
        label: "Hypercharge charge per hit",
        value: "3.348%\n3.6828% (with Super Charge Gear)",
      },
      {
        label: "Projectile speed",
        value: "3500",
      },
      {
        label: "Attack width",
        value: "2",
      },
    ],
    statsByLevel: [
      {
        name: "Damage per punch",
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        values: [540, 594, 648, 702, 756, 810, 864, 918, 972, 1026, 1080],
      },
      {
        name: "Heal per punch",
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        values: [189, 207, 225, 243, 261, 279, 297, 315, 333, 351, 369],
      },
    ],
  } satisfies Attack);
  expect(data.altAttack).toBeUndefined();

  expect(data.super).toEqual({
    name: "Vault",
    description:
      "Edgar jumps over any obstacle and gets a temporary speed boost. His Super will slowly charge over time.",
    stats: [
      {
        label: "Range",
        value: "6.67 (Normal)",
      },
    ],
    statsByLevel: [],
  } satisfies Attack);
  expect(data.altSuper).toBeUndefined();

  expect(data.hypercharge).toEqual({
    name: "Outburst",
    description:
      "After using Super gain charging speed and reload speed for few seconds.",
    stats: [
      {
        label: "Hypercharge Multiplier",
        value: "40%",
      },
      {
        label: "Speed",
        value: "+24%",
      },
      {
        label: "Damage",
        value: "+15%",
      },
      {
        label: "Shield",
        value: "+15%",
      },
    ],
  } satisfies Hypercharge);

  expect(data.tips.length).toBeGreaterThan(5);
  expect(data.tips[0]).toBe(
    `Edgar is not often recommended in Bounty since long-ranged Brawlers dominate the mode and his short range makes him disadvantageous. If playing him in Bounty, focus on pressuring enemies in the back of the map, and perform hit-and-run attacks using your Super. However, don't play him in open Bounty maps like Purple Paradise as he's more vulnerable to longer-ranged Brawlers.`
  );

  expect(data.skins).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Default",
      }),
    ])
  );
  const defaultSkin = data.skins.find((s) => s.name == "Default")!;
  expect(defaultSkin.voicelines.length).toBeGreaterThan(5);
  expect(defaultSkin.voicelines.length).toBe(35);
  expect(defaultSkin.voicelines).toEqual(
    expect.arrayContaining([
      {
        trigger: "Spawning",
        description: "This is so lame.",
        asset: {
          sourceUrl:
            "https://static.wikia.nocookie.net/brawlstars/images/d/d3/Edgar_start_vo_01.ogg/revision/latest?cb=20201216203133",
          filename: "Edgar start vo 01.ogg",
        },
      },
    ] satisfies Voiceline[])
  );
  expect(defaultSkin.sprays).toEqual([
    {
      rarity: "Common",
      asset: {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/7/7b/Edgar-Spray.png/revision/latest?cb=20220903144124",
        filename: "Edgar-Spray.png",
      },
    },
    {
      rarity: "Exclusive",
      asset: {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/6/69/Edgar_Hypercharge-Spray.png/revision/latest?cb=20231212184440",
        filename: "Edgar Hypercharge-Spray.png",
      },
    },
  ] satisfies Spray[]);

  expect(defaultSkin.profileIcons).toEqual(
    expect.arrayContaining([
      {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/6/64/Edgar1-pfp.png/revision/latest?cb=20220429014048",
        filename: "Edgar1-pfp.png",
      },
      {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/2/20/Edgar_Hypercharge-pfp.png/revision/latest?cb=20231212181544",
        filename: "Edgar Hypercharge-pfp.png",
      },
    ] satisfies Asset[])
  );
  expect(defaultSkin.profileIcons.length).toBe(3);

  expect(data.model).toEqual({
    sourceUrl:
      "https://static.wikia.nocookie.net/brawlstars/images/2/2b/Edgar_Skin-Default.png/revision/latest?cb=20230219113721",
    filename: "Edgar Skin-Default.png",
  });

  expect(data.avatar).toEqual({
    sourceUrl:
      "https://static.wikia.nocookie.net/brawlstars/images/b/b4/Edgar_Portrait.png/revision/latest?cb=20201218104515",
    filename: "Edgar Portrait.png",
  });

  expect(data.skins).toHaveLength(15);

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Nightbringer" })])
  );
  const nightbringerSkin = data.skins.find((s) => s.name == "Nightbringer")!;
  expect(nightbringerSkin).toEqual({
    name: "Nightbringer",
    rarity: "Hypercharge",
    campaign: "Angels vs. Demons",
    cost: "Free from Angelic Drops or Ultra Trophy Boxes",
    exclusive: false,
    seasonal: false,
    asset: {
      sourceUrl:
        "https://static.wikia.nocookie.net/brawlstars/images/f/f2/Edgar_Skin-Nightbringer.png/revision/latest?cb=20241117122248",
      filename: "Edgar Skin-Nightbringer.png",
    },
    pins: [
      {
        asset: {
          sourceUrl:
            "https://static.wikia.nocookie.net/brawlstars/images/d/d2/Edgar_Nightbringer_Pin-Special.png/revision/latest?cb=20241028142135",
          filename: "Edgar Nightbringer Pin-Special.png",
        },
        rarity: "Exclusive",
        emote: "Special",
      },
    ],
    petSkins: [],
    voicelines: [],
    sprays: [],
    profileIcons: [],
  } satisfies Skin);

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "True Gold" })])
  );
  const trueGoldSkin = data.skins.find((s) => s.name == "True Gold")!;
  expect(trueGoldSkin).toEqual({
    name: "True Gold",
    rarity: undefined,
    campaign: undefined,
    cost: "25000 Coins",
    exclusive: false,
    seasonal: false,
    asset: {
      sourceUrl:
        "https://static.wikia.nocookie.net/brawlstars/images/8/83/Edgar_Skin-True_Gold.png/revision/latest?cb=20221225151257",
      filename: "Edgar Skin-True Gold.png",
    },
    pins: expect.arrayContaining([]),
    petSkins: [],
    voicelines: [],
    sprays: [],
    profileIcons: [],
  } satisfies Skin);

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Orochi" })])
  );
  const orochiSkin = data.skins.find((s) => s.name == "Orochi")!;
  expect(orochiSkin).toEqual({
    name: "Orochi",
    rarity: "Epic",
    campaign: "Lunar Brawl",
    cost: "149 Gems",
    exclusive: false,
    seasonal: true,
    asset: {
      sourceUrl:
        "https://static.wikia.nocookie.net/brawlstars/images/e/e4/Edgar_Skin-Orochi.png/revision/latest?cb=20220127002251",
      filename: "Edgar Skin-Orochi.png",
    },
    pins: expect.arrayContaining([]),
    petSkins: [],
    voicelines: [],
    sprays: [],
    profileIcons: expect.arrayContaining([]),
  } satisfies Skin);

  // there is a "Mecha" skin but also a "Mecha (Unit-00)" skin
  // make sure that the img asset matching does not select the latter while searching the former
  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Mecha" })])
  );
  const mechaSkin = data.skins.find((s) => s.name == "Mecha")!;
  expect(mechaSkin.asset).toEqual({
    sourceUrl:
      "https://static.wikia.nocookie.net/brawlstars/images/7/7f/Edgar_Skin-Mecha.png/revision/latest?cb=20231029153551",
    filename: "Edgar Skin-Mecha.png",
  });

  // spray is called "Mecha Edgar" but skin is called "Edgar"
  expect(mechaSkin.sprays).toEqual([
    {
      rarity: "Common",
      asset: {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/3/34/Mecha_Edgar-Spray.png/revision/latest?cb=20230905141225",
        filename: "Mecha Edgar-Spray.png",
      },
    },
  ] satisfies Spray[]);

  // spray is called "Edgar Tata" and skin is called "Edgar Tata"
  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Edgar Tata" })])
  );
  const tataSkin = data.skins.find((s) => s.name == "Edgar Tata")!;
  expect(tataSkin.sprays).toEqual([
    {
      rarity: "Common",
      asset: {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/2/23/Edgar_Tata-Spray.png/revision/latest?cb=20220629091903",
        filename: "Edgar Tata-Spray.png",
      },
    },
  ] satisfies Spray[]);

  expect(data.history).toEqual(
    expect.arrayContaining([
      {
        kind: "Neutral",
        date: new Date("2020-12-19"),
        description:
          "Edgar was added to the game and was available for every user to claim for free until 07/01/21.",
      },
      {
        kind: "Buff",
        date: new Date("2021-01-14"),
        description:
          "Edgar's Let's Fly Gadget Super charge duration was increased to 4 seconds (from 3).",
      },
      {
        kind: "Nerf",
        date: new Date("2021-01-14"),
        description:
          "Edgar's Let's Fly Gadget Super charge speed was decreased to 525% (from 700%).",
      },
    ] satisfies BalanceHistoryEntry[])
  );

  expect(data.gadgets).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Let's Fly" })])
  );
  const letsFlyGadget = data.gadgets.find((g) => g.name == "Let's Fly")!;
  expect(letsFlyGadget).toEqual({
    brawlstarsId: "23000340",
    name: "Let's Fly",
    description: "Edgar's Super charges faster, 525% for 4 seconds.",
    asset: {
      sourceUrl: "https://static.wikia.nocookie.net/brawlstars/images/2/2a/GD-Edgar1.png/revision/latest?cb=20211213120345",
      filename: "GD-Edgar1.png",
    },
    // no stats by level
    statsByLevel: [],
  } satisfies Accessory);

  expect(data.gadgets).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Hardcore" })])
  );
  const hardcoreGadget = data.gadgets.find((g) => g.name == "Hardcore")!;
  expect(hardcoreGadget).toEqual(expect.objectContaining({
    statsByLevel: [{
      name: "Health",
      levels: [7, 8, 9, 10, 11],
      values: [2640, 2805, 2970, 3135, 3300],
    }],
  }) satisfies Pick<Accessory, "statsByLevel">);

  expect(data.starpowers).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Hard Landing" })])
  );
  const hardLandingStarpower = data.starpowers.find((sp) => sp.name == "Hard Landing")!;
  expect(hardLandingStarpower).toEqual({
    brawlstarsId: "23000338",
    name: "Hard Landing",
    description:
      "Edgar's Super will also deal 1350 damage to nearby enemies upon landing.",
    asset: {
      sourceUrl: "https://static.wikia.nocookie.net/brawlstars/images/c/cb/SP-Edgar1.png/revision/latest?cb=20211108011540",
      filename: "SP-Edgar1.png",
    },
    statsByLevel: [{
      name: "Damage",
      levels: [9, 10, 11],
      values: [1215, 1282, 1350],
    }],
  } satisfies Accessory);

  expect(data.conceptArt).not.toHaveLength(1);
  expect(data.conceptArt).toEqual(
    expect.arrayContaining([
      {
        sourceUrl:
          "https://static.wikia.nocookie.net/brawlstars/images/f/fc/%D0%92%D0%BD%D0%B5%D1%88%D0%BD%D0%B8%D0%B9_%D0%B2%D0%B8%D0%B4_%D0%AD%D0%B4%D0%B3%D0%B0%D1%80%D0%B0.jpg/revision/latest?cb=20211204091318&path-prefix=ru",
        filename: "Внешний вид Эдгара.jpg",
      },
    ])
  );
});

test("should parse Brawler voicelines without skin specific voicelines (Shelly)", async () => {
  const mockPool = mockAgent.get("https://brawlstars.fandom.com");

  mockPool
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Shelly",
    })
    .reply(200, fandomShellyJson);

  mockPool
    .intercept({
      path: "/wiki/Shelly",
    })
    .reply(200, fandomShellyHtml);

  mockPool
    .intercept({
      path: "/ru/wiki/Шелли",
    })
    .reply(200, fandomShellyRuHtml);

  const data = (await fandomService.getBrawlerData("Shelly", klickerData))!;

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Default" })])
  );
  const defaultSkin = data.skins.find((s) => s.name == "Default")!;
  expect(defaultSkin.voicelines.length).toBe(26);
  expect(defaultSkin.voicelines).toEqual(
    expect.arrayContaining([
      {
        trigger: "Spawning",
        description: "Let's go!",
        asset: {
          sourceUrl:
            "https://static.wikia.nocookie.net/brawlstars/images/3/3a/Shelly_start_01.ogg/revision/latest?cb=20190803143405",
          filename: "Shelly start 01.ogg",
        },
      },
    ] satisfies Voiceline[])
  );
});

test("should parse Brawler skins including Pet", async () => {
  const mockPool = mockAgent.get("https://brawlstars.fandom.com");

  mockPool
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Nita",
    })
    .reply(200, fandomNitaJson);

  mockPool
    .intercept({
      path: "/wiki/Nita",
    })
    .reply(200, fandomNitaHtml);

  mockPool
    .intercept({
      path: "/ru/wiki/Нита",
    })
    .reply(200, fandomNitaRuHtml);

  const data = (await fandomService.getBrawlerData("Nita", klickerData))!;
  expect(data.trait).toBeUndefined();

  const skinNames = [
    "Default",
    "Panda",
    "Koala",
    "Whale Watch",
    "Red Nose",
    "Reinbear",
    "Shiba",
    "Nian",
    "Rui Shou",
    "Runner",
    "Mechagodzilla",
    "Tusked",
    "True Silver",
    "True Gold",
    "Gummybear",
  ];
  expect(data.skins.map((s) => s.name).sort()).toEqual(skinNames.sort());

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Tusked" })])
  );
  const tuskedSkin = data.skins.find((s) => s.name == "Tusked")!;
  expect(tuskedSkin).toEqual({
    name: "Tusked",
    rarity: "Legendary",
    campaign: "Bizarre Circus",
    cost: "299 Gems",
    exclusive: false,
    seasonal: false,
    asset: {
      sourceUrl:
        "https://static.wikia.nocookie.net/brawlstars/images/9/9d/Nita_Skin-Tusked.png/revision/latest?cb=20231213185144",
      filename: "Nita Skin-Tusked.png",
    },
    pins: expect.arrayContaining([]),
    sprays: expect.arrayContaining([]),
    profileIcons: expect.arrayContaining([]),
    voicelines: expect.arrayContaining([
      {
        trigger: "Spawning",
        description: "Yeah!",
        asset: {
          sourceUrl:
            "https://static.wikia.nocookie.net/brawlstars/images/c/ca/Nita_start_vo_evil_03.ogg/revision/latest?cb=20231026113115",
          filename: "Nita start vo evil 03.ogg",
        },
      },
    ]),
    petSkins: [
      {
        for: "Minion",
        asset: {
          sourceUrl:
            "https://static.wikia.nocookie.net/brawlstars/images/b/bf/Nita_Minion-Tusked.png/revision/latest?cb=20231028002842",
          filename: "Nita Minion-Tusked.png",
        },
      },
    ],
  } satisfies Skin);

  expect(data.skins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "Nian" })])
  );
  const nianSkin = data.skins.find((s) => s.name == "Nian")!;
  expect(nianSkin).toEqual({
    name: "Nian",
    rarity: "Epic",
    campaign: "Ranked, Lunar Brawl", // multiple campaigns, concatenated
    cost: "149 Gems or 5000 Bling",
    exclusive: true,
    seasonal: false,
    asset: {
      sourceUrl:
        "https://static.wikia.nocookie.net/brawlstars/images/0/0a/Nita_Skin-Nian.png/revision/latest?cb=20221222212700",
      filename: "Nita Skin-Nian.png",
    },
    pins: expect.arrayContaining([]),
    petSkins: expect.arrayContaining([]),
    sprays: expect.arrayContaining([]),
    voicelines: [],
    profileIcons: expect.arrayContaining([]),
  } satisfies Skin);
});

test("should parse Brawler with multiple traits", async () => {
  const mockPool = mockAgent.get("https://brawlstars.fandom.com");

  mockPool
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Shade",
    })
    .reply(200, fandomShadeJson);

  mockPool
    .intercept({
      path: "/wiki/Shade",
    })
    .reply(200, fandomShadeHtml);

  mockPool
    .intercept({
      path: "/ru/wiki/Шейд",
    })
    .reply(200, fandomShadeRuHtml);

  const data = (await fandomService.getBrawlerData("Shade", klickerData))!;
  expect(data.trait).toBe(
    "This Brawler charges Super from staying close to opposing enemies.\nThis Brawler can move over water."
  );
  expect(data.hypercharge).toBeUndefined();
});

test("should parse Brawler where section is 'Star Power' and there are multiple attacks/supers (Bonnie)", async () => {
  const mockPool = mockAgent.get("https://brawlstars.fandom.com");

  mockPool
    .intercept({
      path: "/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=Bonnie",
    })
    .reply(200, fandomBonnieJson);

  mockPool
    .intercept({
      path: "/wiki/Bonnie",
    })
    .reply(200, fandomBonnieHtml);

  mockPool
    .intercept({
      path: "/ru/wiki/Бонни",
    })
    .reply(200, fandomBonnieRuHtml);

  const data = (await fandomService.getBrawlerData("Bonnie", klickerData))!;

  expect(data.starpowers).toEqual([
    expect.objectContaining({ name: "Black Powder" }),
    expect.objectContaining({ name: "Wisdom Tooth" }),
  ]);

  expect(data.attack).toEqual(
    expect.objectContaining({
      name: "Loose Tooth",
    } satisfies Partial<Attack>)
  )
  expect(data.altAttack).toEqual(
    expect.objectContaining({
      name: "Bomber Jacket",
    } satisfies Partial<Attack>)
  )

  expect(data.super).toEqual(
    expect.objectContaining({
      name: "Star Launcher",
    } satisfies Partial<Attack>)
  )
  expect(data.altSuper).toEqual(
    expect.objectContaining({
      name: "Clyde",
    } satisfies Partial<Attack>)
  )
});

/*
test.each(["Shelly", "Nita", "Edgar"])("should parse live page for %s", async (brawler) => {
  mockAgent.enableNetConnect();

  const logSpy = vi.spyOn(console, "log");
  const warnSpy = vi.spyOn(console, "warn");
  const errorSpy = vi.spyOn(console, "error");

  const data = (await fandomService.getBrawlerData(brawler))!;
  expect(data).toBeDefined();
  expect(logSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
  expect(errorSpy).not.toHaveBeenCalled();
});
*/

test("template parser", () => {
  const parsed = fandomService.parseEnumeratedKeys({
    name1: "Panda",
    rarity1: "Rare",
    name2: "Koala",
    rarity2: "Epic",
    rarity2_2: "Legendary",
    namep1: "With p1",
    rarityp1: "Mythic",
    namep: "Just p",
    rarityp: "Epic",
    unused: "yes",
  });

  expect(parsed).toHaveLength(4);
  expect(parsed).toEqual(
    expect.arrayContaining([
      { name: ["Panda"], rarity: ["Rare"] },
      { name: ["Koala"], rarity: ["Epic", "Legendary"] },
      { name: ["With p1"], rarity: ["Mythic"] },
      { name: ["Just p"], rarity: ["Epic"] },
    ])
  );
});
