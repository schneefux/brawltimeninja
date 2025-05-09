export interface SurveyVote {
  fingerprint: string
  tag: string
  mode: string
  best: string
  rest: string[]
  player_trophies: number
  player_brawler_trophies: {
    name: string
    power: number
    trophies: number
  }[]
}
