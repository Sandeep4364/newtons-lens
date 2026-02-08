import { useState } from 'react';
import { Book, Zap, Beaker, Activity, ChevronRight, Copy } from 'lucide-react';

interface ExperimentTemplate {
  id: string;
  name: string;
  type: 'circuits' | 'chemistry' | 'physics' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  components: string[];
  expectedOutcome: string;
  instructions: string[];
  safetyNotes: string[];
}

const templates: ExperimentTemplate[] = [
  {
    id: 'led-blink',
    name: 'LED Blink Circuit',
    type: 'circuits',
    difficulty: 'beginner',
    description: 'Build a simple LED circuit that blinks using a 555 timer IC',
    components: ['LED', '555 Timer IC', '470Ω Resistor', '10kΩ Resistor', '10µF Capacitor', '9V Battery', 'Breadboard', 'Wires'],
    expectedOutcome: 'LED will blink on and off at approximately 1 Hz frequency',
    instructions: [
      'Insert the 555 timer IC into the breadboard',
      'Connect pin 1 (GND) to the negative rail',
      'Connect pin 8 (VCC) to the positive rail',
      'Connect pins 2 and 6 together',
      'Connect the resistors and capacitor as per the 555 astable circuit',
      'Connect the LED with the 470Ω resistor in series to pin 3',
      'Connect the battery and observe the blinking'
    ],
    safetyNotes: [
      'Always check polarity of the LED and capacitor',
      'Use current-limiting resistor to protect LED',
      'Disconnect power when making changes'
    ]
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    type: 'circuits',
    difficulty: 'beginner',
    description: 'Create a voltage divider circuit to reduce voltage',
    components: ['9V Battery', '1kΩ Resistor (x2)', 'Multimeter', 'Breadboard', 'Wires'],
    expectedOutcome: 'Output voltage will be approximately 4.5V (half of input)',
    instructions: [
      'Connect two 1kΩ resistors in series on the breadboard',
      'Connect one end to the 9V positive terminal',
      'Connect the other end to the negative terminal',
      'Measure the voltage at the junction between resistors',
      'Verify the voltage is approximately 4.5V'
    ],
    safetyNotes: [
      'Ensure proper connections before powering',
      'Use appropriate resistor wattage'
    ]
  },
  {
    id: 'rc-circuit',
    name: 'RC Circuit Charging',
    type: 'circuits',
    difficulty: 'intermediate',
    description: 'Study capacitor charging and discharging behavior',
    components: ['100µF Capacitor', '10kΩ Resistor', '9V Battery', 'Switch', 'Multimeter', 'Breadboard'],
    expectedOutcome: 'Capacitor charges exponentially to 9V, then discharges exponentially',
    instructions: [
      'Connect resistor and capacitor in series',
      'Add a switch to control charging',
      'Connect multimeter across the capacitor',
      'Close switch and observe voltage rise',
      'Open switch and observe voltage fall'
    ],
    safetyNotes: [
      'Discharge capacitor before handling',
      'Check capacitor polarity'
    ]
  },
  {
    id: 'ph-testing',
    name: 'pH Testing Solutions',
    type: 'chemistry',
    difficulty: 'beginner',
    description: 'Test the pH of various household solutions',
    components: ['pH test strips', 'Vinegar', 'Baking soda solution', 'Lemon juice', 'Tap water', 'Test tubes', 'Gloves'],
    expectedOutcome: 'Different solutions will show different pH values (acidic, neutral, or basic)',
    instructions: [
      'Put on safety gloves and goggles',
      'Pour small amounts of each liquid into separate test tubes',
      'Dip pH strip into each solution',
      'Compare color changes with the pH scale',
      'Record the pH values',
      'Arrange solutions from most acidic to most basic'
    ],
    safetyNotes: [
      'Wear safety goggles and gloves',
      'Do not taste any chemicals',
      'Work in a well-ventilated area',
      'Wash hands after the experiment'
    ]
  },
  {
    id: 'crystal-growth',
    name: 'Crystal Growth',
    type: 'chemistry',
    difficulty: 'intermediate',
    description: 'Grow crystals from a supersaturated solution',
    components: ['Salt or sugar', 'Hot water', 'Glass jar', 'String', 'Pencil', 'Food coloring (optional)'],
    expectedOutcome: 'Crystals will form on the string over several days',
    instructions: [
      'Heat water until very hot (not boiling)',
      'Add salt/sugar and stir until dissolved',
      'Keep adding until no more dissolves',
      'Tie string to pencil and suspend in solution',
      'Place jar in a quiet location',
      'Observe crystal growth over 3-7 days'
    ],
    safetyNotes: [
      'Handle hot water with care',
      'Adult supervision recommended',
      'Use heat-resistant container'
    ]
  },
  {
    id: 'pendulum',
    name: 'Simple Pendulum',
    type: 'physics',
    difficulty: 'beginner',
    description: 'Study the relationship between pendulum length and period',
    components: ['String (1 meter)', 'Weight (washer or nut)', 'Stopwatch', 'Ruler', 'Stand or hook'],
    expectedOutcome: 'Period increases with the square root of length',
    instructions: [
      'Tie the weight to one end of the string',
      'Attach the other end to a fixed point',
      'Measure the length from the pivot to the center of mass',
      'Pull the weight to one side (small angle)',
      'Release and time 10 complete swings',
      'Calculate the period (time ÷ 10)',
      'Repeat with different lengths'
    ],
    safetyNotes: [
      'Ensure the pendulum has clear swing path',
      'Use small angles (<15°) for accurate results',
      'Secure the suspension point'
    ]
  },
  {
    id: 'inclined-plane',
    name: 'Inclined Plane',
    type: 'physics',
    difficulty: 'intermediate',
    description: 'Measure force required to move objects up an inclined plane',
    components: ['Board or plank', 'Books for elevation', 'Toy car or block', 'Spring scale', 'Ruler', 'Protractor'],
    expectedOutcome: 'Force required decreases as the angle of inclination decreases',
    instructions: [
      'Set up the board at a specific angle using books',
      'Measure the angle with a protractor',
      'Attach spring scale to the object',
      'Pull the object up the plane at constant speed',
      'Record the force reading',
      'Repeat for different angles',
      'Compare forces for different angles'
    ],
    safetyNotes: [
      'Ensure the setup is stable',
      'Prevent objects from rolling off',
      'Work on a flat surface'
    ]
  },
  {
    id: 'spring-constant',
    name: 'Spring Constant Measurement',
    type: 'physics',
    difficulty: 'advanced',
    description: 'Determine the spring constant using Hooke\'s Law',
    components: ['Spring', 'Known masses (50g, 100g, 150g)', 'Ruler', 'Stand', 'Graph paper'],
    expectedOutcome: 'Linear relationship between force and extension (F = kx)',
    instructions: [
      'Suspend the spring vertically from a stand',
      'Measure the initial length (no load)',
      'Add the first mass and measure new length',
      'Calculate extension (new length - initial length)',
      'Repeat for each mass',
      'Plot force (mg) vs extension graph',
      'Calculate spring constant from slope'
    ],
    safetyNotes: [
      'Do not overload the spring',
      'Ensure masses are securely attached',
      'Stand clear when releasing loads'
    ]
  }
];

interface TemplateLibraryProps {
  onSelectTemplate: (template: ExperimentTemplate) => void;
}

export function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template => {
    const typeMatch = selectedType === 'all' || template.type === selectedType;
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'circuits':
        return <Zap className="w-5 h-5" />;
      case 'chemistry':
        return <Beaker className="w-5 h-5" />;
      case 'physics':
        return <Activity className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Experiment Templates Library</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="circuits">Circuits & Electronics</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics & Mechanics</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 text-green-600">
                    {getTypeIcon(template.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {template.components.length} components
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedTemplate === template.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>

            {expandedTemplate === template.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                <div className="space-y-4">
                  {/* Components */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Components Needed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.components.map((component, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expected Outcome:</h4>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                      {template.expectedOutcome}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Step-by-Step Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {template.instructions.map((instruction, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Safety Notes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Safety Notes:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {template.safetyNotes.map((note, index) => (
                        <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <Copy className="w-5 h-5" />
                    Use This Template
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No templates found matching your filters</p>
        </div>
      )}
    </div>
  );
}
