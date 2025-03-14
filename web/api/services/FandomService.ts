import AssetDownloader from "./AssetDownloader";
import FandomScraper from "./FandomScraper";

export class FandomService {
  constructor(
    private fandomScraper: FandomScraper,
    private assetDownloader: AssetDownloader,
  ) {}
}
