from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import base64
from datetime import datetime
from ai_analyzer import ExperimentAnalyzer
from database import Database

app = Flask(__name__)
CORS(app)

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

db = Database()
analyzer = ExperimentAnalyzer()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze_experiment():
    try:
        data = request.get_json()

        if not data or 'image_data' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        experiment_id = data.get('experiment_id')
        experiment_type = data.get('experiment_type', 'general')
        image_data = data.get('image_data')

        analysis_result = analyzer.analyze_image(image_data, experiment_type)

        session_id = db.create_analysis_session(
            experiment_id=experiment_id,
            image_data=image_data,
            analysis_result=analysis_result
        )

        if analysis_result.get('components'):
            for component in analysis_result['components']:
                db.create_component(session_id, component)

        return jsonify({
            'session_id': session_id,
            'status': 'completed',
            'analysis': analysis_result
        })

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        session = db.get_session(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        return jsonify(session)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
