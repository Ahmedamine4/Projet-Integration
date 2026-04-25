import jwt from 'jsonwebtoken';
 export function generateLocalToken(user) {
   return jwt.sign( {
     id: user.utilisateur_id,
     email: user.email,
      role: user.role,
   },
   process.env.JWT_SECRET,
   { 
   expiresIn: process.env.JWT_EXPIRES||'2h'
  }
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