/*
  # Newton's Lens Database Schema

  1. New Tables
    - `experiments`
      - `id` (uuid, primary key) - Unique identifier for each experiment
      - `user_id` (uuid, nullable) - User who created the experiment (for future auth)
      - `title` (text) - Experiment title
      - `experiment_type` (text) - Type of experiment (physics, chemistry, circuits, etc.)
      - `description` (text, nullable) - Description of the experiment
      - `created_at` (timestamptz) - When the experiment was created
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `analysis_sessions`
      - `id` (uuid, primary key) - Unique identifier for each analysis session
      - `experiment_id` (uuid, foreign key) - Reference to the experiment
      - `image_data` (text) - Base64 encoded image or URL
      - `ai_observations` (jsonb) - Structured AI observations about the setup
      - `predicted_outcome` (text) - What the AI predicts will happen
      - `safety_warnings` (jsonb) - Array of safety warnings
      - `guidance` (jsonb) - Step-by-step guidance provided
      - `confidence_score` (numeric) - AI confidence in the analysis (0-1)
      - `status` (text) - Status: analyzing, completed, error
      - `created_at` (timestamptz) - When analysis was performed
    
    - `experiment_components`
      - `id` (uuid, primary key) - Unique identifier for each component
      - `session_id` (uuid, foreign key) - Reference to analysis session
      - `component_type` (text) - Type of component (resistor, LED, beaker, etc.)
      - `detected_properties` (jsonb) - Properties detected by AI
      - `position` (jsonb) - Position in the image {x, y, width, height}
      - `connections` (jsonb) - Array of connected component IDs
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo purposes)
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  title text NOT NULL,
  experiment_type text NOT NULL DEFAULT 'general',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES experiments(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  ai_observations jsonb DEFAULT '{}',
  predicted_outcome text DEFAULT '',
  safety_warnings jsonb DEFAULT '[]',
  guidance jsonb DEFAULT '[]',
  confidence_score numeric DEFAULT 0,
  status text DEFAULT 'analyzing',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiment_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  component_type text NOT NULL,
  detected_properties jsonb DEFAULT '{}',
  position jsonb DEFAULT '{}',
  connections jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view experiments"
  ON experiments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create experiments"
  ON experiments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own experiments"
  ON experiments FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON experiments FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Anyone can view analysis sessions"
  ON analysis_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analysis sessions"
  ON analysis_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view components"
  ON experiment_components FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create components"
  ON experiment_components FOR INSERT
  WITH CHECK (true);