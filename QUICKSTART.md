# Newton's Lens - Quick Start Guide

Get Newton's Lens running in 5 minutes!

## What You'll Build

An AI-powered lab assistant that:
- Analyzes science experiments through your camera
- Predicts outcomes before you run them
- Warns about safety hazards
- Provides step-by-step guidance

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- A camera (laptop/phone)
- 5 minutes of your time

## Step 1: Run the Frontend (1 minute)

The frontend is already built! Just start it:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` - you'll see the Newton's Lens interface.

## Step 2: Set Up Python Backend (2 minutes)

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Quick Configuration
```bash
cp .env.example .env
```

**Important**: Edit `backend/.env` and add your Supabase credentials. These are in your Supabase dashboard.

### Start the Backend
```bash
python app.py
```

Backend runs on `http://localhost:5000`

## Step 3: Try It Out (2 minutes)

1. **Select Experiment Type** - Choose "Circuits & Electronics"

2. **Start Camera** - Click "Start Camera" and allow permissions

3. **Point at Something** - Point your camera at:
   - An LED with a battery
   - A simple circuit diagram on your screen
   - Any electronic components

4. **Analyze** - Click "Analyze Setup"

5. **See Magic** - Watch as AI:
   - Identifies components
   - Predicts what will happen
   - Warns about issues
   - Provides guidance

## Without Google Gemini API Key?

No problem! The system works with realistic mock data. You'll see example analyses for:
- Circuit experiments with LED and battery
- Chemistry setups with beakers and chemicals
- Physics experiments with ramps and motion

To use real AI vision:
1. Get free API key: https://makersuite.google.com/app/apikey
2. Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`
3. Restart backend

## Test the Backend Independently

```bash
cd backend
python test_analyzer.py
```

This runs the AI analyzer in mock mode and shows you what it can detect.

## Common Issues

### "Can't connect to backend"
- Is the backend running? Check `http://localhost:5000/health`
- Update frontend `.env`: `VITE_BACKEND_URL=http://localhost:5000`

### "Camera not working"
- Allow camera permissions in browser
- Use HTTPS or localhost
- Try a different browser

### "Analysis takes too long"
- First request to Gemini API can be slow
- Subsequent requests are faster
- Mock mode is instant

## What to Try

1. **Circuits**
   - Photo of LED + battery
   - Arduino setup
   - Breadboard circuits
   - Will warn about missing resistors!

2. **Chemistry**
   - Beakers and chemicals
   - Safety equipment
   - Mixing setups
   - Will warn about safety gear!

3. **Physics**
   - Ramps and motion
   - Pendulum setups
   - Spring systems
   - Will analyze forces!

## Project Structure

```
newton-lens/
├── src/              # React frontend
├── backend/          # Python Flask API
│   ├── app.py       # Main server
│   ├── ai_analyzer.py  # AI vision logic
│   └── database.py  # Supabase integration
└── dist/            # Built frontend (after npm run build)
```

## Next Steps

1. Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for full details
2. Read [backend/README.md](./backend/README.md) for API docs
3. Get Gemini API key for real AI analysis
4. Deploy to production (see deployment guide)
5. Customize for your specific experiments

## Key Features

- **Real-time Analysis**: Instant feedback on your setup
- **Safety First**: Identifies hazards before they happen
- **Educational**: Learn proper experiment techniques
- **Flexible**: Works with circuits, chemistry, physics
- **Smart**: Uses Google's Gemini AI vision

## Support

Having issues? Check:
1. Both frontend and backend are running
2. Environment variables are set correctly
3. Camera permissions are granted
4. Try mock mode first (no API key needed)

## Demo Mode (No Setup)

Want to see it work without setup?
1. Just run the frontend: `npm run dev`
2. Don't run the backend
3. You'll get a "backend connection error"
4. But you can still see the beautiful UI!

For full functionality, run both frontend and backend.

## Architecture Overview

```
Camera → React Frontend → Flask Backend → Gemini AI
                ↓              ↓
            Supabase ←─────────┘
```

## Tips for Best Results

1. **Good Lighting**: Ensure your setup is well-lit
2. **Clear View**: Keep camera stable, capture full setup
3. **Close Up**: Get close enough to see component details
4. **Right Type**: Select the correct experiment type
5. **Wait**: First AI analysis takes 3-5 seconds

## Development Mode

Frontend: `npm run dev` (hot reload enabled)
Backend: `python app.py` (debug mode enabled)

Changes to frontend reload automatically!
Changes to backend require restart.

## Production Build

```bash
npm run build
cd backend
# Deploy backend to your preferred platform
# Deploy frontend dist/ to static hosting
```

---

Ready to revolutionize science education? Start with Step 1 above!

For detailed documentation, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
