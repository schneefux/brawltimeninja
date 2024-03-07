const { readFile, writeFile } = require('fs/promises')
const yaml = require('js-yaml')

async function main() {
  const langs = ['bn', 'br', 'cn', 'cz', 'de', 'es', 'fi', 'fr', 'hi', 'it', 'jp', 'kr', 'lt', 'nl', 'pl', 'pt', 'ru', 'sk', 'sv', 'tr', 'vi', 'zh']

  for (const lang of langs) {
    let humanTranslation = {}
    try {
      humanTranslation = JSON.parse(await readFile(`./translations/traduora/${lang}.json`, 'utf8'))
    } catch (e) { }
    const yamlString = await readFile(`./translations/auto/${lang}.yaml`, 'utf8')
    const parsed = yaml.load(yamlString)
    const merged = Object.assign({}, humanTranslation, parsed)
    await writeFile(`../web/locales/${lang}.json`, JSON.stringify(merged, null, 2))
  }
}

main().catch(console.error)
