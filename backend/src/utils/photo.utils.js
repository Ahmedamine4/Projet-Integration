import { supabase } from '../config/supabase.js';
import path from 'path';


const genererNomFichier = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
};

export const uploadPhoto = async (file, bucket) => {
  const fileName = genererNomFichier(file.originalname);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error('Erreur upload photo : ' + error.message);

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const supprimerPhoto = async (photoUrl, bucket) => {
  if (!photoUrl) return;

  const fileName = photoUrl.split(`/${bucket}/`)[1];
  if (!fileName) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) console.error(`Erreur suppression photo [${bucket}]:`, error.message);
};

// Upload une nouvelle photo et supprime l'ancienne si elle existe
export const remplacerPhoto = async (file, anciennePhotoUrl, bucket) => {
  const nouvelleUrl = await uploadPhoto(file, bucket);
  await supprimerPhoto(anciennePhotoUrl, bucket);
  return nouvelleUrl;
};