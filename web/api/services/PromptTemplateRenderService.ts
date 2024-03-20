export type Prompt = {
  text: string | (() => Promise<string>)
}

export default class PromptTemplateRenderService {
  async render(template: { system: string, user: Prompt[] }) {
    const user = (await Promise.all(template.user.map(e => {
        if (typeof e.text == 'function') {
          return e.text()
        }
        return e.text
      })))
      .filter(p => p != undefined)
      .join('\n\n')

    return {
      system: template.system,
      user,
    }
  }
}
