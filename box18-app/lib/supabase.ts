import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseConfig';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
