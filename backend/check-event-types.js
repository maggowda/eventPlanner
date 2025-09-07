// check-event-types.js - Check what event types are allowed
import { supabase } from './src/config/database.js';

async function checkEventTypes() {
  try {
    console.log('Checking allowed event types...');
    
    // Try to get the constraint information
    const { data, error } = await supabase
      .from('information_schema.check_constraints')
      .select('*')
      .eq('constraint_name', 'events_type_check');
    
    if (error) {
      console.log('Cannot get constraint info:', error.message);
    } else {
      console.log('Constraint data:', data);
    }
    
    // Let's try different event types to see which ones work
    const testTypes = ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Conference', 'Webinar', 'Meeting', 'Training'];
    
    console.log('\nTesting different event types...');
    
    for (const type of testTypes) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('events')
          .insert([{
            college_id: 1,
            name: `Test ${type} Event`,
            type: type,
            date: '2025-09-15',
            time: '10:00:00',
            location: 'Test Location',
            organizer: 'Test Organizer'
          }])
          .select()
          .single();
        
        if (testError) {
          console.log(`❌ ${type}: ${testError.message}`);
        } else {
          console.log(`✅ ${type}: Works!`);
          // Delete the test event
          await supabase.from('events').delete().eq('event_id', testData.event_id);
        }
      } catch (e) {
        console.log(`❌ ${type}: ${e.message}`);
      }
    }
    
  } catch (err) {
    console.error('Script error:', err.message);
  }
}

checkEventTypes();
