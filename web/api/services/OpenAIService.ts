import { StatsD } from 'hot-shots';
import OpenAI from 'openai';

const stats = new StatsD({ prefix: 'brawltime.openai.' })

export default class OpenAIService {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  public async generateCompletion(prompt: { system: string, user: string }): Promise<string> {
    try {
      console.log('generating completion')
      const completeStart = performance.now()
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          {
            role: 'system',
            content: prompt.system,
          },
          {
            role: 'user',
            content: prompt.user,
          },
        ],
        temperature: 0.1,
      })
      stats.timing('completion', performance.now() - completeStart)
      stats.increment('completion.success')
      if (response.usage != undefined) {
        stats.increment('completion_tokens', response.usage.completion_tokens)
        stats.increment('prompt_tokens', response.usage.prompt_tokens)
        stats.increment('total_tokens', response.usage.total_tokens)
        console.log('consumed tokens', response.usage)
      }
      return response.choices[0].message.content!
    } catch (error) {
      stats.increment('completion.failure')
      throw error
    }
  }
}
