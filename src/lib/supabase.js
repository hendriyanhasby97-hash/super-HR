import { createClient } from '@supabase/supabase-js';

// Mengambil variabel dari environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inisialisasi client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
