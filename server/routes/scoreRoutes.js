const express = require('express');
const router = express.Router();
const { getScores, addScore, updateScore, deleteScore } = require('../controllers/scoreController');
const authMiddleware = require('../middleware/authMiddleware');
const subscriptionCheck = require('../middleware/subscriptionCheck');

router.use(authMiddleware, subscriptionCheck);

router.get('/', getScores);
router.post('/', addScore);
router.put('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;
