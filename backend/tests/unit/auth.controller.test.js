import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ce mock remplace la fonction JWT de creation de token.
// Mock du module JWT :
// on remplace la vraie fonction qui genere un token
// par une fausse fonction controlee dans les tests.
vi.mock('../../src/config/jwt.js', () => ({
  generateLocalToken: vi.fn(),
}));

// Ce mock remplace Supabase pour simuler un token Google valide ou invalide.
// Mock de Supabase :
// cela evite un vrai appel externe et permet de simuler
// un token Google valide ou invalide.
vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Ce mock remplace la couche service.
// Le but est de tester le controller seul.
// Mock des fonctions du service auth :
// ici on ne veut pas tester la vraie logique metier,
// seulement le comportement du controller.
vi.mock('../../src/services/auth.service.js', () => ({
  registerLocalUser: vi.fn(),
  loginLocalUser: vi.fn(),
  syncGoogleUser: vi.fn(),
  getPublicUserById: vi.fn(),
  getAllPublicUsers: vi.fn(),
  findUserByEmail: vi.fn(),
}));

// On importe les fonctions mockees pour definir leur reponse
// dans chaque test.
import { generateLocalToken } from '../../src/config/jwt.js';
import { supabase } from '../../src/config/supabase.js';
import {
  findUserByEmail,
  getAllPublicUsers,
  getPublicUserById,
  loginLocalUser,
  registerLocalUser,
  syncGoogleUser,
} from '../../src/services/auth.service.js';
import {
  getAllUsers,
  getProfile,
  googleAuth,
  login,
  register,
} from '../../src/controllers/auth.controller.js';

// Petite fonction utilitaire :
// elle imite l'objet "res" d'Express avec status() et json().
// mockReturnThis() permet d'ecrire :
// res.status(...).json(...)
function createResponseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('auth.controller', () => {
  beforeEach(() => {
    // On nettoie les mocks avant chaque test
    // pour que les appels precedents n'influencent pas le test suivant.
    vi.clearAllMocks();
  });

  it('register retourne 201 avec le user public et le token', async () => {
    // Le controller doit renvoyer la bonne reponse apres inscription.
    // req represente la requete recue par Express.
    const req = {
      body: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: 'Password123',
      },
    };
    const res = createResponseMock();

    registerLocalUser.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });
    // Ici on choisit nous-memes la valeur du token renvoyee par le mock.
    generateLocalToken.mockReturnValue('local-token');

    // On execute la fonction du controller comme si Express l'appelait.
    await register(req, res);

    // On verifie le code HTTP de la reponse.
    expect(res.status).toHaveBeenCalledWith(201);
    // On verifie le contenu JSON envoye au client.
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Inscription réussie',
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
  });

  it('register retourne 400 si le service echoue', async () => {
    // Une erreur metier simple devient une reponse 400.
    const req = { body: {} };
    const res = createResponseMock();

    // mockRejectedValue simule une erreur levee par le service.
    registerLocalUser.mockRejectedValue(new Error('Email déjà utilisé'));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Email déjà utilisé',
    });
  });

  it('login retourne 200 avec provider local et token', async () => {
    // Le controller renvoie le resultat du login local.
    const req = {
      body: {
        email: 'jane@test.com',
        password: 'Password123',
      },
    };
    const res = createResponseMock();

    // Le service mocke renvoie directement le resultat attendu.
    loginLocalUser.mockResolvedValue({
      token: 'local-token',
      user: {
        utilisateur_id: 'u1',
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane@test.com',
        role: 'etudiant',
        provider: 'local',
      },
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Connexion réussie',
      provider: 'local',
      token: 'local-token',
      user: {
        utilisateur_id: 'u1',
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane@test.com',
        role: 'etudiant',
        provider: 'local',
      },
    });
  });

  it('login retourne 401 si le mot de passe est faux', async () => {
    // Un echec de connexion doit renvoyer 401.
    const req = { body: { email: 'jane@test.com', password: 'wrong' } };
    const res = createResponseMock();

    loginLocalUser.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Email ou mot de passe incorrect',
    });
  });

  it('googleAuth retourne 401 si le token Google est absent', async () => {
    // Sans token Google, la route doit refuser la requete.
    const req = { body: {}, headers: {} };
    const res = createResponseMock();

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Google d'authentification manquant",
    });
  });

  it('googleAuth retourne 403 si le token Google est invalide', async () => {
    // Si Supabase refuse le token, on renvoie 403.
    const req = { body: { access_token: 'bad-token' }, headers: {} };
    const res = createResponseMock();

    // On simule ici la reponse de Supabase avec un user nul.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid'),
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Google d'authentification invalide ou expiré",
    });
  });

  it('googleAuth retourne 200 avec provider google et token local', async () => {
    // Si le token Google est valide, on connecte l'utilisateur.
    // Le backend genere ensuite son propre token local.
    const req = { body: { access_token: 'good-token' }, headers: {} };
    const res = createResponseMock();

    // Cette ligne simule un token Google accepte par Supabase.
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'google@test.com',
          user_metadata: {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      },
      error: null,
    });
    // null veut dire : aucun compte local deja existant avec cet email.
    findUserByEmail.mockResolvedValue(null);
    // Cette fonction simule la creation ou mise a jour du user Google.
    syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });
    generateLocalToken.mockReturnValue('google-local-token');

    await googleAuth(req, res);

    // On verifie les donnees envoyees du controller vers le service.
    expect(syncGoogleUser).toHaveBeenCalledWith({
      sub: 'google-uid',
      email: 'google@test.com',
      user_metadata: {
        given_name: 'John',
        family_name: 'Doe',
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Authentification Google réussie',
      provider: 'google',
      user: {
        utilisateur_id: 'u2',
        nom: 'Doe',
        prenom: 'John',
        email: 'google@test.com',
        role: 'etudiant',
        provider: 'google',
      },
      token: 'google-local-token',
    });
  });

  it('googleAuth evite un doublon si un compte local existe deja', async () => {
    // On bloque la creation d'un doublon sur un email local existant.
    const req = { body: { access_token: 'good-token' }, headers: {} };
    const res = createResponseMock();

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'local@test.com',
          user_metadata: {},
        },
      },
      error: null,
    });
    findUserByEmail.mockResolvedValue({
      utilisateur_id: 'u9',
      email: 'local@test.com',
      provider: 'local',
    });

    await googleAuth(req, res);

    expect(syncGoogleUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Un compte avec cet email existe déjà. Veuillez utiliser la connexion locale.',
    });
  });

  it('googleAuth retourne 500 si syncGoogleUser echoue', async () => {
    // Si la synchronisation du compte Google echoue,
    // le controller doit renvoyer une erreur serveur.
    const req = { body: { access_token: 'good-token' }, headers: {} };
    const res = createResponseMock();

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'google@test.com',
          user_metadata: {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      },
      error: null,
    });
    findUserByEmail.mockResolvedValue(null);
    syncGoogleUser.mockRejectedValue(new Error('Erreur sync Google'));

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Erreur sync Google',
    });
  });

  it('getProfile retourne le profil public', async () => {
    // Le controller lit le user connecte et renvoie son profil.
    // Ici, req.user est normalement rempli par le middleware d'authentification.
    const req = {
      user: {
        utilisateur_id: 'u1',
        provider: 'local',
      },
    };
    const res = createResponseMock();

    // Le service renvoie ici le profil public du user.
    getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });

    await getProfile(req, res);

    // On verifie que le controller demande le bon utilisateur.
    expect(getPublicUserById).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfile retourne 404 si le user est introuvable', async () => {
    // Si le profil n'existe pas, on renvoie 404.
    const req = {
      user: {
        utilisateur_id: 'u404',
        provider: 'local',
      },
    };
    const res = createResponseMock();

    getPublicUserById.mockResolvedValue(null);

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  });

  it('getProfile retourne 500 si getPublicUserById echoue', async () => {
    // Si le service echoue pendant la lecture du profil,
    // le controller doit renvoyer une erreur serveur.
    const req = {
      user: {
        utilisateur_id: 'u1',
        provider: 'local',
      },
    };
    const res = createResponseMock();

    getPublicUserById.mockRejectedValue(new Error('Erreur profil'));

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Erreur profil',
    });
  });

  it('getAllUsers retourne la liste des utilisateurs publics', async () => {
    // La route admin renvoie une liste simple des users.
    const req = {};
    const res = createResponseMock();

    getAllPublicUsers.mockResolvedValue([
      {
        utilisateur_id: 'u1',
        email: 'user@test.com',
      },
    ]);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users: [
        {
          utilisateur_id: 'u1',
          email: 'user@test.com',
        },
      ],
    });
  });

  it('getAllUsers retourne 500 si getAllPublicUsers echoue', async () => {
    // Si la lecture de la liste des utilisateurs echoue,
    // le controller doit renvoyer une erreur serveur.
    const req = {};
    const res = createResponseMock();

    getAllPublicUsers.mockRejectedValue(new Error('Erreur liste users'));

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Erreur liste users',
    });
  });
});
