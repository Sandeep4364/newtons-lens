import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

// Validate environment variables
if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create a placeholder Supabase client if not configured to prevent initialization errors
// Use dummy values that won't cause the createClient to throw
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

export interface Experiment {
  id: string;
  user_id?: string;
  title: string;
  experiment_type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisSession {
  id: string;
  experiment_id: string;
  image_data: string;
  ai_observations: Record<string, unknown>;
  predicted_outcome: string;
  safety_warnings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation: string;
  }>;
  guidance: Array<{
    step: number;
    instruction: string;
    position?: { x: number; y: number };
  }>;
  confidence_score: number;
  status: 'analyzing' | 'completed' | 'error';
  created_at: string;
}

export interface ExperimentComponent {
  id: string;
  session_id: string;
  component_type: string;
  detected_properties: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
  connections: string[];
  created_at: string;
}
