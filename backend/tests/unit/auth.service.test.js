import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ce mock remplace bcryptjs pour eviter de vrais calculs de hash.
// Mock de bcrypt :
// on ne calcule pas de vrai hash dans les tests,
// on simule seulement hash() et compare().
vi.mock('bcryptjs', () => ({
  default: {
    // hash() simule le hashage d'un mot de passe.
    hash: vi.fn(),
    // compare() simule la comparaison mot de passe / hash.
    compare: vi.fn(),
  },
}));

// Ce mock remplace Prisma pour eviter la vraie base de donnees.
// Mock de Prisma :
// on evite la vraie base de donnees et on controle
// les reponses de findUnique, create, update et findMany.
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    utilisateur: {
      // Chercher un seul utilisateur.
      findUnique: vi.fn(),
      // Creer un utilisateur.
      create: vi.fn(),
      // Modifier un utilisateur.
      update: vi.fn(),
      // Lire plusieurs utilisateurs.
      findMany: vi.fn(),
    },
  },
}));

// Ce mock remplace la fonction de creation du token JWT.
// Mock de la generation du token backend.
vi.mock('../../src/config/jwt.js', () => ({
  generateLocalToken: vi.fn(),
}));

// Ces imports pointent vers les versions mockees declarees ci-dessus.
import bcrypt from 'bcryptjs';
import prisma from '../../src/config/prisma.js';
import { generateLocalToken } from '../../src/config/jwt.js';
import {
  getAllPublicUsers,
  getPublicUserById,
  loginLocalUser,
  registerLocalUser,
  sanitizeUser,
  syncGoogleUser,
} from '../../src/services/auth.service.js';

// Cette suite teste la logique metier pure.
// Ici, on ne teste pas Express ni les routes HTTP.
// On teste seulement le comportement des fonctions du service.
describe('auth.service', () => {
  beforeEach(() => {
    // On remet tous les mocks a zero avant chaque test.
    vi.clearAllMocks();
  });

  it('sanitizeUser supprime le mot de passe', () => {
    // On verifie que le mot de passe ne sort jamais du service.
    // Cet objet represente un utilisateur complet venant de la base.
    const user = {
      utilisateur_id: 'u1',
      email: 'test@mail.com',
      mot_de_passe: 'secret',
    };

    // On appelle la fonction a tester.
    const result = sanitizeUser(user);

    // On attend un objet sans le champ mot_de_passe.
    expect(result).toEqual({
      utilisateur_id: 'u1',
      email: 'test@mail.com',
    });
    expect(result.mot_de_passe).toBeUndefined();
  });

  it('registerLocalUser cree un utilisateur local avec le role etudiant', async () => {
    // On simule une inscription valide.
    // Le but est de verifier :
    // - le hash du mot de passe
    // - le role par defaut
    // - le provider local
    // Cette ligne dit : quand bcrypt.hash est appele,
    // il renvoie "hashed-password".
    bcrypt.hash.mockResolvedValue('hashed-password');
    // Aucun utilisateur n'existe deja avec cet email.
    prisma.utilisateur.findUnique.mockResolvedValue(null);
    // On simule la creation en base avec le resultat attendu.
    prisma.utilisateur.create.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });

    // On appelle la vraie fonction du service.
    const result = await registerLocalUser({
      firstName: 'Jane',
      lastName: 'Doe',
      email: '  JANE@Test.com  ',
      password: 'Password123',
    });

    // On verifie que le mot de passe a bien ete hashé.
    expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
    expect(prisma.utilisateur.create).toHaveBeenCalledWith({
      data: {
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane@test.com',
        mot_de_passe: 'hashed-password',
        role: 'etudiant',
        provider: 'local',
      },
      select: {
        utilisateur_id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        provider: true,
      },
    });
    expect(result).toEqual({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });
  });

  it('registerLocalUser refuse un email deja utilise', async () => {
    // On simule un email deja present en base.
    // Le service doit alors refuser l'inscription.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'used@test.com',
    });

    await expect(
      registerLocalUser({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'used@test.com',
        password: 'Password123',
      })
    ).rejects.toThrow('Email déjà utilisé');
  });

  it('registerLocalUser refuse des champs invalides', async () => {
    // On teste les 3 validations principales de l'inscription.
    // L'idee est de verifier que le service bloque
    // les donnees mauvaises avant toute creation en base.
    await expect(
      registerLocalUser({
        firstName: '',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: 'Password123',
      })
    ).rejects.toThrow('Tous les champs sont requis');

    await expect(
      registerLocalUser({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janetest.com',
        password: 'Password123',
      })
    ).rejects.toThrow('Email invalide');

    await expect(
      registerLocalUser({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: '1234567',
      })
    ).rejects.toThrow('Mot de passe trop court');
  });

  it('loginLocalUser retourne un token et un user sans mot de passe', async () => {
    // On simule un login local valide.
    // On veut verifier que :
    // - bcrypt.compare est bien utilise
    // - un token local est genere
    // - le mot de passe n'est pas renvoye
    // findUnique renvoie ici le user trouve par email.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      mot_de_passe: 'hashed-password',
      role: 'etudiant',
      provider: 'local',
    });
    // true veut dire : le mot de passe donne correspond bien au hash stocke.
    bcrypt.compare.mockResolvedValue(true);
    // On force ici le token renvoye pour pouvoir le verifier facilement.
    generateLocalToken.mockReturnValue('local-token');

    const result = await loginLocalUser({
      email: 'jane@test.com',
      password: 'Password123',
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashed-password');
    // Le token est cree a partir de l'id, de l'email et du role.
    expect(generateLocalToken).toHaveBeenCalledWith({
      id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
    });
    // Le resultat final contient le user public et le token.
    expect(result).toEqual({
      user: {
        utilisateur_id: 'u1',
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane@test.com',
        role: 'etudiant',
        provider: 'local',
      },
      token: 'local-token',
    });
    expect(result.user.mot_de_passe).toBeUndefined();
  });

  it('loginLocalUser refuse un mauvais mot de passe', async () => {
    // Le user existe mais le mot de passe est faux.
    // Le service doit renvoyer une erreur de connexion.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'jane@test.com',
      mot_de_passe: 'hashed-password',
      role: 'etudiant',
      provider: 'local',
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginLocalUser({
        email: 'jane@test.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Email ou mot de passe incorrect');
  });

  it('loginLocalUser refuse un email inexistant', async () => {
    // Aucun utilisateur n'est trouve pour cet email.
    // Le service doit renvoyer la meme erreur que pour un mauvais mot de passe.
    prisma.utilisateur.findUnique.mockResolvedValue(null);

    await expect(
      loginLocalUser({
        email: 'unknown@test.com',
        password: 'Password123',
      })
    ).rejects.toThrow('Email ou mot de passe incorrect');
  });

  it('loginLocalUser refuse un compte cree avec Google', async () => {
    // Ici le compte existe, mais son provider est Google.
    // Le login local ne doit donc pas etre autorise.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u5',
      email: 'google@test.com',
      mot_de_passe: null,
      role: 'etudiant',
      provider: 'google',
    });

    await expect(
      loginLocalUser({
        email: 'google@test.com',
        password: 'Password123',
      })
    ).rejects.toThrow('Utiliser Google pour se connecter');
  });

  it('syncGoogleUser cree un utilisateur google si email inconnu', async () => {
    // Premier login Google: on cree un compte local.
    // Cela permet d'associer un compte backend a un compte Google valide.
    // 1er appel : recherche par supabase_uid
    // 2e appel : recherche par email
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    // On simule le nouvel utilisateur cree en base.
    prisma.utilisateur.create.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });

    // On appelle la fonction qui gere la synchronisation Google.
    const result = await syncGoogleUser({
      sub: 'google-uid',
      email: 'google@test.com',
      user_metadata: {
        given_name: 'John',
        family_name: 'Doe',
      },
    });

    expect(prisma.utilisateur.create).toHaveBeenCalledWith({
      data: {
        nom: 'Doe',
        prenom: 'John',
        email: 'google@test.com',
        provider: 'google',
        supabase_uid: 'google-uid',
        role: 'etudiant',
      },
      select: {
        utilisateur_id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        provider: true,
      },
    });
    expect(result).toEqual({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });
  });

  it('syncGoogleUser refuse un token Google sans sub', async () => {
    // Sans identifiant unique Google, le service doit refuser le token.
    await expect(
      syncGoogleUser({
        email: 'google@test.com',
        user_metadata: {},
      })
    ).rejects.toThrow('Token Google invalide');
  });

  it('syncGoogleUser ne cree pas de doublon si le user google existe deja', async () => {
    // Si le compte Google existe deja, on le reutilise.
    // On verifie donc qu'aucune creation supplementaire n'est faite.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u3',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
      supabase_uid: 'google-uid',
      mot_de_passe: null,
    });

    const result = await syncGoogleUser({
      sub: 'google-uid',
      email: 'google@test.com',
      user_metadata: {},
    });

    expect(prisma.utilisateur.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      utilisateur_id: 'u3',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
      supabase_uid: 'google-uid',
    });
  });

  it('syncGoogleUser lie un compte local existant au compte Google', async () => {
    // Le meme email existe deja en local.
    // Le service doit lier le compte existant au lieu d'en creer un nouveau.
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        utilisateur_id: 'u8',
        nom: 'Doe',
        prenom: 'Jane',
        email: 'same@test.com',
        role: 'etudiant',
        provider: 'local',
        supabase_uid: null,
        mot_de_passe: 'hashed-password',
      });
    prisma.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'u8',
      supabase_uid: 'google-uid',
      provider: 'google',
    });

    const result = await syncGoogleUser({
      sub: 'google-uid',
      email: 'same@test.com',
      user_metadata: {
        given_name: 'Jane',
        family_name: 'Doe',
      },
    });

    expect(prisma.utilisateur.create).not.toHaveBeenCalled();
    expect(prisma.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u8' },
      data: {
        supabase_uid: 'google-uid',
        provider: 'google',
      },
    });
    expect(result).toEqual({
      utilisateur_id: 'u8',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'same@test.com',
      role: 'etudiant',
      provider: 'local',
      supabase_uid: null,
    });
  });

  it('getPublicUserById demande seulement les champs publics', async () => {
    // On verifie que le select Prisma reste securise.
    // Les champs sensibles ne doivent pas etre demandes.
    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'jane@test.com',
    });

    await getPublicUserById('u1');

    expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      select: {
        utilisateur_id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        provider: true,
      },
    });
  });

  it('getAllPublicUsers demande seulement les champs publics', async () => {
    // On verifie que la liste publique ne prend que les champs utiles.
    prisma.utilisateur.findMany.mockResolvedValue([]);

    await getAllPublicUsers();

    expect(prisma.utilisateur.findMany).toHaveBeenCalledWith({
      select: {
        utilisateur_id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        provider: true,
      },
    });
  });
});
