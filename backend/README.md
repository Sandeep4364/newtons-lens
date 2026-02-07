# Newton's Lens Backend

Python Flask backend for AI-powered experiment analysis.

## Features

- **AI Vision Analysis**: Uses Google's Gemini AI for multimodal image understanding
- **Experiment Type Detection**: Specialized analysis for circuits, chemistry, physics
- **Safety Prediction**: Identifies potential hazards before they occur
- **Real-time Guidance**: Provides step-by-step instructions
- **Supabase Integration**: Stores analysis results and experiment data

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### 3. Get API Keys

#### Supabase
- Already configured in your project
- Get URL and keys from Supabase dashboard

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Experiment
```
POST /api/analyze
Content-Type: application/json

{
  "experiment_id": "uuid",
  "experiment_type": "circuits|chemistry|physics|general",
  "image_data": "base64_encoded_image"
}
```

### Get Analysis Session
```
GET /api/sessions/{session_id}
```

## How It Works

### 1. Image Analysis Flow

```
Camera Capture → Base64 Encoding → Flask API → Gemini AI → Analysis Result → Supabase
```

### 2. AI Analysis Process

The `ExperimentAnalyzer` class:
- Receives base64 image data
- Sends to Gemini AI with specialized prompts based on experiment type
- Parses AI response into structured format
- Identifies components, connections, and potential issues
- Generates safety warnings and guidance

### 3. Experiment Types

**Circuits & Electronics**
- Identifies: resistors, LEDs, batteries, wires, breadboards
- Checks: proper connections, polarity, current calculations
- Warns: short circuits, component damage, reverse polarity

**Chemistry**
- Identifies: chemicals, glassware, safety equipment
- Checks: proper protective gear, ventilation
- Warns: dangerous reactions, mixing order, disposal

**Physics & Mechanics**
- Identifies: mechanical components, measurement tools
- Checks: stability, force calculations
- Warns: safety risks, measurement accuracy

**General Science**
- Flexible analysis for various experiments
- General safety recommendations
- Basic setup validation

## Architecture

### Files

- `app.py` - Flask application and API routes
- `ai_analyzer.py` - AI vision analysis logic
- `database.py` - Supabase database operations
- `requirements.txt` - Python dependencies

### Key Components

**ExperimentAnalyzer**
- Manages Gemini AI integration
- Builds specialized prompts for each experiment type
- Parses AI responses into structured data
- Falls back to mock data if API key not available

**Database**
- Creates analysis sessions
- Stores experiment components
- Retrieves session data

## Mock Mode

If `GEMINI_API_KEY` is not set, the system runs in mock mode with realistic example data. This is useful for:
- Testing the frontend without API costs
- Development without API keys
- Demonstrations

## Safety Features

1. **Predictive Analysis**: Identifies problems before execution
2. **Severity Levels**: Critical, high, medium, low warnings
3. **Specific Recommendations**: Actionable fixes for each issue
4. **Step-by-Step Guidance**: Proper execution instructions

## Error Handling

- Graceful fallback to mock data on AI errors
- Detailed error logging
- User-friendly error messages
- Database transaction safety

## Performance

- Image compression for faster uploads
- Efficient base64 encoding
- Optimized prompts for quick AI responses
- Database connection pooling

## Future Enhancements

- WebSocket support for real-time analysis
- Video stream analysis
- Component tracking across frames
- Multi-language support
- Custom experiment templates
- Teacher/student collaboration features
