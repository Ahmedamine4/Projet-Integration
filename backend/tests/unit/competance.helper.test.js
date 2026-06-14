import { beforeEach, describe, expect, it, vi } from 'vitest';

const TypeCompetence = {
    technologie: 'technologie',
    domaine: 'domaine',
};

vi.mock('@prisma/client', () => ({
    TypeCompetence: {
        technologie: 'technologie',
        domaine: 'domaine',
    },
}));

const prismaMock = {
    competenceDeveloppee: {
        findMany: vi.fn(),
    },
};

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

const txMock = {
    competence: {
        findFirst: vi.fn(),
        create: vi.fn(),
    },
    competenceDeveloppee: {
        count: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
    },
};

const {
    lierCompetenceExperience,
    lierCompetencesExperience,
    supprimerCompetencesDeveloppees,
    getCompetencesByExperience,
} = await import('../../src/services/competence.helper.js');

describe('competence.helper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('crée une compétence si elle n’existe pas et lie avec niveau 1', async () => {
        txMock.competence.findFirst.mockResolvedValue(null);

        txMock.competence.create.mockResolvedValue({
            competence_id: 'comp1',
            nom: 'Node.js',
            type: TypeCompetence.technologie,
        });

        txMock.competenceDeveloppee.count.mockResolvedValue(0);

        txMock.competenceDeveloppee.create.mockResolvedValue({
            experience_id: 'exp1',
            competence_id: 'comp1',
            niveau: '1',
        });

        const result = await lierCompetenceExperience(
            txMock,
            'exp1',
            'etu1',
            '  NODE.JS  ',
            TypeCompetence.technologie
        );

        expect(txMock.competence.findFirst).toHaveBeenCalledWith({
            where: {
                nom: 'Node.js',
                type: TypeCompetence.technologie,
            },
        });

        expect(txMock.competence.create).toHaveBeenCalledWith({
            data: {
                type: TypeCompetence.technologie,
                nom: 'Node.js',
            },
        });

        expect(txMock.competenceDeveloppee.create).toHaveBeenCalledWith({
            data: {
                experience_id: 'exp1',
                competence_id: 'comp1',
                niveau: '1',
            },
        });

        expect(result).toEqual({
            experience_id: 'exp1',
            competence_id: 'comp1',
            niveau: '1',
        });
    });

    it('réutilise une compétence existante', async () => {
        txMock.competence.findFirst.mockResolvedValue({
            competence_id: 'comp1',
            nom: 'React',
            type: TypeCompetence.technologie,
        });

        txMock.competenceDeveloppee.count.mockResolvedValue(0);

        txMock.competenceDeveloppee.create.mockResolvedValue({
            experience_id: 'exp1',
            competence_id: 'comp1',
            niveau: '1',
        });

        await lierCompetenceExperience(
            txMock,
            'exp1',
            'etu1',
            'react',
            TypeCompetence.technologie
        );

        expect(txMock.competence.create).not.toHaveBeenCalled();

        expect(txMock.competenceDeveloppee.create).toHaveBeenCalledWith({
            data: {
                experience_id: 'exp1',
                competence_id: 'comp1',
                niveau: '1',
            },
        });
    });

    it('augmente le niveau si l’étudiant possède déjà cette compétence', async () => {
        txMock.competence.findFirst.mockResolvedValue({
            competence_id: 'comp1',
            nom: 'Vue.js',
            type: TypeCompetence.technologie,
        });

        txMock.competenceDeveloppee.count.mockResolvedValue(2);

        txMock.competenceDeveloppee.create.mockResolvedValue({
            experience_id: 'exp3',
            competence_id: 'comp1',
            niveau: '3',
        });

        await lierCompetenceExperience(
            txMock,
            'exp3',
            'etu1',
            'vue.js',
            TypeCompetence.technologie
        );

        expect(txMock.competenceDeveloppee.updateMany).toHaveBeenCalledWith({
            where: {
                competence_id: 'comp1',
                experience: {
                    utilisateur_id: 'etu1',
                },
            },
            data: {
                niveau: '3',
            },
        });

        expect(txMock.competenceDeveloppee.create).toHaveBeenCalledWith({
            data: {
                experience_id: 'exp3',
                competence_id: 'comp1',
                niveau: '3',
            },
        });
    });

    it('lance une erreur si le type est invalide', async () => {
        await expect(
            lierCompetenceExperience(
                txMock,
                'exp1',
                'etu1',
                'Node.js',
                'invalid_type'
            )
        ).rejects.toThrow('Type de compétence invalide');

        expect(txMock.competence.findFirst).not.toHaveBeenCalled();
    });

    it('lie plusieurs compétences à une expérience', async () => {
        txMock.competence.findFirst
            .mockResolvedValueOnce({
                competence_id: 'comp1',
                nom: 'Node.js',
                type: TypeCompetence.technologie,
            })
            .mockResolvedValueOnce({
                competence_id: 'comp2',
                nom: 'React',
                type: TypeCompetence.technologie,
            });

        txMock.competenceDeveloppee.count.mockResolvedValue(0);

        txMock.competenceDeveloppee.create
            .mockResolvedValueOnce({
                experience_id: 'exp1',
                competence_id: 'comp1',
                niveau: '1',
            })
            .mockResolvedValueOnce({
                experience_id: 'exp1',
                competence_id: 'comp2',
                niveau: '1',
            });

        const result = await lierCompetencesExperience(
            txMock,
            'exp1',
            'etu1',
            ['node.js', 'react'],
            TypeCompetence.technologie
        );

        expect(result).toHaveLength(2);
        expect(txMock.competenceDeveloppee.create).toHaveBeenCalledTimes(2);
    });

    it('supprime les compétences développées et réduit le niveau restant', async () => {
        txMock.competenceDeveloppee.findMany
            .mockResolvedValueOnce([
                { competence_id: 'comp1' },
                { competence_id: 'comp2' },
            ])
            .mockResolvedValueOnce([{ experience_id: 'exp2', niveau: '2' }])
            .mockResolvedValueOnce([{ experience_id: 'exp3', niveau: '1' }]);

        txMock.competenceDeveloppee.deleteMany.mockResolvedValue({
            count: 2,
        });

        await supprimerCompetencesDeveloppees(txMock, 'exp1', 'etu1');

        expect(txMock.competenceDeveloppee.deleteMany).toHaveBeenCalledWith({
            where: {
                experience_id: 'exp1',
            },
        });

        expect(txMock.competenceDeveloppee.updateMany).toHaveBeenCalledWith({
            where: {
                competence_id: 'comp1',
                experience: {
                    utilisateur_id: 'etu1',
                },
            },
            data: {
                niveau: '1',
            },
        });

        expect(txMock.competenceDeveloppee.updateMany).toHaveBeenCalledWith({
            where: {
                competence_id: 'comp2',
                experience: {
                    utilisateur_id: 'etu1',
                },
            },
            data: {
                niveau: '1',
            },
        });
    });

    it('ne fait pas updateMany s’il ne reste aucune liaison', async () => {
        txMock.competenceDeveloppee.findMany
            .mockResolvedValueOnce([{ competence_id: 'comp1' }])
            .mockResolvedValueOnce([]);

        await supprimerCompetencesDeveloppees(txMock, 'exp1', 'etu1');

        expect(txMock.competenceDeveloppee.deleteMany).toHaveBeenCalledWith({
            where: {
                experience_id: 'exp1',
            },
        });

        expect(txMock.competenceDeveloppee.updateMany).not.toHaveBeenCalled();
    });

    it('retourne les technologies et les domaines séparément', async () => {
        prismaMock.competenceDeveloppee.findMany.mockResolvedValue([
            {
                niveau: '2',
                competence: {
                    competence_id: 'comp1',
                    nom: 'Node.js',
                    type: TypeCompetence.technologie,
                },
            },
            {
                niveau: '1',
                competence: {
                    competence_id: 'comp2',
                    nom: 'Backend',
                    type: TypeCompetence.domaine,
                },
            },
        ]);

        const result = await getCompetencesByExperience('exp1');

        expect(prismaMock.competenceDeveloppee.findMany).toHaveBeenCalledWith({
            where: {
                experience_id: 'exp1',
            },
            include: {
                competence: true,
            },
        });

        expect(result).toEqual({
            technologies: [
                {
                    competence_id: 'comp1',
                    nom: 'Node.js',
                    niveau: '2',
                },
            ],
            domaines: [
                {
                    competence_id: 'comp2',
                    nom: 'Backend',
                    niveau: '1',
                },
            ],
        });
    });
});