const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://roiqhplchhgiglhqgsao.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXFocGxjaGhnaWdsaHFnc2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDg5NDQsImV4cCI6MjA5ODA4NDk0NH0.FX-BRJAN096Q-N2eeW_bHSPK-0FDH3OjCn6GvEAIhcI'
);

async function checkData() {
  const { data: spaces, error: spacesError } = await supabase.from('budget_spaces').select('*');
  console.log('Budget Spaces:', spaces, spacesError);

  const { data: members, error: membersError } = await supabase.from('space_members').select('*');
  console.log('Space Members:', members, membersError);
}

checkData();
