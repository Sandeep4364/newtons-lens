import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, StopCircle, AlertCircle, Play, Pause } from 'lucide-react';

interface VideoAnalysisProps {
  onFrameAnalysis: (imageData: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function VideoAnalysis({ onFrameAnalysis, isAnalyzing }: VideoAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzingFrames, setIsAnalyzingFrames] = useState(false);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
    setIsAnalyzingFrames(false);
    setFrameCount(0);
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      await onFrameAnalysis(imageData);
      setFrameCount(prev => prev + 1);
      setLastAnalysisTime(new Date());
    } catch (err) {
      console.error('Frame analysis error:', err);
    }
  }, [onFrameAnalysis, isAnalyzing]);

  const startFrameAnalysis = useCallback(() => {
    if (isAnalyzingFrames || !isStreaming) return;

    setIsAnalyzingFrames(true);
    setFrameCount(0);
    
    // Capture and analyze 1 frame per second
    intervalRef.current = setInterval(() => {
      captureFrame();
    }, 1000);
  }, [captureFrame, isAnalyzingFrames, isStreaming]);

  const stopFrameAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnalyzingFrames(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="w-full">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Live indicator */}
        {isAnalyzingFrames && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE ANALYSIS
          </div>
        )}

        {/* Frame counter */}
        {isAnalyzingFrames && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
            Frames analyzed: {frameCount}
          </div>
        )}

        {/* Last analysis time */}
        {lastAnalysisTime && isAnalyzingFrames && (
          <div className="absolute top-14 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
            Last: {lastAnalysisTime.toLocaleTimeString()}
          </div>
        )}

        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Start Real-time Analysis
            </button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
            {!isAnalyzingFrames ? (
              <button
                onClick={startFrameAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Play className="w-5 h-5" />
                Start Frame Analysis
              </button>
            ) : (
              <button
                onClick={stopFrameAnalysis}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Pause className="w-5 h-5" />
                Pause Analysis
              </button>
            )}
            <button
              onClick={stopCamera}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Real-time Video Analysis</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Analyzes 1 frame per second automatically</li>
          <li>• Provides continuous safety monitoring</li>
          <li>• Live warnings appear as issues are detected</li>
          <li>• Best for dynamic experiments and step-by-step setups</li>
        </ul>
      </div>
    </div>
  );
}
