import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';
import { StarlistBrawler, StarlistMap, StarlistMode } from '~/model/Starlist';

const assetDir = process.env.ASSET_DIR || path.join(path.dirname(__dirname), 'assets');

console.log('using asset directory ' + assetDir);

const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;

export const cache = cacheDisable ?
  cacheManager.caching({
    store: 'memory',
    max: 0,
    ttl: 60 * 60,
  }) :
  cacheManager.caching(<any>{
    max: 10000,
    store: fsStore,
    ttl: 60 * 60,
    options: { path: cachePath, subdirs: true, },
  });


const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/';
const token = process.env.BRAWLAPI_TOKEN || '';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(url: string) {
  return Promise.race([
    sleep(2000).then(() => { throw new Error('API Timeout') }),
    cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
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
      brawlers = (await this.getStarlistBrawlers()).list;
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
      brawlers = (await this.getStarlistBrawlers()).list;
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

  public async getGadget(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/gadgets/' + id + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Gadget not found (local): ' + id);
    }

    let brawlers: StarlistBrawler[];

    try {
      brawlers = (await this.getStarlistBrawlers()).list;
    } catch(err) {
      console.log('Gadget API error: ' + err);
      return null;
    }

    const gadgets = brawlers
      .map(b => b.gadgets)
      .reduce((agg, cur) => agg.concat(...cur), []);
    const gadget = gadgets.find(g => g.id == id);
    if (gadget == undefined) {
      console.log('Gadget not found (starlist): ' + id);
      return null;
    }

    const url = gadget.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Gadget fetch error: ' + err);
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

  public async getModeIcon(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/modes/icon/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Mode not found (local): ' + name);
    }

    let modes: StarlistMode[];

    try {
      modes = (await this.getStarlistModes()).list;
    } catch(err) {
      console.log('Modes API error: ' + err);
      return null;
    }

    const mode = modes.find(m => m.name.replace(' ', '').toLowerCase() == name.replace(' ', '').toLowerCase());
    if (mode == undefined) {
      console.log('Mode not found (starlist): ' + name);
      return null;
    }

    const url = mode.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Mode fetch error: ' + err);
      return null;
    }
  }

  public async getModeBackground(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/modes/background/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Mode not found (local): ' + name);
    }

    let modes: StarlistMode[];

    try {
      modes = (await this.getStarlistModes()).list;
    } catch(err) {
      console.log('Modes API error: ' + err);
      return null;
    }

    const mode = modes.find(m => m.name.replace(' ', '').toLowerCase() == name.replace(' ', '').toLowerCase());
    if (mode == undefined) {
      console.log('Mode not found (starlist): ' + name);
      return null;
    }

    const url = mode.imageUrl2;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Mode fetch error: ' + err);
      return null;
    }
  }

  private getStarlistBrawlers(): Promise<{ list: StarlistBrawler[] }> {
    return request(starlistUrl + '/brawlers');
  }

  private getStarlistMaps(): Promise<{ list: StarlistMap[] }> {
    return request(starlistUrl + '/maps');
  }

  private getStarlistMap(id: number): Promise<{ map: StarlistMap }> {
    return request(starlistUrl + '/maps/' + id);
  }

  private getStarlistModes(): Promise<{ list: StarlistMode[] }> {
    return request(starlistUrl + '/gamemodes');
  }
}
