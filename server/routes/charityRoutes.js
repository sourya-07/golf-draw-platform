const express = require('express');
const router = express.Router();
const { listCharities, getFeaturedCharities, getCharityById } = require('../controllers/charityController');

router.get('/', listCharities);
router.get('/featured', getFeaturedCharities);
router.get('/:id', getCharityById);

module.exports = router;
