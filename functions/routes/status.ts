import * as cors from 'cors';
import * as express from 'express';

const router = express.Router();

router.options('*', cors());

router.get('/', cors(), async (req, res) => {
  res.json({ 'status': 'ok' });
});

export default router;
