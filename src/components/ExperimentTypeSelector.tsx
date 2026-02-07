import { Zap, FlaskConical, Gauge, Atom } from 'lucide-react';

interface ExperimentTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const experimentTypes = [
  { id: 'circuits', name: 'Circuits & Electronics', icon: Zap, color: 'blue' },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'green' },
  { id: 'physics', name: 'Physics & Mechanics', icon: Gauge, color: 'purple' },
  { id: 'general', name: 'General Science', icon: Atom, color: 'orange' },
];

export function ExperimentTypeSelector({ selectedType, onSelectType }: ExperimentTypeSelectorProps) {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: isSelected ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: isSelected ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {experimentTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={`p-4 rounded-lg transition-all ${getColorClasses(type.color, isSelected)} ${
              isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : ''
            }`}
          >
            <Icon className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium text-sm text-center">{type.name}</p>
          </button>
        );
      })}
    </div>
  );
}
