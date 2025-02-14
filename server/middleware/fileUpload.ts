import multer from 'multer';

const storage = multer.memoryStorage();
const fileUpload = multer({
  storage: storage,
  limits: {
    // Limit file size to 5MB
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'));
    }
  },
});

export default fileUpload;
