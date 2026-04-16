const supabase = require('../services/supabaseAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Store uploads in /uploads folder (swap for S3/Supabase Storage in production)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

async function uploadProof(req, res) {
  const { entryId } = req.params;
  const userId = req.user.id;

  // Find the winner verification for this entry
  const { data: verification, error } = await supabase
    .from('winner_verifications')
    .select('*')
    .eq('draw_entry_id', entryId)
    .eq('user_id', userId)
    .single();

  if (error || !verification) {
    return res.status(404).json({ error: 'Winner verification record not found' });
  }

  if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

  const proofUrl = `/uploads/${req.file.filename}`;

  const { data: updated, error: updateErr } = await supabase
    .from('winner_verifications')
    .update({ proof_image_url: proofUrl, status: 'pending' })
    .eq('id', verification.id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  return res.json({ message: 'Proof uploaded successfully', verification: updated });
}

async function getMyWins(req, res) {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      draw_entry:draw_entries(*, draw:draws(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ wins: data });
}

module.exports = { upload, uploadProof, getMyWins };
