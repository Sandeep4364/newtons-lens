import os
from supabase import create_client, Client
from typing import Dict, List, Any, Optional
import json

class Database:
    def __init__(self):
        supabase_url = os.environ.get('SUPABASE_URL', '')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

        self.client: Client = create_client(supabase_url, supabase_key)

    def create_analysis_session(
        self,
        experiment_id: str,
        image_data: str,
        analysis_result: Dict[str, Any]
    ) -> str:
        try:
            session_data = {
                'experiment_id': experiment_id,
                'image_data': image_data[:1000],
                'ai_observations': {
                    'observations': analysis_result.get('observations', ''),
                    'components_summary': len(analysis_result.get('components', []))
                },
                'predicted_outcome': analysis_result.get('predicted_outcome', ''),
                'safety_warnings': analysis_result.get('safety_warnings', []),
                'guidance': analysis_result.get('guidance', []),
                'confidence_score': analysis_result.get('confidence_score', 0.0),
                'status': 'completed'
            }

            response = self.client.table('analysis_sessions').insert(session_data).execute()

            return response.data[0]['id']

        except Exception as e:
            print(f"Database error creating session: {str(e)}")
            raise

    def create_component(self, session_id: str, component: Dict[str, Any]) -> str:
        try:
            component_data = {
                'session_id': session_id,
                'component_type': component.get('type', 'unknown'),
                'detected_properties': component.get('properties', {}),
                'position': {'description': component.get('position', '')},
                'connections': component.get('connections', [])
            }

            response = self.client.table('experiment_components').insert(component_data).execute()

            return response.data[0]['id']

        except Exception as e:
            print(f"Database error creating component: {str(e)}")
            raise

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.client.table('analysis_sessions').select('*').eq('id', session_id).execute()

            if response.data:
                return response.data[0]
            return None

        except Exception as e:
            print(f"Database error getting session: {str(e)}")
            raise
