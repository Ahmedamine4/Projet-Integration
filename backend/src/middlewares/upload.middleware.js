import multer from 'multer';

// stocke les fichiers dans la RAM
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // taille du fichier 5mb
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seulement les images sont autorisées'));
    }
    cb(null, true);
  },
});