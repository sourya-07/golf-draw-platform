const express = require('express');
const router = express.Router();
const { upload, uploadProof, getMyWins } = require('../controllers/winnerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/:entryId/upload-proof', upload.single('proof'), uploadProof);
router.get('/my-wins', getMyWins);

module.exports = router;
