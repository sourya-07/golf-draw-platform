const express = require('express');
const router = express.Router();
const { listDraws, getDrawById, getMyEntry } = require('../controllers/drawController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', listDraws);
router.get('/:id', getDrawById);
router.get('/:id/my-entry', authMiddleware, getMyEntry);

module.exports = router;
