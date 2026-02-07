import { useRef, useState, useCallback } from 'react';
import { Camera, StopCircle, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

export function CameraCapture({ onCapture, isAnalyzing }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

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
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  }, [onCapture]);

  return (
    <div className="w-full">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Start Camera
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
            <button
              onClick={captureImage}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Setup'}
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
