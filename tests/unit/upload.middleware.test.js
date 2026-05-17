import { describe, expect, it } from 'vitest';
import { upload } from '../../src/middlewares/upload.middleware.js';

describe('upload.middleware', () => {
  it('accepte les images dans fileFilter', () => {
    const fileFilter = upload.fileFilter;
    const cb = (error, accepted) => {
      expect(error).toBeNull();
      expect(accepted).toBe(true);
    };

    fileFilter({}, { mimetype: 'image/png' }, cb);
  });

  it('refuse les fichiers non image dans fileFilter', () => {
    const fileFilter = upload.fileFilter;
    const cb = (error, accepted) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('images');
      expect(accepted).toBeUndefined();
    };

    fileFilter({}, { mimetype: 'application/pdf' }, cb);
  });
});
