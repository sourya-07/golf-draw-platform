const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminCheck');
const ctrl = require('../controllers/adminController');

router.use(authMiddleware, adminCheck);

// Users
router.get('/users', ctrl.listUsers);
router.get('/users/:id', ctrl.getUserById);
router.put('/users/:id', ctrl.updateUser);
router.get('/users/:id/scores', ctrl.getUserScores);
router.put('/users/:id/scores', ctrl.updateUserScores);

// Draws
router.get('/draws', ctrl.listAllDraws);
router.post('/draws', ctrl.createDraw);
router.post('/draws/:id/simulate', ctrl.simulateDraw);
router.post('/draws/:id/publish', ctrl.publishDraw);

// Charities
router.post('/charities', ctrl.createCharity);
router.put('/charities/:id', ctrl.updateCharity);
router.delete('/charities/:id', ctrl.deleteCharity);
router.put('/charities/:id/feature', ctrl.toggleFeatured);

// Winners
router.get('/winners', ctrl.listAllWinners);
router.put('/winners/:id/verify', ctrl.verifyWinner);
router.put('/winners/:id/payout', ctrl.markPayout);

// Reports
router.get('/reports', ctrl.getReports);

module.exports = router;
