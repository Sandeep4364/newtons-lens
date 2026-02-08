import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Tag } from 'lucide-react';

interface Component {
  type: string;
  properties: Record<string, string | number | boolean>;
  position: string;
  connections?: string[];
}

interface SafetyWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}

interface AROverlayProps {
  components: Component[];
  safetyWarnings: SafetyWarning[];
  imageData: string | null;
  showLabels?: boolean;
  showBoundingBoxes?: boolean;
}

export function AROverlay({ 
  components, 
  safetyWarnings, 
  imageData,
  showLabels = true,
  showBoundingBoxes = true 
}: AROverlayProps) {
  const [hoveredComponent, setHoveredComponent] = useState<number | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/20';
      case 'high':
        return 'border-orange-500 bg-orange-500/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/20';
      default:
        return 'border-green-500 bg-green-500/20';
    }
  };

  const getSafetyZoneColor = () => {
    if (safetyWarnings.some(w => w.severity === 'critical' || w.severity === 'high')) {
      return 'border-red-500 shadow-red-500/50';
    }
    if (safetyWarnings.some(w => w.severity === 'medium')) {
      return 'border-yellow-500 shadow-yellow-500/50';
    }
    return 'border-green-500 shadow-green-500/50';
  };

  if (!imageData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          No image available for AR overlay
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4" />
          AR Component Overlay
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-white">Danger</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-white">Caution</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-white">Safe</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <img 
          src={imageData} 
          alt="Experiment setup" 
          className={`w-full h-auto border-4 ${getSafetyZoneColor()} shadow-lg`}
        />

        {/* Component labels and bounding boxes */}
        {showLabels && components.map((component, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              // Position based on component position description
              // In a real implementation, this would use computer vision coordinates
              top: `${20 + (index * 15)}%`,
              left: `${10 + (index * 20)}%`,
            }}
            onMouseEnter={() => setHoveredComponent(index)}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {showBoundingBoxes && (
              <div className="absolute w-24 h-24 border-2 border-blue-500 bg-blue-500/10 rounded -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            )}
            
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {component.type}
            </div>

            {hoveredComponent === index && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-3 z-10 min-w-[200px]">
                <h4 className="font-semibold text-gray-900 mb-2">{component.type}</h4>
                {Object.entries(component.properties).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(component.properties).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="text-gray-900 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {component.connections && component.connections.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-gray-600">Connected to:</span>
                    <div className="text-xs text-gray-900">
                      {component.connections.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Safety warning overlays */}
        {safetyWarnings.map((warning, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${60 + (index * 10)}%`,
              right: '5%',
            }}
          >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border-2 ${getSeverityColor(warning.severity)}`}>
              {warning.severity === 'critical' || warning.severity === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : warning.severity === 'medium' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm font-semibold">{warning.severity.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Component legend */}
      <div className="p-4 bg-gray-50 border-t">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Detected Components:</h4>
        <div className="flex flex-wrap gap-2">
          {components.map((component, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors"
              onMouseEnter={() => setHoveredComponent(index)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {component.type}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          AR Overlay Features
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Blue boxes highlight detected components</li>
          <li>• Hover over labels for detailed information</li>
          <li>• Border color indicates overall safety level</li>
          <li>• Warning icons show problematic areas</li>
        </ul>
      </div>
    </div>
  );
}
