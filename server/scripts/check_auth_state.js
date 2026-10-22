import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testAuth() {
  console.log('Testing Supabase Auth with existing user or inspecting limits...');
  
  // Try logging in with the test user we created earlier or harpreet
  const candidates = [
    { email: 'harpreet.singh@farmmesh.in', password: 'GreenFarmer2026!#' },
    { email: 'farmer@farmmesh.in', password: 'GreenFarmer2026!#' }
  ];

  for (const c of candidates) {
    const { data, error } = await supabase.auth.signInWithPassword(c);
    if (error) {
      console.log(`Login attempt for ${c.email}:`, error.message);
    } else {
      console.log(`✅ Success logging in as ${c.email}! User ID:`, data.user?.id);
    }
  }
}

testAuth();
