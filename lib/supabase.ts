import { createClient } from '@supabase/supabase-js';

// Use environment variables for configuration
// In a real deployment, these would be set in the Vercel/Netlify dashboard
const supabaseUrl = "https://ogjnekgrwidjpzsawivm.supabase.co";
const supabaseAnonKey = "sb_publishable_ZV9VQYH1wbnL0LyNmhOa7w_ZVyclZ2p";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
