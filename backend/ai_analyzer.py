import os
import base64
import json
from typing import Dict, List, Any
import google.generativeai as genai

class ExperimentAnalyzer:
    def __init__(self):
        api_key = os.environ.get('GEMINI_API_KEY', '')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            self.use_ai = True
        else:
            print("Warning: GEMINI_API_KEY not set. Using mock analysis.")
            self.use_ai = False

    def analyze_image(self, image_data: str, experiment_type: str) -> Dict[str, Any]:
        if self.use_ai:
            return self._analyze_with_ai(image_data, experiment_type)
        else:
            return self._mock_analysis(experiment_type)

    def _analyze_with_ai(self, image_data: str, experiment_type: str) -> Dict[str, Any]:
        try:
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]

            image_bytes = base64.b64decode(image_data)

            prompt = self._build_analysis_prompt(experiment_type)

            response = self.model.generate_content([
                prompt,
                {'mime_type': 'image/jpeg', 'data': image_bytes}
            ])

            analysis_text = response.text

            analysis = self._parse_ai_response(analysis_text, experiment_type)

            return analysis

        except Exception as e:
            print(f"AI Analysis error: {str(e)}")
            return self._mock_analysis(experiment_type)

    def _build_analysis_prompt(self, experiment_type: str) -> str:
        base_prompt = """You are Newton's Lens, an expert AI lab assistant for science experiments.
Analyze this experimental setup image and provide a detailed analysis in JSON format.

Your analysis should include:
1. Components identified in the setup
2. How components are connected or arranged
3. Predicted outcome of the experiment
4. Safety warnings (if any)
5. Step-by-step guidance for proper execution
6. Confidence score (0-1)

Focus on:"""

        type_specific = {
            'circuits': """
- Identify electronic components (resistors, LEDs, batteries, wires, breadboards)
- Check for proper connections and polarity
- Calculate current and voltage if possible
- Warn about short circuits, reverse polarity, or component damage risks
- Provide guidance on proper circuit assembly""",

            'chemistry': """
- Identify chemicals, glassware, and equipment
- Check for proper safety equipment (gloves, goggles)
- Warn about dangerous chemical reactions
- Note proper mixing order and safety precautions
- Provide guidance on safe chemical handling""",

            'physics': """
- Identify mechanical components and setup
- Analyze forces, motion, or energy involved
- Check for stability and safety of the setup
- Predict physical outcomes
- Provide guidance on measurement and execution""",

            'general': """
- Identify all visible components and materials
- Analyze the experimental setup
- Provide safety recommendations
- Suggest proper execution steps"""
        }

        json_format = """

Return your analysis as a valid JSON object with this structure:
{
  "observations": "Detailed description of what you see",
  "components": [
    {
      "type": "component type",
      "properties": {"key": "value"},
      "position": "description",
      "connections": ["connected to"]
    }
  ],
  "predicted_outcome": "What will happen when this experiment is executed",
  "safety_warnings": [
    {
      "severity": "low|medium|high|critical",
      "message": "Warning message",
      "recommendation": "How to fix it"
    }
  ],
  "guidance": [
    {
      "step": 1,
      "instruction": "Step instruction"
    }
  ],
  "confidence_score": 0.95
}

Ensure the response is ONLY valid JSON, no additional text."""

        return base_prompt + type_specific.get(experiment_type, type_specific['general']) + json_format

    def _parse_ai_response(self, response_text: str, experiment_type: str) -> Dict[str, Any]:
        try:
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            analysis = json.loads(response_text)

            if 'safety_warnings' not in analysis:
                analysis['safety_warnings'] = []
            if 'guidance' not in analysis:
                analysis['guidance'] = []
            if 'confidence_score' not in analysis:
                analysis['confidence_score'] = 0.8

            return analysis

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Response text: {response_text[:500]}")
            return self._mock_analysis(experiment_type)

    def _mock_analysis(self, experiment_type: str) -> Dict[str, Any]:
        mock_data = {
            'circuits': {
                'observations': 'I can see a basic electrical circuit with a battery, LED, and wires. The LED appears to be connected directly to the battery without a current-limiting resistor.',
                'components': [
                    {
                        'type': 'LED',
                        'properties': {'color': 'red', 'voltage': '2V'},
                        'position': 'center of breadboard',
                        'connections': ['9V battery positive']
                    },
                    {
                        'type': '9V Battery',
                        'properties': {'voltage': '9V'},
                        'position': 'left side',
                        'connections': ['LED', 'ground wire']
                    }
                ],
                'predicted_outcome': 'The LED will initially light up very brightly but will likely burn out within seconds due to excessive current. A 9V battery connected directly to an LED designed for 2-3V will cause permanent damage.',
                'safety_warnings': [
                    {
                        'severity': 'high',
                        'message': 'LED connected without current-limiting resistor',
                        'recommendation': 'Add a 470Ω to 1kΩ resistor in series with the LED to limit current to safe levels (10-20mA).'
                    },
                    {
                        'severity': 'medium',
                        'message': 'Voltage mismatch detected',
                        'recommendation': 'Use a lower voltage battery (3V) or add voltage regulation.'
                    }
                ],
                'guidance': [
                    {'step': 1, 'instruction': 'Disconnect the LED from the battery immediately'},
                    {'step': 2, 'instruction': 'Calculate required resistor: R = (V_battery - V_led) / I_desired = (9V - 2V) / 0.02A = 350Ω'},
                    {'step': 3, 'instruction': 'Use a 470Ω resistor (standard value) in series with the LED'},
                    {'step': 4, 'instruction': 'Connect resistor to LED anode (longer leg)'},
                    {'step': 5, 'instruction': 'Connect LED cathode (shorter leg) to battery negative'},
                    {'step': 6, 'instruction': 'Connect resistor other end to battery positive'},
                    {'step': 7, 'instruction': 'Verify LED lights up at safe brightness level'}
                ],
                'confidence_score': 0.85
            },
            'chemistry': {
                'observations': 'I can see laboratory glassware including beakers and what appears to be chemicals. Safety equipment is present.',
                'components': [
                    {
                        'type': 'Beaker',
                        'properties': {'volume': '250ml'},
                        'position': 'center of workspace',
                        'connections': []
                    },
                    {
                        'type': 'Chemical reagents',
                        'properties': {},
                        'position': 'right side',
                        'connections': []
                    }
                ],
                'predicted_outcome': 'When these chemicals are mixed, a reaction will occur. The exact outcome depends on the specific chemicals being used.',
                'safety_warnings': [
                    {
                        'severity': 'high',
                        'message': 'Always wear safety goggles and gloves when handling chemicals',
                        'recommendation': 'Put on appropriate personal protective equipment before proceeding.'
                    },
                    {
                        'severity': 'medium',
                        'message': 'Ensure proper ventilation',
                        'recommendation': 'Conduct experiment in a well-ventilated area or fume hood.'
                    }
                ],
                'guidance': [
                    {'step': 1, 'instruction': 'Put on safety goggles and lab gloves'},
                    {'step': 2, 'instruction': 'Verify all chemicals are properly labeled'},
                    {'step': 3, 'instruction': 'Add chemicals slowly while stirring'},
                    {'step': 4, 'instruction': 'Monitor for any unexpected reactions or heat generation'},
                    {'step': 5, 'instruction': 'Dispose of chemicals properly according to lab protocols'}
                ],
                'confidence_score': 0.75
            },
            'physics': {
                'observations': 'I can see a mechanical setup with what appears to be a ramp and objects for motion experiments.',
                'components': [
                    {
                        'type': 'Inclined plane',
                        'properties': {'angle': '30 degrees'},
                        'position': 'center',
                        'connections': []
                    },
                    {
                        'type': 'Rolling object',
                        'properties': {'shape': 'sphere'},
                        'position': 'top of ramp',
                        'connections': []
                    }
                ],
                'predicted_outcome': 'The object will roll down the inclined plane, accelerating due to gravity. The final velocity will depend on the height and friction coefficient.',
                'safety_warnings': [
                    {
                        'severity': 'low',
                        'message': 'Ensure the ramp is stable and won\'t tip over',
                        'recommendation': 'Secure the base of the ramp to prevent movement during the experiment.'
                    }
                ],
                'guidance': [
                    {'step': 1, 'instruction': 'Measure and record the ramp angle'},
                    {'step': 2, 'instruction': 'Mark starting and ending positions'},
                    {'step': 3, 'instruction': 'Release the object gently from the starting position'},
                    {'step': 4, 'instruction': 'Time the descent with a stopwatch'},
                    {'step': 5, 'instruction': 'Calculate velocity and acceleration from your measurements'}
                ],
                'confidence_score': 0.80
            }
        }

        return mock_data.get(experiment_type, mock_data['circuits'])
