import { createClient } from "@supabase/supabase-js";

export const getSupabaseClient = () => {
  const supabaseUrl = "https://hqqvtakmyvucbyjdoulf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcXZ0YWtteXZ1Y2J5amRvdWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzAzMTUsImV4cCI6MjA5MTMwNjMxNX0.KFeHrnkT1gy0zbPo61FrW0YTW1KkrzJNcu1wS1FYFQM";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anon key are required");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};