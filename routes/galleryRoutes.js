const express = require('express');
const multer = require('multer');
const galleryController = require('../controllers/galleryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    callback(allowed.includes(file.mimetype) ? null : new Error('Only JPEG, PNG, and WebP images are allowed.'), allowed.includes(file.mimetype));
  }
});

router.get('/', galleryController.list);
router.post('/', requireAuth, upload.single('image'), galleryController.upload);
router.patch('/:id', requireAuth, galleryController.update);
router.delete('/:id', requireAuth, galleryController.remove);

module.exports = router;
