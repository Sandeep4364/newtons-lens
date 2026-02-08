import { useState, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface GuidanceStep {
  step: number;
  instruction: string;
}

interface VoiceGuidanceProps {
  observations?: string;
  predictedOutcome?: string;
  safetyWarnings?: Array<{ severity: string; message: string; recommendation: string }>;
  guidance?: GuidanceStep[];
}

export function VoiceGuidance({ observations, predictedOutcome, safetyWarnings, guidance }: VoiceGuidanceProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Check if speech synthesis is supported
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string, interrupt = false) => {
    if (!isSpeechSupported || !isEnabled) return;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    
    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice];
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isSpeechSupported, isEnabled, volume, rate, voices, selectedVoice]);

  const speakAll = useCallback(() => {
    if (!isEnabled) return;

    window.speechSynthesis.cancel();
    
    let fullText = '';

    if (observations) {
      fullText += `Analysis observations: ${observations}. `;
    }

    if (safetyWarnings && safetyWarnings.length > 0) {
      fullText += 'Safety warnings: ';
      safetyWarnings.forEach((warning, index) => {
        fullText += `Warning ${index + 1}, ${warning.severity} severity: ${warning.message}. Recommendation: ${warning.recommendation}. `;
      });
    }

    if (predictedOutcome) {
      fullText += `Predicted outcome: ${predictedOutcome}. `;
    }

    if (guidance && guidance.length > 0) {
      fullText += 'Step by step guidance: ';
      guidance.forEach((step) => {
        fullText += `Step ${step.step}: ${step.instruction}. `;
      });
    }

    speak(fullText, true);
  }, [observations, safetyWarnings, predictedOutcome, guidance, speak, isEnabled]);

  const speakStep = useCallback((stepIndex: number) => {
    if (!guidance || stepIndex >= guidance.length || stepIndex < 0) return;
    
    const step = guidance[stepIndex];
    speak(`Step ${step.step}: ${step.instruction}`, true);
    setCurrentStep(stepIndex);
  }, [guidance, speak]);

  const nextStep = useCallback(() => {
    if (!guidance) return;
    const next = Math.min(currentStep + 1, guidance.length - 1);
    speakStep(next);
  }, [currentStep, guidance, speakStep]);

  const previousStep = useCallback(() => {
    const prev = Math.max(currentStep - 1, 0);
    speakStep(prev);
  }, [currentStep, speakStep]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      speakAll();
    }
  }, [isPlaying, speakAll]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  // Announce critical safety warnings immediately
  useEffect(() => {
    if (!isEnabled || !safetyWarnings) return;

    const criticalWarnings = safetyWarnings.filter(
      w => w.severity === 'critical' || w.severity === 'high'
    );

    if (criticalWarnings.length > 0) {
      const warningText = criticalWarnings
        .map(w => `Critical warning: ${w.message}`)
        .join('. ');
      speak(warningText, true);
    }
  }, [safetyWarnings, isEnabled, speak]);

  if (!isSpeechSupported) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <VolumeX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Voice guidance is not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-green-600" />
          Voice-Guided Instructions
        </h3>
        <button
          onClick={() => {
            setIsEnabled(!isEnabled);
            if (isEnabled) stop();
          }}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Playback controls */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={previousStep}
              disabled={!guidance || currentStep === 0}
              className="p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={nextStep}
              disabled={!guidance || currentStep === guidance.length - 1}
              className="p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Speed control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Voice selection */}
          {voices.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick actions */}
          <div className="space-y-2">
            <button
              onClick={speakAll}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Read Full Analysis
            </button>
            
            {safetyWarnings && safetyWarnings.length > 0 && (
              <button
                onClick={() => {
                  const warningsText = safetyWarnings
                    .map(w => `${w.severity} severity: ${w.message}. Recommendation: ${w.recommendation}`)
                    .join('. ');
                  speak(`Safety warnings: ${warningsText}`, true);
                }}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Read Safety Warnings
              </button>
            )}
          </div>

          {/* Current step indicator */}
          {guidance && guidance.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Step {currentStep + 1} of {guidance.length}:</strong>{' '}
                {guidance[currentStep]?.instruction}
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Enable voice guidance for hands-free lab work</p>
        <p>⚠️ Critical safety warnings are announced automatically</p>
      </div>
    </div>
  );
}
