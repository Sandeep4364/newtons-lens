import { useRef, useState, useCallback } from 'react';
import { Camera, StopCircle, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

export function CameraCapture({ onCapture, isAnalyzing }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  // Constants for image/video processing
  const JPEG_QUALITY = 0.8;
  const MAX_SEEK_TIME_SECONDS = 1;
  const SEEK_PERCENTAGE = 0.1;

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

    const imageData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    onCapture(imageData);
  }, [onCapture]);

  const compressImage = useCallback((imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Resize to max dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.8 quality
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select a valid image or video file');
      return;
    }

    // Handle video files
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        setError('Failed to initialize video processing');
        return;
      }

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Validate video duration is a finite positive number
        if (!isFinite(video.duration) || video.duration <= 0) {
          setError('Invalid video format or corrupted video file');
          URL.revokeObjectURL(video.src);
          return;
        }
        // Seek to 1 second or 10% of video duration, whichever is smaller
        const seekTime = Math.min(MAX_SEEK_TIME_SECONDS, video.duration * SEEK_PERCENTAGE);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          onCapture(imageData);
          URL.revokeObjectURL(video.src);
        } catch (err) {
          setError('Failed to extract frame from video');
          console.error('Video frame extraction error:', err);
          URL.revokeObjectURL(video.src);
        }
      };

      video.onerror = () => {
        setError('Failed to load video file');
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
      return;
    }

    // Handle image files
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      const compressed = await compressImage(imageData);
      onCapture(compressed);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, [onCapture, compressImage]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 gap-3">
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </button>
            <div className="flex items-center gap-3">
              <div className="h-px bg-gray-600 w-12"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="h-px bg-gray-600 w-12"></div>
            </div>
            <button
              onClick={triggerFileUpload}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Image/Video
            </button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-400 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={triggerFileUpload}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Upload Instead
                </button>
              </div>
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
