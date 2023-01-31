import { Resvg } from "@resvg/resvg-js";
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import ProfileView from "../templates/ProfileView.js";
import BrawlstarsService from "../services/BrawlstarsService.js";
import path from "path";
import { root } from "../../server/root.js";

const router = express.Router();

function asyncWrapper(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const profileView = new ProfileView();
const brawlStarsApiService = new BrawlstarsService();

router.get(
  "/profile/:tag/:brawler",
  asyncWrapper(async (req, res) => {
    const player = await brawlStarsApiService.getPlayerStatistics(req.params.tag, false, true);
    if (!(req.params.brawler in player.brawlers)) {
      res.status(404).send("Player does not own this brawler");
      return;
    }

    const svg = await profileView.render(
      player,
      req.params.brawler,
      (req.query.background as string) ?? "BlueSkull_Default.jpg",
      process.env.MEDIA_URL!,
    );
    const resvg = new Resvg(svg, {
      font: {
        fontFiles: [
          path.join(
            root,
            "assets/fonts/LilitaOne-Regular.ttf"
          ),
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
