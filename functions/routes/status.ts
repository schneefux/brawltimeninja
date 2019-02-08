import cors from 'cors';
import express from 'express';

const router = express.Router();

router.options('*', cors());

router.get('/', cors(), async (req, res) => {
  res.json({ 'status': 'ok' });
});

export default router;
