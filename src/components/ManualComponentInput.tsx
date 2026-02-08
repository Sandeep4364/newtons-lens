import { useState, useEffect } from 'react';
import { List, Plus, Sparkles, X } from 'lucide-react';

interface ManualComponentInputProps {
  experimentType: string;
  onAnalyze: (components: string[]) => void;
  isAnalyzing: boolean;
}

const quickAddComponents: Record<string, string[]> = {
  circuits: ['LED', 'Resistor', 'Battery', 'Breadboard', 'Arduino', 'Wire'],
  chemistry: ['Beaker', 'Flask', 'Test tube', 'Burner', 'Gloves', 'Goggles'],
  physics: ['Ramp', 'Pulley', 'Spring', 'Meter stick', 'Stopwatch', 'Weight'],
  general: ['Microscope', 'Thermometer', 'Ruler', 'Notebook'],
};

export function ManualComponentInput({
  experimentType,
  onAnalyze,
  isAnalyzing,
}: ManualComponentInputProps) {
  const [inputText, setInputText] = useState('');
  const [components, setComponents] = useState<string[]>([]);

  // Parse components from input text (comma or newline separated)
  useEffect(() => {
    const parsed = inputText
      .split(/[,\n]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    setComponents(parsed);
  }, [inputText]);

  const addQuickComponent = (component: string) => {
    if (inputText && !inputText.endsWith('\n') && !inputText.endsWith(',')) {
      setInputText((prev) => prev + ', ' + component);
    } else {
      setInputText((prev) => prev + component);
    }
  };

  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    setInputText(newComponents.join(', '));
  };

  const handleAnalyze = () => {
    if (components.length > 0) {
      onAnalyze(components);
    }
  };

  const quickButtons = quickAddComponents[experimentType] || quickAddComponents.general;

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <List className="w-4 h-4 inline mr-1" />
          Enter components (comma or line separated):
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., LED, 470Ω resistor, 9V battery, breadboard..."
          rows={4}
          disabled={isAnalyzing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Component Chips */}
      {components.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Components:</p>
          <div className="flex flex-wrap gap-2">
            {components.map((component, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {component}
                <button
                  onClick={() => removeComponent(index)}
                  disabled={isAnalyzing}
                  className="hover:bg-green-200 rounded-full p-0.5 disabled:cursor-not-allowed"
                  aria-label={`Remove ${component}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Buttons */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Add:</p>
        <div className="flex flex-wrap gap-2">
          {quickButtons.map((component) => (
            <button
              key={component}
              onClick={() => addQuickComponent(component)}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              {component}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || components.length === 0}
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {isAnalyzing ? 'Analyzing...' : 'Analyze Setup'}
      </button>
    </div>
  );
}
