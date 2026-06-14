import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('upload.middleware', () => {
  it('configure multer avec une limite 5MB et un filtre image', () => {
    const filePath = path.resolve('src/middlewares/upload.middleware.js');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("import multer from 'multer';");
    expect(source).toContain('multer.memoryStorage()');
    expect(source).toContain('limits: { fileSize: 5 * 1024 * 1024 }');
    expect(source).toContain("!file.mimetype.startsWith('image/')");
    expect(source).toContain('Seulement les images');
  });
});
