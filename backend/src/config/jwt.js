import jwt from 'jsonwebtoken';

export function generateLocalToken(user) {
  
  // On cherche l'ID (qu'il s'appelle utilisateur_id ou id)
  const userId = user.utilisateur_id || user.id;
  const payload = {
    id: userId,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

//verifier le token que le client envoie dans les requetes
export function verifyLocalToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}