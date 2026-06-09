import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10mb
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Seulement les fichiers PDF sont autorisés'));
    }
    cb(null, true);
  },
});