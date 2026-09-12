import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yhfebrarkrplfyifscpe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmVicmFya3JwbGZ5aWZzY3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODkyMzAsImV4cCI6MjEwMzY2NTIzMH0.WIBm1oYfFvTPDGfFvuR2-bUeTTA_LPU5-JzZ0V_xkwo';

console.log('--- SUPABASE DEBUG ---');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Resolved supabaseUrl:', supabaseUrl);
console.log('----------------------');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
