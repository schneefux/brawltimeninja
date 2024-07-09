const map =
{
  "16000083": "Clancy",
  "16000082": "Berry",
  "16000081": "Lily",
  "16000080": "Draco",
  "16000079": "Angelo",
  "16000078": "Melodie",
  "16000077": "Larry & Lawrie",
  "16000076": "Kit",
  "16000075": "Mico",
  "16000074": "Charlie",
  "16000073": "Chuck",
  "16000072": "Pearl",
  "16000071": "Doug",
  "16000070": "Cordelius",
  "16000069": "Hank",
  "16000068": "Maisie",
  "16000067": "Willow",
  "16000066": "R-T",
  "16000065": "Mandy",
  "16000064": "Gray",
  "16000063": "Chester",
  "16000062": "Buster",
  "16000061": "Gus",
  "16000060": "Sam",
  "16000059": "Otis",
  "16000058": "Bonnie",
  "16000057": "Janet",
  "16000056": "Eve",
  "16000054": "Fang",
  "16000053": "Lola",
  "16000052": "Meg",
  "16000051": "Ash",
  "16000050": "Griff",
  "16000049": "Buzz",
  "16000048": "Grom",
  "16000047": "Squeak",
  "16000046": "Belle",
  "16000045": "Stu",
  "16000044": "Ruffs",
  "16000043": "Edgar",
  "16000042": "Byron",
  "16000041": "Lou",
  "16000040": "Amber",
  "16000039": "Colette",
  "16000038": "Surge",
  "16000037": "Sprout",
  "16000036": "Nani",
  "16000035": "Gale",
  "16000034": "Jacky",
  "16000032": "Max",
  "16000031": "Mr. P",
  "16000030": "Emz",
  "16000029": "Bea",
  "16000028": "Sandy",
  "16000027": "8-Bit",
  "16000026": "Bibi",
  "16000025": "Carl",
  "16000024": "Rosa",
  "16000023": "Leon",
  "16000022": "Tick",
  "16000021": "Gene",
  "16000020": "Frank",
  "16000019": "Penny",
  "16000018": "Darryl",
  "16000017": "Tara",
  "16000016": "Pam",
  "16000015": "Piper",
  "16000014": "Bo",
  "16000013": "Poco",
  "16000012": "Crow",
  "16000011": "Mortis",
  "16000010": "El Primo",
  "16000009": "Dynamike",
  "16000008": "Nita",
  "16000007": "Jessie",
  "16000006": "Barley",
  "16000005": "Spike",
  "16000004": "Rico",
  "16000003": "Brock",
  "16000002": "Bull",
  "16000001": "Colt",
  "16000000": "Shelly"
}

const multiif = (col, oldcol) => 'multiIf(' + [...Object.entries(map)].map(([id, name]) => `${col}=${id}, '${name.toUpperCase()}'`).join(', ') + ', \'\')'
console.log(`ALTER TABLE brawltime.battle UPDATE
  brawler_name=${multiif('brawler_id')},
  battle_starplayer_brawler_name=${multiif('battle_starplayer_brawler_id')},
  battle_bigbrawler_brawler_name=${multiif('battle_bigbrawler_brawler_id')},
  \`battle_allies.brawler_name\`=arrayMap(bid -> ${multiif('bid')}, \`battle_allies.brawler_id\`),
  \`battle_enemies.brawler_name\`=arrayMap(bid -> ${multiif('bid')}, \`battle_enemies.brawler_id\`)
WHERE trophy_season_end>=now()`);

console.log(`ALTER TABLE brawltime.brawler UPDATE
  brawler_name=${multiif('brawler_id')},
WHERE trophy_season_end>=now()`);

console.log(`ALTER TABLE brawltime.brawler_allies_mv DROP PARTITION '2024-07-08 08:00:00'`)
console.log(`ALTER TABLE brawltime.brawler_enemies_mv DROP PARTITION '2024-07-08 08:00:00'`)
console.log(`ALTER TABLE brawltime.gadget_meta DROP PARTITION '2024-07-08 08:00:00'`)
console.log(`ALTER TABLE brawltime.map_meta DROP PARTITION '2024-07-08 08:00:00'`)
console.log(`ALTER TABLE brawltime.starpower_meta DROP PARTITION '2024-07-08 08:00:00'`)
console.log(`ALTER TABLE brawltime.gear_meta DROP PARTITION '2024-07-08 08:00:00'`)

console.log('INSERT INTO brawltime.gear_meta -- select query from matview definition -- WHERE trophy_season_end >= now()');
console.log('INSERT INTO brawltime.`.inner.brawler_enemies_mv` -- select query from matview definition -- WHERE trophy_season_end >= now()');
