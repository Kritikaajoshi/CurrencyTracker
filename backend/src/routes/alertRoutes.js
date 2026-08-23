const express = require('express');
const { body } = require('express-validator');
const { getAlerts, createAlert, cancelAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.post(
  '/',
  [
    body('from').isLength({ min: 3, max: 3 }),
    body('to').isLength({ min: 3, max: 3 }),
    body('direction').isIn(['above', 'below']),
    body('targetRate').isFloat({ gt: 0 }),
  ],
  validate,
  createAlert
);
router.delete('/:id', cancelAlert);

module.exports = router;
