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
import { formatClickhouseDate, getTodaySeasonEnd, tagToId } from "../../lib/util";
import { isbot } from 'isbot'
import { PlayerTotals } from "../../stores/brawlstars";
import { TRPCError } from "@trpc/server";
import { Player } from "~/model/Api";
import StatsD from 'hot-shots'
import AuthService from "../services/AuthService";
const stats = new StatsD({ prefix: 'brawltime.api.' })

const router = express.Router();

function asyncWrapper(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const profileView = new ProfileView();
const brawlStarsApiService = new BrawlstarsService();
const authService = new AuthService();
const CUBE_URL = process.env.CUBE_URL

const klickerService = new BrawltimeKlickerService(
  CUBE_URL,
  () => authService.getToken(),
  fetch
);

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

async function getBrawlersCount() {
  return await klickerService.query({
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    metricsIds: [],
    slices: {
      season: [formatClickhouseDate(getTodaySeasonEnd())],
    },
    sortId: 'picks',
  })
  .then(data => data.data.length)
  .catch(e => {
    console.error('error fetching brawlers count', e)
    return 80
  })
}

router.get(
  "/profile/:tag/:brawler.svg",
  asyncWrapper(async (req, res) => {
    const player = await brawlStarsApiService.getPlayerStatistics(req.params.tag, false, true);
    if (req.params.brawler != 'best' && !(req.params.brawler in player.brawlers)) {
      res.status(404).send("Player does not own this brawler");
      return;
    }

    const isBot = isbot(req.headers['user-agent'] || '')
    const playerTotals = isBot ? undefined : await getPlayerTotals(req.params.tag)
    const brawlersCount = await getBrawlersCount()

    const svg = await profileView.render(
      player,
      playerTotals,
      brawlersCount,
      req.params.brawler,
      (req.query.background as string) ?? "BlueSkull_Default.jpg",
      process.env.MEDIA_URL!,
    );

    res.type("svg");
    res.header("Cache-Control", "public, max-age=600, stale-if-error=3600");
    res.send(svg);
  })
);

router.get(
  "/profile/:tag/:brawler.png",
  asyncWrapper(async (req, res) => {
    let player!: Player

    try {
      player = await brawlStarsApiService.getPlayerStatistics(req.params.tag, false, true);
    } catch (err) {
      if (err instanceof TRPCError) {
        console.error(err);
        res.status(err.code == 'NOT_FOUND' ? 404 : 503).send(err.message);
        return;
      }
      throw err;
    }

    if (req.params.brawler != 'best' && !(req.params.brawler in player.brawlers)) {
      res.status(404).send("Player does not own this brawler");
      return;
    }

    const isBot = isbot(req.headers['user-agent'] || '')
    const playerTotals = isBot ? undefined : await getPlayerTotals(req.params.tag)
    const brawlersCount = await getBrawlersCount()

    const renderStart = performance.now()

    const svg = await profileView.render(
      player,
      playerTotals,
      brawlersCount,
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

    stats.timing('render.profile.timer', performance.now() - renderStart)

    res.type("png");
    res.header("Cache-Control", "public, max-age=600, stale-if-error=3600");
    res.send(pngBuffer);
  })
);

export default router;
