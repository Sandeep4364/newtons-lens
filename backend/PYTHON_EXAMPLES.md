# Newton's Lens - Python Implementation Details

Complete guide to understanding and extending the Python backend.

## Table of Contents
1. [AI Analyzer Deep Dive](#ai-analyzer-deep-dive)
2. [Database Operations](#database-operations)
3. [Custom Experiment Types](#custom-experiment-types)
4. [Advanced AI Prompting](#advanced-ai-prompting)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)

---

## AI Analyzer Deep Dive

### Core Class: ExperimentAnalyzer

```python
from ai_analyzer import ExperimentAnalyzer

# Initialize the analyzer
analyzer = ExperimentAnalyzer()

# Analyze an image (base64 encoded)
result = analyzer.analyze_image(
    image_data="data:image/jpeg;base64,...",
    experiment_type="circuits"
)

# Result structure
{
    "observations": "Detailed description of setup",
    "components": [...],
    "predicted_outcome": "What will happen",
    "safety_warnings": [...],
    "guidance": [...],
    "confidence_score": 0.95
}
```

### How the AI Works

The analyzer uses Google's Gemini 1.5 Pro model with multimodal capabilities:

1. **Image Processing**: Base64 image → Decoded bytes
2. **Prompt Engineering**: Dynamic prompts based on experiment type
3. **AI Generation**: Gemini analyzes image with context
4. **Response Parsing**: JSON extraction and validation
5. **Fallback**: Mock data if AI fails

### Custom Analysis Example

```python
import base64
from ai_analyzer import ExperimentAnalyzer

def analyze_experiment_from_file(filepath, exp_type='circuits'):
    """
    Load an image file and analyze it
    """
    with open(filepath, 'rb') as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode()
        image_data = f"data:image/jpeg;base64,{image_b64}"

    analyzer = ExperimentAnalyzer()
    result = analyzer.analyze_image(image_data, exp_type)

    # Access results
    print(f"Confidence: {result['confidence_score']}")
    print(f"Warnings: {len(result['safety_warnings'])}")
    print(f"Components: {len(result['components'])}")

    return result

# Use it
result = analyze_experiment_from_file('circuit_photo.jpg', 'circuits')
```

---

## Database Operations

### Supabase Integration

```python
from database import Database

db = Database()

# Create experiment
experiment_id = "uuid-here"

# Create analysis session
session_id = db.create_analysis_session(
    experiment_id=experiment_id,
    image_data="base64_image",
    analysis_result={
        'observations': '...',
        'predicted_outcome': '...',
        'safety_warnings': [...],
        'guidance': [...],
        'confidence_score': 0.9,
        'components': [...]
    }
)

# Create components
for component in analysis_result['components']:
    db.create_component(session_id, component)

# Retrieve session
session = db.get_session(session_id)
```

### Direct Supabase Queries

```python
from supabase import create_client
import os

# Initialize client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Query experiments
experiments = supabase.table('experiments')\
    .select('*')\
    .eq('experiment_type', 'circuits')\
    .order('created_at', desc=True)\
    .limit(10)\
    .execute()

# Get analysis with components
analysis = supabase.table('analysis_sessions')\
    .select('*, experiment_components(*)')\
    .eq('id', session_id)\
    .single()\
    .execute()

# Aggregate statistics
stats = supabase.rpc('get_experiment_stats', {}).execute()
```

---

## Custom Experiment Types

### Adding a New Experiment Type

**Step 1: Update AI Prompts**

Edit `ai_analyzer.py`:

```python
def _build_analysis_prompt(self, experiment_type: str) -> str:
    base_prompt = """..."""

    type_specific = {
        'circuits': """...""",
        'chemistry': """...""",
        'physics': """...""",

        # NEW TYPE
        'biology': """
- Identify biological specimens and equipment
- Check for proper sterile technique
- Warn about contamination risks
- Note proper microscope setup
- Provide guidance on specimen handling""",
    }

    # ... rest of method
```

**Step 2: Add Mock Data**

```python
def _mock_analysis(self, experiment_type: str) -> Dict[str, Any]:
    mock_data = {
        # ... existing types

        'biology': {
            'observations': 'I see a microscope setup with slides...',
            'components': [
                {
                    'type': 'Microscope',
                    'properties': {'magnification': '400x'},
                    'position': 'center',
                    'connections': []
                },
                {
                    'type': 'Specimen slide',
                    'properties': {'type': 'onion cells'},
                    'position': 'on stage',
                    'connections': ['microscope']
                }
            ],
            'predicted_outcome': 'You will observe cell walls...',
            'safety_warnings': [
                {
                    'severity': 'medium',
                    'message': 'Ensure slide is properly prepared',
                    'recommendation': 'Use cover slip to prevent contamination'
                }
            ],
            'guidance': [
                {'step': 1, 'instruction': 'Prepare specimen with iodine stain'},
                {'step': 2, 'instruction': 'Place cover slip at 45° angle'},
                {'step': 3, 'instruction': 'Start with lowest magnification'},
                {'step': 4, 'instruction': 'Focus using coarse adjustment'},
                {'step': 5, 'instruction': 'Switch to fine adjustment'}
            ],
            'confidence_score': 0.82
        }
    }
```

**Step 3: Update Frontend**

Add to `ExperimentTypeSelector.tsx`:

```typescript
const experimentTypes = [
  // ... existing types
  {
    id: 'biology',
    name: 'Biology & Life Science',
    icon: Microscope,
    color: 'green'
  },
];
```

---

## Advanced AI Prompting

### Temperature and Parameters

```python
import google.generativeai as genai

# Configure model with parameters
generation_config = genai.GenerationConfig(
    temperature=0.4,  # Lower = more focused, higher = more creative
    top_p=0.8,
    top_k=40,
    max_output_tokens=2048,
)

model = genai.GenerativeModel(
    'gemini-1.5-pro',
    generation_config=generation_config
)
```

### Multi-Turn Conversations

```python
def analyze_with_followup(self, image_data: str, experiment_type: str):
    """
    First pass analysis, then ask for more details
    """
    # Initial analysis
    initial_prompt = self._build_analysis_prompt(experiment_type)
    response = self.model.generate_content([
        initial_prompt,
        {'mime_type': 'image/jpeg', 'data': image_bytes}
    ])

    initial_result = self._parse_ai_response(response.text)

    # Follow-up for safety details
    if initial_result.get('components'):
        safety_prompt = f"""
        Given these components: {initial_result['components']}

        Provide extremely detailed safety analysis including:
        1. Specific hazard identification
        2. Risk level quantification
        3. Detailed mitigation steps
        4. Emergency response procedures

        Return as JSON.
        """

        safety_response = self.model.generate_content(safety_prompt)
        detailed_safety = json.loads(safety_response.text)

        # Merge results
        initial_result['detailed_safety'] = detailed_safety

    return initial_result
```

### Structured Output Prompting

```python
def _build_structured_prompt(self, experiment_type: str) -> str:
    """
    Force specific JSON structure with validation rules
    """
    return """
Analyze this experiment setup and respond ONLY with valid JSON.

REQUIRED STRUCTURE:
{
  "observations": "string (100-500 chars)",
  "components": [
    {
      "type": "string (required)",
      "properties": {"key": "value"},
      "position": "string",
      "connections": ["array of strings"]
    }
  ],
  "predicted_outcome": "string (required, 50-300 chars)",
  "safety_warnings": [
    {
      "severity": "low|medium|high|critical (required)",
      "message": "string (required)",
      "recommendation": "string (required)"
    }
  ],
  "guidance": [
    {
      "step": integer,
      "instruction": "string (required)"
    }
  ],
  "confidence_score": float (0.0-1.0, required)
}

VALIDATION RULES:
- components array must have at least 1 item
- Each safety warning must have a valid severity
- Guidance steps must be sequential starting from 1
- Confidence score must be between 0 and 1

ERROR HANDLING:
- If you cannot analyze the image, return confidence_score: 0.3
- If setup is incomplete, note in observations
- If safety cannot be determined, add critical warning

Now analyze the image and respond with ONLY the JSON:
"""
```

---

## Error Handling

### Graceful Degradation

```python
def analyze_image(self, image_data: str, experiment_type: str) -> Dict[str, Any]:
    """
    Multi-layer fallback system
    """
    try:
        # Try AI analysis
        return self._analyze_with_ai(image_data, experiment_type)

    except genai.types.BlockedPromptException:
        # Content safety filter triggered
        return {
            'error': 'content_filtered',
            'message': 'Image may contain unsafe content',
            'confidence_score': 0.0,
            **self._safe_mock_analysis(experiment_type)
        }

    except genai.types.APIError as e:
        # API error (rate limit, quota, etc.)
        if 'quota' in str(e).lower():
            return self._mock_analysis_with_note(
                experiment_type,
                'API quota exceeded - using offline analysis'
            )
        raise

    except json.JSONDecodeError:
        # AI returned invalid JSON
        return self._mock_analysis_with_note(
            experiment_type,
            'AI response format error - using template analysis'
        )

    except Exception as e:
        # Unknown error
        print(f"Unexpected error: {e}")
        return self._mock_analysis(experiment_type)
```

### Retry Logic

```python
import time
from functools import wraps

def retry_on_failure(max_attempts=3, delay=1):
    """
    Decorator for retrying failed operations
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
                    time.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator

@retry_on_failure(max_attempts=3, delay=2)
def _analyze_with_ai(self, image_data: str, experiment_type: str):
    # ... AI analysis code
    pass
```

---

## Performance Optimization

### Image Optimization

```python
from PIL import Image
import io
import base64

def optimize_image(image_data: str, max_size=(1024, 768), quality=85):
    """
    Compress image before sending to AI
    """
    # Decode base64
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]

    image_bytes = base64.b64decode(image_data)

    # Open with PIL
    img = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB if needed
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')

    # Resize if too large
    img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # Save optimized
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=quality, optimize=True)

    # Re-encode to base64
    optimized_bytes = buffer.getvalue()
    optimized_b64 = base64.b64encode(optimized_bytes).decode()

    return f"data:image/jpeg;base64,{optimized_b64}"
```

### Caching Results

```python
from functools import lru_cache
import hashlib

def get_image_hash(image_data: str) -> str:
    """
    Generate hash of image for caching
    """
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]

    # Take first 10KB for hash (fast approximation)
    sample = image_data[:10000]
    return hashlib.md5(sample.encode()).hexdigest()

class CachedAnalyzer(ExperimentAnalyzer):
    def __init__(self):
        super().__init__()
        self.cache = {}

    def analyze_image(self, image_data: str, experiment_type: str):
        # Generate cache key
        cache_key = f"{get_image_hash(image_data)}:{experiment_type}"

        # Check cache
        if cache_key in self.cache:
            print("Cache hit!")
            return self.cache[cache_key]

        # Analyze
        result = super().analyze_image(image_data, experiment_type)

        # Store in cache
        self.cache[cache_key] = result

        return result
```

### Batch Processing

```python
async def analyze_multiple_experiments(image_list, experiment_types):
    """
    Analyze multiple experiments in parallel
    """
    import asyncio

    analyzer = ExperimentAnalyzer()

    async def analyze_one(image_data, exp_type):
        return await asyncio.to_thread(
            analyzer.analyze_image,
            image_data,
            exp_type
        )

    # Create tasks
    tasks = [
        analyze_one(img, exp_type)
        for img, exp_type in zip(image_list, experiment_types)
    ]

    # Run in parallel
    results = await asyncio.gather(*tasks)

    return results
```

---

## Testing Examples

### Unit Tests

```python
import unittest
from ai_analyzer import ExperimentAnalyzer

class TestAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = ExperimentAnalyzer()

    def test_mock_mode_circuits(self):
        result = self.analyzer.analyze_image("mock", "circuits")

        self.assertIn('components', result)
        self.assertIn('safety_warnings', result)
        self.assertIn('guidance', result)
        self.assertGreater(result['confidence_score'], 0)

    def test_all_experiment_types(self):
        types = ['circuits', 'chemistry', 'physics', 'general']

        for exp_type in types:
            result = self.analyzer.analyze_image("mock", exp_type)
            self.assertEqual(result.get('error'), None)

    def test_component_detection(self):
        result = self.analyzer.analyze_image("mock", "circuits")
        components = result['components']

        self.assertIsInstance(components, list)
        self.assertGreater(len(components), 0)

        for comp in components:
            self.assertIn('type', comp)
            self.assertIn('properties', comp)

if __name__ == '__main__':
    unittest.main()
```

### Integration Tests

```python
import requests
import base64

def test_full_workflow():
    """
    Test complete analysis workflow
    """
    # Create experiment
    exp_response = requests.post(
        'http://localhost:5000/api/experiments',
        json={
            'title': 'Test Circuit',
            'experiment_type': 'circuits'
        }
    )
    experiment_id = exp_response.json()['id']

    # Load test image
    with open('test_circuit.jpg', 'rb') as f:
        image_b64 = base64.b64encode(f.read()).decode()
        image_data = f"data:image/jpeg;base64,{image_b64}"

    # Analyze
    analysis_response = requests.post(
        'http://localhost:5000/api/analyze',
        json={
            'experiment_id': experiment_id,
            'experiment_type': 'circuits',
            'image_data': image_data
        }
    )

    result = analysis_response.json()

    assert result['status'] == 'completed'
    assert 'session_id' in result
    assert result['analysis']['confidence_score'] > 0

    print("✓ Full workflow test passed")

test_full_workflow()
```

---

## Deployment Scripts

### Heroku Deployment

```python
# Procfile
web: gunicorn app:app

# runtime.txt
python-3.11.0

# requirements.txt additions
gunicorn==21.2.0
```

### Docker Container

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

This comprehensive guide covers all aspects of the Python backend implementation. For questions or extensions, refer to the main documentation or create custom implementations based on these examples.
