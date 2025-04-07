import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhzezqsmwaapllnqfvkf.supabase.co'; // replace with yours
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oemV6cXNtd2FhcGxsbnFmdmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODk1NDcsImV4cCI6MjA1OTU2NTU0N30.z5msEmmuakK66NhLKEs7jus4yXc3HxcFedcOzzuq2DY'; // replace with yours

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
