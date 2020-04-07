import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import cacheManager from 'cache-manager';
import { StarlistBrawler, StarlistMap } from '~/model/Starlist';

const cacheDisable = !!process.env.CACHE_DISABLE;
const assetDir = process.env.ASSET_DIR || path.join(path.dirname(__dirname), 'assets');

console.log('using asset directory ' + assetDir);

export const cache = cacheManager.caching({
  store: 'memory',
  max: cacheDisable ? 0 : 1000,
  ttl: 60 * 60, // 1h
});

const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/v1/';
const token = process.env.BRAWLAPI_TOKEN || '';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(url: string) {
  return Promise.race([
    sleep(2000).then(() => { throw new Error('API Timeout') }),
    cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': token },
      compress: true,
    }).then(res => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    }).then(json => {
      if ('error' in json && json.error) {
        throw new Error(json.message);
      }
      return json;
    }))
  ]);
}

export default class MediaService {
  public async getBrawlerAvatar(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/profiles/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Brawler avatar not found (local): ' + name);
    }

    let brawlers: StarlistBrawler[];
    try {
      brawlers = await this.getStarlistBrawlers();
    } catch (err) {
      console.log('Brawler avatar API error: ' + err);
      return null;
    }

    const convert = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
    const brawler = brawlers.find(b => convert(b.name) == convert(name));
    if (brawler == undefined) {
      console.log('Brawler avatar not found (starlist): ' + name);
      return null;
    }

    const url = brawler.imageUrl2;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Brawler avatar fetch error: ' + err);
      return null;
    }
  }

  public async getBrawlerModel(name: string, accept: string): Promise<Buffer|null> {
    const path = assetDir + '/models/' + name + '.png';
    try {
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch(err) {
      console.log('Brawler model not found (local): ' + name);
      return null;
    }
  }

  public async getStarpower(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/star_powers/' + id + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Starpower not found (local): ' + id);
    }

    let brawlers: StarlistBrawler[];

    try {
      brawlers = await this.getStarlistBrawlers();
    } catch(err) {
      console.log('Starpower API error: ' + err);
      return null;
    }

    const starpowers = brawlers
      .map(b => b.starPowers)
      .reduce((agg, cur) => agg.concat(...cur), []);
    const starpower = starpowers.find(s => s.id == id);
    if (starpower == undefined) {
      console.log('Starpower not found (starlist): ' + id);
      return null;
    }

    const url = starpower.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Starpower fetch error: ' + err);
      return null;
    }
  }

  public async getMap(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/map_images/' + id.toString().replace(/^1500/g, '150') + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Map not found (local): ' + id);
    }

    let map: { map: StarlistMap };
    try {
      map = await this.getStarlistMap(id);
    } catch(err) {
      console.log('Map API error: ' + err);
      return null;
    }

    const url = map.map.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Map fetch error: ' + err);
      return null;
    }
  }

  private getStarlistBrawlers(): Promise<StarlistBrawler[]> {
    return request(starlistUrl + '/brawlers');
  }

  private getStarlistMaps(): Promise<StarlistMap[]> {
    return request(starlistUrl + '/maps');
  }

  private getStarlistMap(id: number): Promise<{ map: StarlistMap }> {
    return request(starlistUrl + '/maps/' + id);
  }
}
