import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { AnalysisSession } from '../lib/supabase';

interface AnalysisDisplayProps {
  session: AnalysisSession | null;
  capturedImage: string | null;
}

export function AnalysisDisplay({ session, capturedImage }: AnalysisDisplayProps) {
  if (!session && !capturedImage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analysis Yet
        </h3>
        <p className="text-gray-600">
          Capture an image of your experiment setup to get started with AI-powered analysis.
        </p>
      </div>
    );
  }

  if (!session && capturedImage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {capturedImage && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Captured Setup</h3>
          <img
            src={capturedImage}
            alt="Experiment setup"
            className="w-full rounded-lg"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {Math.round(session.confidence_score * 100)}% Confidence
          </span>
        </div>

        {session.predicted_outcome && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Predicted Outcome
            </h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {session.predicted_outcome}
            </p>
          </div>
        )}

        {session.safety_warnings && session.safety_warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Safety Warnings</h4>
            <div className="space-y-3">
              {session.safety_warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(warning.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(warning.severity)}
                    <div className="flex-1">
                      <p className="font-medium mb-1">{warning.message}</p>
                      <p className="text-sm opacity-90">{warning.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.guidance && session.guidance.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Step-by-Step Guidance</h4>
            <ol className="space-y-3">
              {session.guidance.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {step.step}
                  </span>
                  <p className="text-gray-700 pt-1">{step.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
