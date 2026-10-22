import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const BUCKET_NAME = 'plant-disease-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Validate plant leaf photo before upload
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select an image file to upload.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type "${file.type || 'unknown'}". Supported formats: JPG, PNG, and WEBP.`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`
    };
  }

  return { valid: true };
}

/**
 * Upload image to Supabase Storage, insert record into plant_detections,
 * run pathology AI analysis, and return full report with signed URL.
 */
export async function uploadAndAnalyzePlantImage({
  file,
  cropType = 'Crop Leaf Specimen',
  symptomNote = '',
  user,
  onStepChange
}) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!user || !user.id) {
    throw new Error('Authentication required to upload plant diagnostic images.');
  }

  const isConfigured = isSupabaseConfigured();
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const imageId = `${timestamp}_${Math.random().toString(36).slice(2, 8)}_${sanitizedName}`;
  const storagePath = `${user.id}/${imageId}`;

  let detectionRecordId = null;
  let signedImageUrl = null;

  try {
    // 1. Initial local preview
    const previewUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // 2. Insert initial pending record in Supabase PostgreSQL
    if (isConfigured && supabase) {
      if (onStepChange) onStepChange('Initializing secure database record...');

      const { data: newRecord, error: insertError } = await supabase
        .from('plant_detections')
        .insert({
          user_id: user.id,
          image_path: storagePath,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          crop_type: cropType,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '42P01' || insertError.message?.includes('does not exist') || insertError.code === 'PGRST205') {
          console.warn('plant_detections table not yet created in Supabase SQL editor.');
        } else {
          console.warn('Notice creating plant_detections record:', insertError.message);
        }
      } else if (newRecord) {
        detectionRecordId = newRecord.id;
      }

      // 3. Upload binary image to Supabase Storage bucket `plant-disease-images`
      if (onStepChange) onStepChange('Encrypting and uploading specimen to Supabase Storage...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.warn('Supabase storage upload note:', uploadError.message);
        // If upload failed, mark record as failed
        if (detectionRecordId) {
          await supabase
            .from('plant_detections')
            .update({ status: 'failed', details: { uploadError: uploadError.message } })
            .eq('id', detectionRecordId);
        }
      } else {
        // 4. Generate temporary signed URL for private image viewing (valid 1 hour)
        const { data: signedData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(storagePath, 3600);

        if (signedData?.signedUrl) {
          signedImageUrl = signedData.signedUrl;
        }
      }
    }

    // 5. Run Pathology Analysis API
    if (onStepChange) onStepChange('Running AI neural pathology scan & pathogen matching...');

    const res = await fetch('/api/crop-health/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptom: symptomNote || 'foliar examination',
        cropType,
        fileName: file.name,
        imagePath: storagePath
      })
    });

    if (!res.ok) {
      throw new Error(`Diagnosis service returned status ${res.status}`);
    }

    const { diagnosis } = await res.json();
    if (!diagnosis) {
      throw new Error('No diagnostic pathology model result returned.');
    }

    // 6. Update database record with diagnosis results
    if (isConfigured && supabase && detectionRecordId) {
      if (onStepChange) onStepChange('Persisting pathology diagnosis and treatment plan...');

      await supabase
        .from('plant_detections')
        .update({
          detected_disease: diagnosis.name,
          confidence: diagnosis.confidence,
          severity: diagnosis.severity,
          crop_type: cropType,
          status: 'completed',
          details: diagnosis,
          updated_at: new Date().toISOString()
        })
        .eq('id', detectionRecordId);
    }

    return {
      id: detectionRecordId || `local-${Date.now()}`,
      diagnosis,
      imagePath: storagePath,
      fileName: file.name,
      signedUrl: signedImageUrl || previewUrl,
      previewUrl,
      createdAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Plant detection error:', err);
    if (detectionRecordId && isConfigured && supabase) {
      try {
        await supabase
          .from('plant_detections')
          .update({
            status: 'failed',
            details: { error: err.message },
            updated_at: new Date().toISOString()
          })
          .eq('id', detectionRecordId);
      } catch {}
    }
    throw err;
  }
}

/**
 * Fetch real plant disease detection history for the authenticated user from Supabase
 */
export async function fetchUserDetectionHistory(userId) {
  if (!userId) return [];
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('plant_detections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST205') {
        return [];
      }
      console.warn('Error fetching plant detection history:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Generate signed URLs for private images
    const enriched = await Promise.all(
      data.map(async (item) => {
        let signedUrl = null;
        if (item.image_path) {
          try {
            const { data: signed } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(item.image_path, 3600);
            signedUrl = signed?.signedUrl || null;
          } catch {}
        }
        return {
          ...item,
          signedUrl
        };
      })
    );

    return enriched;
  } catch (err) {
    console.error('Failed to load detection history:', err);
    return [];
  }
}

/**
 * Delete a plant detection record and its image from Supabase Storage
 */
export async function deleteDetectionRecord(recordId, imagePath) {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    if (imagePath) {
      await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
    }

    const { error } = await supabase
      .from('plant_detections')
      .delete()
      .eq('id', recordId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete detection record:', err);
    throw err;
  }
}
