import Axios from "axios";
import fs from "fs";
import { dirname } from "path";
import { finished } from "stream/promises";

const OUT_DIR = "./out";

export function printProgress(curPercentage: number, size: number, step: number) {
  const dots = ".".repeat(Math.round(curPercentage * size));
  const left = size - Math.round(curPercentage * size);
  const empty = " ".repeat(left);
  console.log(
    `[${dots}${empty}] ${Math.round(curPercentage * 100)}% - ${step}`
  );
}

async function downloadFileToLocation(link, path) {
  path = OUT_DIR + path;

  const parentFolder = dirname(path);
  await fs.promises.mkdir(parentFolder, { recursive: true });

  let actualSize = 0;
  try {
    const fileMetadata = await fs.promises.stat(path);
    actualSize = fileMetadata.size;
  } catch (err) {}

  if (actualSize > 0) {
    const httpMetadata = await Axios({
      method: "head",
      url: link,
    });
    const expectedSize = parseInt(httpMetadata.headers["content-length"]);

    if (actualSize == expectedSize) {
      // already downloaded
      return;
    }
  }
  console.log("downloading", path);

  const writer = fs.createWriteStream(path);
  return Axios({
    method: "get",
    url: link,
    responseType: "stream",
  }).then((response) => {
    // https://stackoverflow.com/a/61269447
    response.data.pipe(writer);
    return finished(writer);
  });
}

export const downloadQueue: { link: string; path: string }[] = [];
export let progress = 0;

export function addToDownloadQueue(link: string, path: string) {
  downloadQueue.push({ link, path });
}

export async function executeDownloadQueue() {
  // download all assets
  progress = 0;
  for (const { link, path } of downloadQueue) {
    if (link == undefined) {
      console.error("Invalid link for path " + path);
      continue;
    }

    await downloadFileToLocation(link, path);

    printProgress(++progress / downloadQueue.length, 20, "");
  }
}
