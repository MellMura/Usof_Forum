const fs = require('fs');
const path = require('path');
const multer = require('multer');

const baseDir = path.join(__dirname, '..', 'uploads');
const avatarDir = path.join(baseDir, 'avatars');
const postDir = path.join(baseDir, 'posts');

[baseDir, avatarDir, postDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = baseDir;

    if (file.fieldname === 'avatar') dest = avatarDir;
    else if (file.fieldname === 'images' || file.fieldname === 'image') dest = postDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const uid = req.user?.id ?? 'anon';
    cb(null, `${uid}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  cb(new Error('Images only'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const avatarUpload = upload.single('avatar');
const postImagesUpload = upload.array('images', 4);

function handleMulterError(err, req, res, next) {
  if (!err) return next();
  if (err instanceof multer.MulterError) {

  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
    return res.status(400).json({ error: err.message });
  }
  
  return res.status(400).json({ error: err.message });
}

module.exports = {
  avatarUpload,
  postImagesUpload,
  handleMulterError,
  uploadDirs: { baseDir, avatarDir, postDir }
};