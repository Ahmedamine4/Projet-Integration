import { describe, it, expect, vi, beforeEach } from 'vitest';

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const removeMock = vi.fn();
const fromMock = vi.fn(() => ({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
    remove: removeMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
    supabase: {
        storage: {
            from: fromMock,
        },
    },
}));

describe('photo.utils', () => {
    let uploadPhoto;
    let supprimerPhoto;
    let remplacerPhoto;

    beforeEach(async () => {
        vi.clearAllMocks();

        vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
        vi.spyOn(Math, 'random').mockReturnValue(0.123456);

        const module = await import('../../src/utils/photo.utils.js');
        uploadPhoto = module.uploadPhoto;
        supprimerPhoto = module.supprimerPhoto;
        remplacerPhoto = module.remplacerPhoto;
    });

    it('uploadPhoto upload le fichier et retourne URL publique', async () => {
        uploadMock.mockResolvedValue({ error: null });
        getPublicUrlMock.mockReturnValue({
            data: {
                publicUrl: 'https://cdn.test/projets/1700000000000_4fzyo8.png',
            },
        });

        const file = {
            originalname: 'photo.PNG',
            buffer: Buffer.from('image'),
            mimetype: 'image/png',
        };

        const result = await uploadPhoto(file, 'projets');

        expect(fromMock).toHaveBeenCalledWith('projets');
        expect(uploadMock).toHaveBeenCalledWith(
            expect.stringMatching(/^1700000000000_.*\.png$/),
            file.buffer,
            { contentType: 'image/png' }
        );
        expect(getPublicUrlMock).toHaveBeenCalledWith(
            expect.stringMatching(/^1700000000000_.*\.png$/)
        );
        expect(result).toBe('https://cdn.test/projets/1700000000000_4fzyo8.png');
    });

    it('uploadPhoto lance une erreur si Supabase retourne une erreur', async () => {
        uploadMock.mockResolvedValue({
            error: {
                message: 'bucket introuvable',
            },
        });

        const file = {
            originalname: 'photo.jpg',
            buffer: Buffer.from('image'),
            mimetype: 'image/jpeg',
        };

        await expect(uploadPhoto(file, 'projets')).rejects.toThrow(
            'Erreur upload photo : bucket introuvable'
        );
    });

    it('supprimerPhoto ne fait rien si photoUrl est vide', async () => {
        await supprimerPhoto(null, 'projets');

        expect(removeMock).not.toHaveBeenCalled();
    });

    it('supprimerPhoto supprime le fichier si URL valide', async () => {
        removeMock.mockResolvedValue({ error: null });

        await supprimerPhoto(
            'https://cdn.test/storage/v1/object/public/projets/photo.png',
            'projets'
        );

        expect(fromMock).toHaveBeenCalledWith('projets');
        expect(removeMock).toHaveBeenCalledWith(['photo.png']);
    });

    it('supprimerPhoto ne fait rien si URL ne contient pas le bucket', async () => {
        await supprimerPhoto(
            'https://cdn.test/storage/v1/object/public/autre/photo.png',
            'projets'
        );

        expect(removeMock).not.toHaveBeenCalled();
    });

    it('supprimerPhoto log une erreur si Supabase retourne une erreur', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        removeMock.mockResolvedValue({
            error: {
                message: 'delete failed',
            },
        });

        await supprimerPhoto(
            'https://cdn.test/storage/v1/object/public/projets/photo.png',
            'projets'
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            'Erreur suppression photo [projets]:',
            'delete failed'
        );

        consoleSpy.mockRestore();
    });

    it("remplacerPhoto upload la nouvelle photo puis supprime l'ancienne", async () => {
        uploadMock.mockResolvedValue({ error: null });
        getPublicUrlMock.mockReturnValue({
            data: {
                publicUrl: 'https://cdn.test/projets/new.png',
            },
        });
        removeMock.mockResolvedValue({ error: null });

        const file = {
            originalname: 'new.png',
            buffer: Buffer.from('new image'),
            mimetype: 'image/png',
        };

        const result = await remplacerPhoto(
            file,
            'https://cdn.test/storage/v1/object/public/projets/old.png',
            'projets'
        );

        expect(uploadMock).toHaveBeenCalled();
        expect(removeMock).toHaveBeenCalledWith(['old.png']);
        expect(result).toBe('https://cdn.test/projets/new.png');
    });
});
