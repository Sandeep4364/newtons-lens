import { useState } from 'react';
import { Microscope, BookOpen } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ExperimentTypeSelector } from './components/ExperimentTypeSelector';
import { supabase, type AnalysisSession } from './lib/supabase';

function App() {
  const [experimentType, setExperimentType] = useState('circuits');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const analyzeExperiment = async (imageData: string) => {
    setIsAnalyzing(true);
    setError('');
    setCapturedImage(imageData);
    setCurrentSession(null);

    try {
      const experiment = await supabase
        .from('experiments')
        .insert({
          title: `${experimentType} experiment`,
          experiment_type: experimentType,
          description: 'Analyzed via camera capture',
        })
        .select()
        .maybeSingle();

      if (experiment.error) throw experiment.error;
      if (!experiment.data) throw new Error('Failed to create experiment');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-experiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          experiment_id: experiment.data.id,
          experiment_type: experimentType,
          image_data: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const result = await response.json();

      const { data: session, error: sessionError } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('id', result.session_id)
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!session) throw new Error('Failed to retrieve analysis session');

      setCurrentSession(session as AnalysisSession);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Microscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Newton's Lens</h1>
                <p className="text-sm text-gray-600">AI Lab Partner for Science Experiments</p>
              </div>
            </div>
            <a
              href="#guide"
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">How It Works</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Experiment Type
              </h2>
              <ExperimentTypeSelector
                selectedType={experimentType}
                onSelectType={setExperimentType}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Capture Your Setup
              </h2>
              <CameraCapture
                onCapture={analyzeExperiment}
                isAnalyzing={isAnalyzing}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <AnalysisDisplay 
              session={currentSession} 
              capturedImage={capturedImage}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        <section id="guide" className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select Type</h3>
              <p className="text-sm text-gray-600">
                Choose your experiment category to get specialized analysis
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Capture Setup</h3>
              <p className="text-sm text-gray-600">
                Use your camera to photograph your experiment setup
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600">
                Our AI identifies components and predicts outcomes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Guidance</h3>
              <p className="text-sm text-gray-600">
                Receive safety warnings and step-by-step instructions
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Newton's Lens - Empowering students with AI-powered lab assistance
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
