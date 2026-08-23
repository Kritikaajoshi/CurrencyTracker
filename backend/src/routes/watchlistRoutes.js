const express = require('express');
const { body } = require('express-validator');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getWatchlist);
router.post(
  '/',
  [body('from').isLength({ min: 3, max: 3 }), body('to').isLength({ min: 3, max: 3 })],
  validate,
  addToWatchlist
);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
