const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure drawings upload directory exists
const drawingsDir = path.join(__dirname, '../uploads/drawings');
if (!fs.existsSync(drawingsDir)) {
  fs.mkdirSync(drawingsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, drawingsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'drawing-' + uniqueSuffix + ext);
  }
});

// File filter - allow PDF, DWG, DXF, images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|dwg|dxf|png|jpg|jpeg|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype || '';

  if (extname || allowedTypes.test(mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DWG, DXF, and image files are allowed!'));
  }
};

// Configure multer
const uploadDrawing = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for drawings
  },
  fileFilter: fileFilter
});

module.exports = uploadDrawing;

