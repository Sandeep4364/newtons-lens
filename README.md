# Newton's Lens

**An AI Lab Partner That Thinks Before You Act**

Newton's Lens is an intelligent educational application that uses multimodal AI vision to analyze science experiments in real-time, providing safety warnings and step-by-step guidance before students execute their experiments.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Python](https://img.shields.io/badge/Python-3.9+-3776ab)
![Gemini](https://img.shields.io/badge/Gemini-1.5--Pro-4285f4)

---

## The Problem

Students conducting experiments remotely or alone face significant challenges:
- Errors go undetected until it's too late
- No real-time guidance when precision matters most
- Safety risks from improper setups
- Inefficient trial-and-error learning cycles

## Our Solution

Newton's Lens uses advanced AI to transform how students approach experiments:

1. **AI-Powered Observation** - Camera captures your experimental setup
2. **Intelligent Analysis** - Identifies components and connections
3. **Predictive Insights** - Forecasts outcomes before execution
4. **Proactive Guidance** - Prevents failures and enhances safety

## Quick Start

Get started in 5 minutes: See **[QUICKSTART.md](./QUICKSTART.md)**

For detailed information: See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**

## Features

- Real-time camera capture and analysis
- Multimodal AI vision (Google Gemini 1.5 Pro)
- Specialized analysis for circuits, chemistry, physics
- Safety prediction with severity levels
- Step-by-step execution guidance
- Component detection and tracking
- Confidence scoring
- Historical experiment tracking

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast dev environment
- **Tailwind CSS** - Beautiful, responsive design
- **Supabase Client** - Real-time database
- **Lucide React** - Modern icon set

### Backend
- **Python 3.9+** with Flask
- **Google Gemini AI** - Multimodal vision analysis
- **Supabase** - PostgreSQL with RLS
- **Flask-CORS** - API security

## Project Structure

```
newton-lens/
├── src/                          # React frontend
│   ├── components/
│   │   ├── CameraCapture.tsx     # Camera interface
│   │   ├── AnalysisDisplay.tsx   # Results display
│   │   └── ExperimentTypeSelector.tsx
│   ├── lib/
│   │   └── supabase.ts           # Database client
│   └── App.tsx                   # Main application
│
├── backend/                      # Python Flask API
│   ├── app.py                    # Flask routes
│   ├── ai_analyzer.py            # AI vision engine
│   ├── database.py               # Supabase operations
│   ├── test_analyzer.py          # Testing utilities
│   └── requirements.txt          # Python dependencies
│
├── QUICKSTART.md                 # 5-minute setup guide
├── IMPLEMENTATION_GUIDE.md       # Complete documentation
└── README.md                     # This file
```

## How It Works

```
┌─────────────┐
│   Student   │
│   Camera    │
└──────┬──────┘
       │
       │ Capture Image
       v
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       │ Base64 Image + Experiment Type
       v
┌─────────────┐
│   Flask     │
│  Backend    │
└──────┬──────┘
       │
       │ Image Analysis Request
       v
┌─────────────┐        ┌──────────────┐
│  Gemini AI  │ ────>  │   Supabase   │
│   Vision    │        │   Database   │
└─────────────┘        └──────────────┘
       │                       │
       └───────┬───────────────┘
               │
               v
       ┌──────────────┐
       │   Analysis   │
       │   Results    │
       │              │
       │ • Components │
       │ • Warnings   │
       │ • Guidance   │
       │ • Prediction │
       └──────────────┘
```

## Use Cases

### Circuits & Electronics
- LED circuits with resistor calculations
- Arduino projects and breadboard prototyping
- Component identification and polarity checking
- Short circuit and overcurrent detection

### Chemistry
- Chemical mixing and reactions
- Safety equipment verification
- Dangerous reaction warnings
- Proper lab procedure guidance

### Physics & Mechanics
- Motion and force experiments
- Ramp and pendulum setups
- Stability and safety analysis
- Measurement technique guidance

## Example Analysis Output

```json
{
  "observations": "I see a basic circuit with a 9V battery connected directly to an LED without a current-limiting resistor.",
  "components": [
    {
      "type": "LED",
      "properties": {"color": "red", "voltage": "2V"},
      "position": "center of breadboard"
    },
    {
      "type": "9V Battery",
      "properties": {"voltage": "9V"},
      "position": "left side"
    }
  ],
  "predicted_outcome": "The LED will burn out within seconds due to excessive current from the 9V battery.",
  "safety_warnings": [
    {
      "severity": "high",
      "message": "LED connected without current-limiting resistor",
      "recommendation": "Add a 470Ω resistor in series with the LED"
    }
  ],
  "guidance": [
    {"step": 1, "instruction": "Disconnect the LED immediately"},
    {"step": 2, "instruction": "Calculate resistor: R = (9V - 2V) / 0.02A = 350Ω"},
    {"step": 3, "instruction": "Use 470Ω resistor in series"},
    {"step": 4, "instruction": "Connect resistor to LED anode"},
    {"step": 5, "instruction": "Reconnect and verify safe operation"}
  ],
  "confidence_score": 0.95
}
```

## Installation

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python app.py
```

### Environment Variables

**Frontend** (`.env`):
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

## Getting API Keys

### Supabase
Already configured in your project! Get credentials from Supabase dashboard.

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key (free tier available)
3. Add to `backend/.env`

**Note**: Without Gemini API key, system runs with realistic mock data.

## Database Schema

### experiments
- Stores experiment metadata
- Tracks experiment type and creation time

### analysis_sessions
- Stores AI analysis results
- Includes predictions, warnings, and guidance
- Links to experiment

### experiment_components
- Stores detected components
- Tracks properties and connections
- Links to analysis session

## API Endpoints

### POST /api/analyze
Analyze experiment image

**Request:**
```json
{
  "experiment_id": "uuid",
  "experiment_type": "circuits",
  "image_data": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "status": "completed",
  "analysis": { /* full analysis */ }
}
```

### GET /api/sessions/{id}
Retrieve analysis session

### GET /health
Backend health check

## Testing

### Test Backend
```bash
cd backend
python test_analyzer.py
```

### Test Frontend
```bash
npm run dev
# Open http://localhost:5173
```

### Test Full System
1. Start backend: `python backend/app.py`
2. Start frontend: `npm run dev`
3. Open browser and capture image
4. Verify analysis appears

## Building for Production

```bash
npm run build
```

Outputs to `dist/` directory. Deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

Backend can deploy to:
- Heroku
- Railway
- Google Cloud Run
- AWS Lambda

## Performance

- **First Analysis**: 3-5 seconds (AI cold start)
- **Subsequent**: 1-2 seconds (AI warmed up)
- **Mock Mode**: Instant (no AI calls)
- **Image Upload**: <1 second (base64 encoding)

## Security

- Row Level Security (RLS) on all tables
- API keys stored in environment variables
- CORS protection on backend
- Base64 image data truncated in database
- No sensitive data in client-side code

## Future Enhancements

- [ ] Real-time video analysis
- [ ] AR overlays with component labels
- [ ] Multi-language support
- [ ] Mobile apps (iOS/Android)
- [ ] Teacher dashboard
- [ ] Experiment templates library
- [ ] Voice-guided instructions
- [ ] Offline mode
- [ ] Collaborative experiments
- [ ] Historical comparison

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete technical guide
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[backend/PYTHON_EXAMPLES.md](./backend/PYTHON_EXAMPLES.md)** - Python code examples

## Contributing

To add new experiment types:
1. Update `ExperimentTypeSelector.tsx`
2. Add specialized prompt in `ai_analyzer.py`
3. Create mock data for testing
4. Update documentation

## License

Educational demonstration project showcasing:
- Multimodal AI vision
- Real-time safety analysis
- Educational technology
- Full-stack development

## Support

For issues or questions:
1. Check documentation thoroughly
2. Review backend logs
3. Test with mock mode
4. Verify environment variables
5. Check camera permissions

## Acknowledgments

- **Google Gemini AI** - Multimodal vision capabilities
- **Supabase** - Real-time database and auth
- **React Team** - Amazing frontend framework
- **Tailwind CSS** - Beautiful, functional design

---

**Newton's Lens** - Revolutionizing at-home science experiments with intelligent, real-time guidance.

Built to maximize **Innovation** and **Impact** by solving hard problems that previous AI models struggled with.
