import { Resvg } from "@resvg/resvg-js";
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import ProfileView from "../templates/ProfileView";
import BrawlstarsService from "../services/BrawlstarsService";
import { BrawltimeKlickerService } from "../../plugins/klicker.service";
import { tagToId } from "../../lib/util";
import isbot from 'isbot'
import { PlayerTotals } from "../../stores/brawlstars";

const router = express.Router();

function asyncWrapper(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const profileView = new ProfileView();
const brawlStarsApiService = new BrawlstarsService();
const klickerService = new BrawltimeKlickerService(process.env.CUBE_URL!, fetch);

async function getPlayerTotals(tag: string) {
  return await klickerService.query({
    cubeId: 'battle',
    dimensionsIds: [],
    metricsIds: ['picks', 'winRate', 'trophyChange'],
    slices: {
      playerId: [tagToId(tag)],
    },
    sortId: 'picks',
  })
  .then(data => data.data[0].metricsRaw as unknown as PlayerTotals)
  .then(totals => totals.picks == 0 ? undefined : totals)
  .catch(e => {
    console.error('error fetching player totals', e)
    return undefined
  })
}

router.get(
  "/profile/:tag/:brawler.svg",
  asyncWrapper(async (req, res) => {
    const player = await brawlStarsApiService.getPlayerStatistics(req.params.tag, false, true);
    if (!(req.params.brawler in player.brawlers)) {
      res.status(404).send("Player does not own this brawler");
      return;
    }

    const isBot = isbot(req.headers['user-agent'] || '')
    const playerTotals = isBot ? undefined : await getPlayerTotals(req.params.tag)

    const svg = await profileView.render(
      player,
      playerTotals,
      req.params.brawler,
      (req.query.background as string) ?? "BlueSkull_Default.jpg",
      process.env.MEDIA_URL!,
    );

    res.type("svg");
    res.header("Cache-Control", "public, max-age=600");
    return res.send(svg);
  })
);

router.get(
  "/profile/:tag/:brawler.png",
  asyncWrapper(async (req, res) => {
    const player = await brawlStarsApiService.getPlayerStatistics(req.params.tag, false, true);
    if (!(req.params.brawler in player.brawlers)) {
      res.status(404).send("Player does not own this brawler");
      return;
    }

    const isBot = isbot(req.headers['user-agent'] || '')
    const playerTotals = isBot ? undefined : await getPlayerTotals(req.params.tag)

    const svg = await profileView.render(
      player,
      playerTotals,
      req.params.brawler,
      (req.query.background as string) ?? "BlueSkull_Default.jpg",
      process.env.MEDIA_URL!,
    );
    const resvg = new Resvg(svg, {
      font: {
        fontFiles: [
          new URL(`../../assets/fonts/LilitaOne-Regular.ttf`, import.meta.url).pathname,
        ],
        loadSystemFonts: false,
      },
      /*
      // 2x DPI
      fitTo: {
        mode: "zoom" as "zoom",
        value: 2,
      },
      */
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    res.type("png");
    res.header("Cache-Control", "public, max-age=600");
    return res.send(pngBuffer);
  })
);

export default router;
