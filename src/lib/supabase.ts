import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bhlhoodsajtnkjfbcddp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobGhvb2RzYWp0bmtqZmJjZGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDQzMDYsImV4cCI6MjA4ODM4MDMwNn0.5Y_lf6qQcF2MLXapie-gx99hWUq8nX1QPIv-o_wsF7E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
