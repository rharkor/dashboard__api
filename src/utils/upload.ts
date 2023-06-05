import { diskStorage } from 'multer';

export const uploadConfiguration = {
  dest: './upload',
  limits: {
    fileSize: 1024 * 1024 * 1024, // 100Go
    fieldNameSize: 100,
    fields: 100,
    files: 10,
    fieldSize: 1024 * 1024 * 10,
    headerPairs: 2000,
    parts: 100,
  },
  storage: diskStorage({
    destination: './upload',
    filename: (req, file, cb) => {
      const date = Date.now().toString();
      const filename = `${date}-${file.originalname}`;
      cb(null, filename);
    },
  }),
};
