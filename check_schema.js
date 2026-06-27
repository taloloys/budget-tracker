const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://roiqhplchhgiglhqgsao.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXFocGxjaGhnaWdsaHFnc2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDg5NDQsImV4cCI6MjA5ODA4NDk0NH0.FX-BRJAN096Q-N2eeW_bHSPK-0FDH3OjCn6GvEAIhcI'
);

async function checkColumns() {
  const { data, error } = await supabase.from('budget_spaces').select('*').limit(0);
  console.log('Error if any:', error);
  // Supabase postgrest doesn't expose columns directly if empty, but we can query information_schema if we had direct DB access.
  // We can try to insert a fake record and see the error to glean schema.
  const { error: insertError } = await supabase.from('budget_spaces').insert([{ name: 'test', is_shared: true }]);
  console.log('Insert Error:', insertError);
}

checkColumns();
