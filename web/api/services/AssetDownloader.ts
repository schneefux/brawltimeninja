import { Asset } from "./FandomScraper";

export interface DownloadedAsset extends Asset {
  contentType: string;
  date: Date;
  etag: string;
  content: Buffer;
  attribution: string;
}

export default class AssetDownloader {
  public async download(asset: Asset): Promise<DownloadedAsset|undefined> {
    let attribution = "Supercell";

    const url = new URL(asset.sourceUrl);

    if (asset.requiresAttribution) {
      const pathPrefix = url.searchParams.get("path-prefix") ?? "";
      const assetMeta = await fetch(
        `https://brawlstars.fandom.com/${pathPrefix}wikia.php?controller=Lightbox&method=getMediaDetail&fileTitle=${asset.filename}&format=json`
      ).then(res => res.json()) as any;
      attribution = assetMeta.userName;

      // https://brawlstars.fandom.com/ru/wiki/%D0%A1%D1%82%D0%B5%D0%BD%D0%B0_%D0%BE%D0%B1%D1%81%D1%83%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D1%8F:AppleInStudio18?threadId=4400000000000157284
      if (!["AppleInStudio18"].includes(attribution)) {
        console.warn("Missing permission to use this asset", {
          ...asset,
          author: attribution,
        });

        return undefined;
      }
    }

    const assetResponse = await fetch(url);

    const content = Buffer.from(await assetResponse.arrayBuffer());
    const contentType = assetResponse.headers.get("content-type")!;
    const date = new Date(assetResponse.headers.get("date")!);
    const etag = assetResponse.headers.get("etag")!;

    return {
      ...asset,
      attribution,
      contentType,
      date,
      etag,
      content,
    };
  }
}
