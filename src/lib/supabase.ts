import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
