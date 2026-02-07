# Newton's Lens - Complete Implementation Guide

An AI-powered lab partner that analyzes science experiments in real-time using multimodal vision AI.

## Overview

Newton's Lens helps students conducting at-home experiments by:
- Analyzing experimental setups through camera capture
- Identifying components and their connections
- Predicting outcomes before execution
- Providing safety warnings and recommendations
- Offering step-by-step guidance

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase Client** for database operations

### Backend (Python)
- **Flask** web framework
- **Google Gemini AI** (gemini-1.5-pro) for multimodal vision
- **Supabase Python Client** for database
- **Flask-CORS** for cross-origin requests

### Database
- **Supabase PostgreSQL** with Row Level Security
- Three main tables: experiments, analysis_sessions, experiment_components

## Project Structure

```
newton-lens/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── CameraCapture.tsx     # Camera interface with capture
│   │   ├── AnalysisDisplay.tsx   # Shows AI analysis results
│   │   └── ExperimentTypeSelector.tsx  # Experiment type selection
│   ├── lib/
│   │   └── supabase.ts           # Supabase client and types
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
│
├── backend/                      # Python Flask backend
│   ├── app.py                    # Main Flask application
│   ├── ai_analyzer.py            # AI vision analysis logic
│   ├── database.py               # Database operations
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── README.md                 # Backend documentation
│
└── supabase/
    └── migrations/               # Database migrations
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account (already configured)
- Google Gemini API key (for AI analysis)

### 1. Frontend Setup

The frontend is already built! To run in development:

```bash
npm install
npm run dev
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

#### Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

**Note**: Without a Gemini API key, the system will use mock data for demonstrations.

#### Run the Backend
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Connect Frontend to Backend

Update your `.env` file in the project root:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## How It Works

### System Architecture

```
┌─────────────┐     Camera      ┌──────────────┐     HTTP      ┌────────────┐
│   Student   │ ──────────────> │   Frontend   │ ───────────> │   Flask    │
│   Camera    │                 │   (React)    │              │  Backend   │
└─────────────┘                 └──────────────┘              └────────────┘
                                        │                             │
                                        │                             │
                                        v                             v
                                ┌──────────────┐              ┌────────────┐
                                │   Supabase   │ <─────────── │  Gemini AI │
                                │   Database   │              │   Vision   │
                                └──────────────┘              └────────────┘
```

### Workflow

1. **Student selects experiment type** (circuits, chemistry, physics, general)
2. **Camera captures the setup** using device camera
3. **Image is sent to backend** as base64-encoded data
4. **AI analyzes the image**:
   - Identifies components (resistors, LEDs, chemicals, etc.)
   - Understands connections and relationships
   - Predicts what will happen
   - Generates safety warnings
   - Creates step-by-step guidance
5. **Results stored in Supabase** for history and tracking
6. **Frontend displays analysis** with warnings and guidance

### AI Analysis Process

The AI analyzer (`ai_analyzer.py`) uses specialized prompts for each experiment type:

**For Circuits:**
- Identifies electronic components
- Checks polarity and connections
- Calculates current and voltage
- Warns about shorts or damage risks

**For Chemistry:**
- Identifies chemicals and glassware
- Checks safety equipment
- Warns about dangerous reactions
- Provides mixing order guidance

**For Physics:**
- Identifies mechanical components
- Analyzes forces and motion
- Checks stability
- Predicts physical outcomes

## Database Schema

### experiments
Stores basic experiment information
- `id`: Unique identifier
- `title`: Experiment name
- `experiment_type`: circuits/chemistry/physics/general
- `description`: Experiment details

### analysis_sessions
Stores AI analysis results
- `id`: Session identifier
- `experiment_id`: Reference to experiment
- `image_data`: Captured image (truncated)
- `ai_observations`: What AI detected
- `predicted_outcome`: What will happen
- `safety_warnings`: Array of warnings with severity
- `guidance`: Step-by-step instructions
- `confidence_score`: AI confidence (0-1)
- `status`: analyzing/completed/error

### experiment_components
Stores individual components detected
- `id`: Component identifier
- `session_id`: Reference to analysis session
- `component_type`: Type of component
- `detected_properties`: Component attributes
- `position`: Location in image
- `connections`: Related components

## API Endpoints

### Backend API

#### POST /api/analyze
Analyzes an experiment setup image

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
  "analysis": {
    "observations": "Detailed description...",
    "components": [...],
    "predicted_outcome": "What will happen...",
    "safety_warnings": [...],
    "guidance": [...],
    "confidence_score": 0.95
  }
}
```

#### GET /api/sessions/{session_id}
Retrieves a specific analysis session

#### GET /health
Health check endpoint

## Key Features

### 1. Real-Time Camera Capture
- Uses device camera (mobile or desktop)
- Supports environment-facing camera
- High-resolution image capture
- Base64 encoding for transmission

### 2. AI Vision Analysis
- Powered by Google Gemini 1.5 Pro
- Multimodal understanding (text + image)
- Context-aware analysis based on experiment type
- Structured JSON output

### 3. Safety Prediction
- Identifies hazards before execution
- Severity levels: low, medium, high, critical
- Specific recommendations for each warning
- Prevents equipment damage and safety risks

### 4. Educational Guidance
- Step-by-step instructions
- Proper execution order
- Measurement techniques
- Safety best practices

### 5. Component Detection
- Identifies individual components
- Maps connections and relationships
- Tracks position in setup
- Properties and specifications

## Experiment Types

### 1. Circuits & Electronics
Perfect for students learning electronics
- LED circuits
- Resistor networks
- Arduino projects
- Breadboard prototyping

**Example Detection:**
- Components: LEDs, resistors, batteries, wires
- Warnings: Short circuits, polarity issues, overcurrent
- Guidance: Proper resistor calculations, connection order

### 2. Chemistry
Safety-focused chemical experiment analysis
- Mixing reactions
- Titrations
- pH experiments
- Solution preparation

**Example Detection:**
- Components: Beakers, chemicals, safety equipment
- Warnings: Dangerous reactions, missing PPE
- Guidance: Proper mixing order, safety protocols

### 3. Physics & Mechanics
Motion and force experiments
- Inclined planes
- Pendulums
- Spring systems
- Energy transfer

**Example Detection:**
- Components: Ramps, masses, measuring tools
- Warnings: Stability issues, measurement errors
- Guidance: Setup calibration, measurement techniques

### 4. General Science
Flexible analysis for various experiments
- Observation studies
- Data collection
- Basic setups
- Custom experiments

## Advanced Features

### Mock Mode
When `GEMINI_API_KEY` is not set, the system runs with realistic mock data:
- Demonstrates full functionality
- No API costs
- Useful for development and testing
- Example data for each experiment type

### Confidence Scoring
Each analysis includes a confidence score (0-1):
- **0.9-1.0**: Very confident, highly accurate
- **0.7-0.9**: Confident, reliable analysis
- **0.5-0.7**: Moderate confidence, verify results
- **Below 0.5**: Low confidence, retake image

### Error Handling
- Graceful fallback to mock data
- User-friendly error messages
- Detailed logging for debugging
- Transaction safety in database

## Deployment

### Frontend Deployment
The frontend is built and ready:
```bash
npm run build
```

Deploy the `dist/` folder to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### Backend Deployment

#### Option 1: Heroku
```bash
cd backend
heroku create your-app-name
git push heroku main
heroku config:set GEMINI_API_KEY=your_key
```

#### Option 2: Railway
1. Connect your GitHub repository
2. Select the `backend` directory
3. Add environment variables
4. Deploy automatically

#### Option 3: Google Cloud Run
```bash
gcloud run deploy newton-lens-backend \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Environment Variables for Production
Update your frontend `.env` for production:
```env
VITE_BACKEND_URL=https://your-backend.herokuapp.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Testing the Application

### 1. Test Camera Capture
- Allow camera permissions
- Point at any experimental setup
- Capture image
- Verify image is displayed

### 2. Test AI Analysis (with API key)
- Capture a circuit with an LED
- Wait for analysis
- Check for warnings and guidance
- Verify confidence score

### 3. Test Mock Mode (without API key)
- Remove GEMINI_API_KEY from backend
- Capture any image
- Should receive realistic mock data
- All features should work

### 4. Test Different Experiment Types
- Try circuits, chemistry, physics
- Verify type-specific analysis
- Check appropriate warnings for each type

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Try HTTPS (required for camera on many browsers)
- Test on different device/browser

### Backend Connection Error
- Verify backend is running on port 5000
- Check CORS configuration
- Confirm VITE_BACKEND_URL is correct

### AI Analysis Fails
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Review backend logs for errors
- System will fallback to mock mode

### Database Errors
- Verify Supabase credentials
- Check RLS policies
- Ensure tables are created
- Review migration logs

## Performance Optimization

### Image Optimization
- Compress images before upload (0.8 quality)
- Limit image size to 1280x720
- Use JPEG format for smaller size

### Backend Optimization
- Cache AI responses for similar images
- Batch component insertions
- Use connection pooling
- Implement request rate limiting

### Frontend Optimization
- Lazy load analysis display
- Debounce camera captures
- Optimize re-renders
- Use React.memo for components

## Security Considerations

### API Keys
- Never commit API keys to repository
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### Image Data
- Don't store full images long-term
- Truncate base64 data in database
- Implement automatic cleanup
- Consider privacy implications

### Database Security
- RLS policies are enabled
- Restrict service role key access
- Use anon key in frontend
- Audit database access logs

## Future Enhancements

### Planned Features
- [ ] Real-time video analysis
- [ ] AR overlays with component labels
- [ ] Multi-step experiment tracking
- [ ] Collaborative experiments
- [ ] Teacher dashboard
- [ ] Experiment library
- [ ] Voice guidance
- [ ] Multiple language support
- [ ] Mobile app (React Native)
- [ ] Offline mode

### AI Improvements
- [ ] Custom model fine-tuning
- [ ] Component database for faster detection
- [ ] Historical analysis comparison
- [ ] Predictive experiment suggestions
- [ ] Automated report generation

## Contributing

To extend Newton's Lens:

1. **Add New Experiment Types**
   - Update `ExperimentTypeSelector.tsx`
   - Add specialized prompt in `ai_analyzer.py`
   - Create type-specific mock data

2. **Improve AI Prompts**
   - Edit `_build_analysis_prompt()` in `ai_analyzer.py`
   - Test with various images
   - Validate JSON output format

3. **Add New Components**
   - Create React component in `src/components/`
   - Import and use in `App.tsx`
   - Style with Tailwind CSS

## Support

For issues or questions:
1. Check this guide thoroughly
2. Review backend README.md
3. Check backend logs for errors
4. Verify all environment variables
5. Test in mock mode first

## License

This project is built for educational purposes, demonstrating:
- Multimodal AI vision
- Real-time camera integration
- Safety-critical analysis
- Educational technology

---

**Newton's Lens** - Empowering students with AI-powered lab assistance
