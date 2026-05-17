import { createClient } from '@supabase/supabase-js';

/*
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR: SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans .env');
  process.exit(1);
}
*/

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERREUR: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  //process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);