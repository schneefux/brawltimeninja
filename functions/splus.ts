import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as TIMETABLES from '../../assets/timetables.json';

import { SplusApi } from '../lib/SplusApi';
import { RichLecture } from '../../model/RichLecture';

const SCHEDULE_CACHE_SECONDS = 600;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;

const router = express.Router();
const cache = CACHE_DISABLE ?
  cacheManager.caching({ store: 'memory', max: 0 }) :
  cacheManager.caching({
    store: fsStore,
    options: {
      path: CACHE_PATH,
      ttl: 60,
      subdirs: true,
    },
  });

/**
 * Accept CORS preflight requests.
 */
router.options('/:timetable/:week', cors());

/**
 * Get all lectures for the given timetable and week.
 *
 * @param timetable The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return RichLecture[]
 */
router.get('/:timetable/:week', cors(), async (req, res, next) => {
  const timetableId = req.params.timetable;
  const timetable = TIMETABLES.find(({ id }) => id == timetableId);
  if (!timetable) {
    res.send(404);
    return;
  }

  const week = parseInt(req.params.week);
  const key = `${timetableId}-${week}`;

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`timetable cache miss for key ${key}`);
      const lectures = await SplusApi.getData('#' + timetableId, week, timetable.setplan);
      return lectures.map((ilecture) => new RichLecture(ilecture, week));
    }, { ttl: SCHEDULE_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${SCHEDULE_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
