import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding database...\n');

  // Test connection first
  const { data: testData, error: testError } = await supabase.from('rigs').select('*').limit(1);
  if (testError) {
    console.error('Connection test failed:', JSON.stringify(testError, null, 2));
    console.error('Full error:', testError);
    return;
  }
  console.log('✓ Connection OK. Existing rigs:', testData?.length || 0);

  // Insert rigs
  const { data: rigs, error: rigsError } = await supabase
    .from('rigs')
    .insert([
      { name: 'Rig 001 (Comacchio)' },
      { name: 'Rig 002 (Atlas Copco)' },
      { name: 'Rig 003 (Bauer BG)' },
    ])
    .select();

  if (rigsError) {
    console.error('Error inserting rigs:', JSON.stringify(rigsError, null, 2));
    console.error('Code:', rigsError.code, 'Details:', rigsError.details, 'Hint:', rigsError.hint);
  } else {
    console.log('✓ Rigs inserted:', rigs?.length || 0);
  }

  // Insert crew members
  const { data: crew, error: crewError } = await supabase
    .from('crew_members')
    .insert([
      { name: 'John Smith', role: 'Lead Driller' },
      { name: 'Sarah Johnson', role: 'Second Man' },
      { name: 'Mike Chen', role: 'Supervisor' },
      { name: 'Tom Wilson', role: 'Lead Driller' },
      { name: 'Emma Davis', role: 'Second Man' },
    ])
    .select();

  if (crewError) {
    console.error('Error inserting crew members:', JSON.stringify(crewError, null, 2));
  } else {
    console.log('✓ Crew members inserted:', crew?.length || 0);
  }

  // Insert drill bits
  const { data: bits, error: bitsError } = await supabase
    .from('drill_bits')
    .insert([
      { serial_number: 'SN-B555', type: 'PDC 150mm', status: 'Available' },
      { serial_number: 'SN-B556', type: 'PDC 150mm', status: 'Available' },
      { serial_number: 'SN-C221', type: 'Tricone 200mm', status: 'Available' },
      { serial_number: 'SN-C222', type: 'Tricone 200mm', status: 'Available' },
      { serial_number: 'SN-D100', type: 'Diamond Core 100mm', status: 'Available' },
    ])
    .select();

  if (bitsError) {
    console.error('Error inserting drill bits:', JSON.stringify(bitsError, null, 2));
  } else {
    console.log('✓ Drill bits inserted:', bits?.length || 0);
  }

  console.log('\nSeeding complete!');
}

seed().catch(console.error);
