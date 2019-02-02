const cors = require('cors');
const express = require('express');

const router = express.Router();

router.options('*', cors());

router.get('/', cors(), async (req, res) => {
  res.json({ 'status': 'ok' });
});

module.exports = router;
