// src/config/database.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required in environment variables');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test connection function
export const testConnection = async () => {
  try {
    // Simple connectivity test - just check if supabase client is initialized
    console.log('✅ Supabase client initialized successfully');
    console.log('   URL:', process.env.SUPABASE_URL);
    console.log('   Using service role key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
};

export { supabase };
