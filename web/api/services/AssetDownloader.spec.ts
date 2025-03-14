import { beforeEach, expect, test, vi } from "vitest";
import { MockAgent, setGlobalDispatcher } from "undici";
import AssetDownloader from "./AssetDownloader";

const mockAgent = new MockAgent({ connections: 1 });
mockAgent.disableNetConnect();
setGlobalDispatcher(mockAgent);

let attributionGranted: boolean;
mockAgent.get("https://brawlstars.fandom.com")
  .intercept({
    path: /controller=Lightbox/,
  })
  .reply(() => {
    return {
      statusCode: 200,
      data: {
        userName: attributionGranted ? "AppleInStudio18" : "unknown-user",
      },
    }
  })
  .persist();

beforeEach(() => attributionGranted = true);

const assetDownloader = new AssetDownloader();

test("should download video with permission", async () => {
  mockAgent.get("https://static.wikia.nocookie.net")
    .intercept({
      path: /.*/,
    })
    .reply(200, Buffer.from("fake-content"));

  const data = (await assetDownloader.download({
    sourceUrl: "https://static.wikia.nocookie.net/brawlstars/images/0/0c/%D0%A8%D0%B5%D0%BB%D0%BB%D0%B8%D0%A1%D1%83%D0%BF%D0%B5%D1%80.gif/revision/latest?cb=20231223111452&path-prefix=ru",
    filename: "ШеллиСупер.gif",
    requiresAttribution: true,
  }));

  expect(data).toBeDefined();
});

test("should not download video without permission", async () => {
  attributionGranted = false;

  vi.spyOn(console, "warn").mockImplementation(() => {}); // suppress

  const data = (await assetDownloader.download({
    sourceUrl: "https://static.wikia.nocookie.net/brawlstars/images/0/0c/%D0%A8%D0%B5%D0%BB%D0%BB%D0%B8%D0%A1%D1%83%D0%BF%D0%B5%D1%80.gif/revision/latest?cb=20231223111452&path-prefix=ru",
    filename: "ШеллиСупер.gif",
    requiresAttribution: true,
  }))!;

  expect(data).toBeUndefined();
});
