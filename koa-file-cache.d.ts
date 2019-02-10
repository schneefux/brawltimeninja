import { Middleware } from "koa";

interface CacheOptions {
  cacheTime: number;
  folder: string;
  gzip: boolean;
  gzipThreshold: boolean;
  delegate: boolean;
  type: string;
  fileNameHash: string[];
  fileNameHashSep: string;
}

export default function Cache(args: Partial<CacheOptions>): Middleware;