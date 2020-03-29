import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import cacheManager from 'cache-manager';
import { StarlistBrawler, StarlistMap } from '~/model/Starlist';

const cacheDisable = !!process.env.CACHE_DISABLE;
const assetDir = process.env.ASSET_DIR || path.join(path.dirname(__dirname), 'assets');

export const cache = cacheManager.caching({
  store: 'memory',
  max: cacheDisable ? 0 : 1000,
  ttl: 180,
});

const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/v1/';
const token = process.env.BRAWLAPI_TOKEN || '';

export default class MediaService {
  public async getBrawlerAvatar(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/profiles/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
    }

    const brawlers = await this.getStarlistBrawlers();
    const convert = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
    const brawler = brawlers.find(b => convert(b.name) == convert(name));
    if (brawler == undefined) {
      return Promise.resolve(null);
    }

    const url = brawler.imageUrl2;
    return fetch(url, { headers: { accept } })
      .then(res => res.buffer());
  }

  public async getBrawlerModel(name: string, accept: string): Promise<Buffer|null> {
    const path = assetDir + '/models/' + name + '.png';
    await fs.promises.access(path);
    return fs.promises.readFile(path);
  }

  public async getStarpower(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/map_images/' + id + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
    }

    const brawlers = await this.getStarlistBrawlers();
    const starpowers = brawlers
      .map(b => b.starPowers)
      .reduce((agg, cur) => agg.concat(...cur), []);
    const starpower = starpowers.find(s => s.id == id);
    if (starpower == undefined) {
      return Promise.resolve(null);
    }

    const url = starpower.imageUrl;
    return fetch(url, { headers: { accept } })
      .then(res => res.buffer());
  }

  public async getMap(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/map_images/' + id.toString().replace(/^1500/g, '150') + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
    }

    const map = await this.getStarlistMap(id);

    const url = map.map.imageUrl;
    return fetch(url, { headers: { accept } })
      .then(res => res.buffer());
  }

  private getStarlistBrawlers(): Promise<StarlistBrawler[]> {
    const url = starlistUrl + '/brawlers'
    return cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': token },
      compress: true,
    }).then(res => res.json()));
  }

  private getStarlistMaps(): Promise<StarlistMap[]> {
    const url = starlistUrl + '/maps/'
    return cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': token },
      compress: true,
    }).then(res => res.json()));
  }

  private getStarlistMap(id: number): Promise<{ map: StarlistMap }> {
    const url = starlistUrl + '/maps/' + id
    return cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': token },
      compress: true,
    }).then(res => res.json()));
  }
}
