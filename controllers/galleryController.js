const galleryModel = require('../models/galleryModel');
const cloudinaryService = require('../services/cloudinaryService');

const categories = new Set(['people', 'places', 'stories']);

function validateDetails(body) {
  const title = String(body.title || '').trim();
  const category = String(body.category || '').trim().toLowerCase();
  const description = String(body.description || '').trim();
  if (!title || title.length > 180) return { error: 'Title is required and must be 180 characters or fewer.' };
  if (!categories.has(category)) return { error: 'Choose a valid gallery category.' };
  return { title, category, description };
}

async function list(req, res, next) {
  try {
    const category = req.query.category ? String(req.query.category).toLowerCase() : 'all';
    if (category !== 'all' && !categories.has(category)) return res.status(400).json({ error: 'Invalid gallery category.' });
    res.json({ images: await galleryModel.list(category) });
  } catch (error) {
    next(error);
  }
}

async function upload(req, res, next) {
  try {
    const details = validateDetails(req.body);
    if (details.error) return res.status(400).json({ error: details.error });
    if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' });

    const cloudImage = await cloudinaryService.uploadImage(req.file.buffer, req.file.originalname);
    try {
      const image = await galleryModel.create({ url: cloudImage.secure_url, publicId: cloudImage.public_id, ...details });
      res.status(201).json({ image });
    } catch (databaseError) {
      await cloudinaryService.deleteImage(cloudImage.public_id).catch(() => {});
      throw databaseError;
    }
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const details = validateDetails(req.body);
    if (details.error) return res.status(400).json({ error: details.error });
    const image = await galleryModel.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found.' });
    res.json({ image: await galleryModel.update(req.params.id, details) });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const image = await galleryModel.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found.' });
    await cloudinaryService.deleteImage(image.publicId);
    await galleryModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, upload, update, remove };
