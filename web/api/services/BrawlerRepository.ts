import { Knex } from 'knex'
import { Brawler } from './FandomScraper';

export default class BrawlerRepository {
  constructor(private db: Knex) {}

  public async store(brawler: Brawler) {
    // TODO: design schema (every IdAble in a table, assets in a table); download assets; store everything in DB
  }
}
