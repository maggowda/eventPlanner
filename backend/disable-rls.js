// disable-rls.js - Check RLS status and try to disable
import { supabase } from './src/config/database.js';

async function checkAndDisableRLS() {
  try {
    console.log('Checking RLS status and policies...');
    
    // Try to check if we can query the events table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'events')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('Cannot access table information:', tableError.message);
    } else {
      console.log('Table exists:', tableInfo?.length > 0);
    }
    
    // Try a direct SQL query to disable RLS
    const { data, error } = await supabase
      .sql`ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;`;
    
    if (error) {
      console.error('❌ Cannot disable RLS programmatically:', error.message);
      console.log('\n🔧 MANUAL STEPS TO DISABLE RLS:');
      console.log('   1. Go to https://app.supabase.com');
      console.log('   2. Select your project');
      console.log('   3. Click "SQL Editor" in the left sidebar');
      console.log('   4. Run this SQL command:');
      console.log('      ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;');
      console.log('   5. Click "Run" button');
      console.log('\n   OR use Table Editor:');
      console.log('   1. Go to Table Editor > events table');
      console.log('   2. Click the settings/gear icon');
      console.log('   3. Turn OFF "Enable Row Level Security"');
    } else {
      console.log('✅ RLS disabled successfully!');
    }
  } catch (err) {
    console.error('❌ Script error:', err.message);
    console.log('\n🔧 Please disable RLS manually in Supabase dashboard');
  }
}

checkAndDisableRLS();
