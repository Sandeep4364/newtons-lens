import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  estimatedTime?: number;
  progress?: number;
}

export function LoadingSpinner({ message = 'Analyzing...', estimatedTime, progress }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-green-600">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-gray-700 font-medium">{message}</p>
        {estimatedTime && (
          <p className="text-sm text-gray-500">
            Estimated time: {estimatedTime} seconds
          </p>
        )}
      </div>

      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
