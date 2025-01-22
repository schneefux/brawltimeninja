require('dotenv').config()
const { readFile, writeFile, mkdir } = require('fs/promises')
const OpenAI = require('openai')
const yaml = require('js-yaml')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function translateChunk(chunk, targetLanguage) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-2024-11-20', // about 0.12€ per language
    temperature: 0.2,
    messages: [
      {
        role: 'developer',
        content: `
You are a translator for the Brawl Stars app "Brawl Time Ninja".
Translate the following YAML values from 'en' to '${targetLanguage}'.
Output the YAML values in the same format as the input.
Use child-friendly, informal language.`,
      },
      {
        role: 'user',
        content: chunk,
      },
    ],
  })

  console.log(`consumed ${completion.usage.prompt_tokens} input tokens, ${completion.usage.completion_tokens} completion tokens`)

  const translation = completion.choices[0].message.content
  return translation.replace(/^```yaml\n/, '').replace(/```$/, '') + '\n'
}

async function translate(lang) {
  const enJson = JSON.parse(await readFile('../web/locales/en.json', 'utf8'))
  const targetYamlPath = `./translations/auto/${lang}.yaml`

  await writeFile(targetYamlPath, '', 'utf-8')

  // output is limited to 4096 tokens
  const chunkSize = 200 // chunk of 100: ~1.5k prompt tokens, ~2k completion tokens
  const allKeys = Object.keys(enJson)
  for (let i = 0; i < allKeys.length; i += chunkSize) {
    const enChunk = yaml.dump(Object.fromEntries(Object.entries(enJson).slice(i, i + chunkSize)), { forceQuotes: true })

    console.log(`Translating chunk ${i / chunkSize + 1} of ${Math.ceil(allKeys.length / chunkSize)} to ${lang}`)
    const translatedChunk = await translateChunk(enChunk, lang)

    await writeFile(targetYamlPath, translatedChunk, { flag: 'a', 'encoding': 'utf-8' })
  }
}

async function main() {
  const allLangs = ['bn', 'br', 'cn', 'cz', 'de', 'es', 'fi', 'fr', 'hi', 'it', 'jp', 'kr', 'lt', 'nl', 'pl', 'pt', 'ru', 'sk', 'sv', 'tr', 'vi', 'zh']
  const args = process.argv.slice(2)
  const langs = args.length > 0 ? args : allLangs

  await mkdir('./auto-translations', { recursive: true })
  for (const lang of langs) {
    try {
      await readFile(`./translations/auto/${lang}.yaml`, 'utf8')
      console.log(`Skipping ${lang}.yaml because it already exists`)
      continue
    } catch (e) { }

    await translate(lang)
  }
}

main().catch(console.error)
