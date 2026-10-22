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

async function checkStorage() {
  console.log('Checking Supabase Storage buckets...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('listBuckets error:', error.message);
    } else {
      console.log('Existing buckets:', buckets.map(b => b.name));
      const exists = buckets.find(b => b.name === 'plant-disease-images');
      if (!exists) {
        console.log('Attempting to create bucket `plant-disease-images`...');
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('plant-disease-images', {
          public: false, // private storage as requested in Section 9
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        });
        if (createError) {
          console.warn('Bucket creation note:', createError.message);
        } else {
          console.log('✅ Bucket `plant-disease-images` created successfully!');
        }
      } else {
        console.log('✅ Bucket `plant-disease-images` already exists.');
      }
    }
  } catch (err) {
    console.error('Storage check exception:', err);
  }

  // Check `plant_detections` table
  console.log('\nChecking `plant_detections` table...');
  try {
    const { data, error } = await supabase.from('plant_detections').select('*').limit(1);
    if (error) {
      console.log('plant_detections check result:', error.code, error.message);
    } else {
      console.log('✅ `plant_detections` table exists and accessible. Rows:', data?.length);
    }
  } catch (err) {
    console.error('Table check exception:', err);
  }
}

checkStorage();
