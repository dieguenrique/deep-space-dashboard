import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wxbqmafjbkkapvichwvt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4YnFtYWZqYmtrYXB2aWNod3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzM1MzYsImV4cCI6MjA3MTcwOTUzNn0.fZ-1DXJjRwPQiYN1Z-j6vHtgNg9-hJw6MwUyqZIF8pM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
