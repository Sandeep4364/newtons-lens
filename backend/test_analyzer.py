#!/usr/bin/env python3
"""
Test script for Newton's Lens AI Analyzer
This demonstrates how to use the AI analyzer independently
"""

import os
import base64
from ai_analyzer import ExperimentAnalyzer
import json

def test_with_image_file(image_path: str, experiment_type: str = 'circuits'):
    """
    Test the analyzer with a local image file
    """
    print(f"\n{'='*60}")
    print(f"Testing Newton's Lens Analyzer")
    print(f"Image: {image_path}")
    print(f"Experiment Type: {experiment_type}")
    print(f"{'='*60}\n")

    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return

    with open(image_path, 'rb') as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        image_data = f"data:image/jpeg;base64,{image_data}"

    analyzer = ExperimentAnalyzer()

    print("Analyzing image...")
    result = analyzer.analyze_image(image_data, experiment_type)

    print("\n" + "="*60)
    print("ANALYSIS RESULTS")
    print("="*60 + "\n")

    print(f"Confidence Score: {result['confidence_score']*100:.1f}%\n")

    if result.get('observations'):
        print("OBSERVATIONS:")
        print(f"  {result['observations']}\n")

    if result.get('components'):
        print(f"COMPONENTS DETECTED ({len(result['components'])}):")
        for i, comp in enumerate(result['components'], 1):
            print(f"\n  {i}. {comp['type']}")
            if comp.get('properties'):
                for key, value in comp['properties'].items():
                    print(f"     - {key}: {value}")
            if comp.get('position'):
                print(f"     - Position: {comp['position']}")
            if comp.get('connections'):
                print(f"     - Connections: {', '.join(comp['connections'])}")

    if result.get('predicted_outcome'):
        print(f"\nPREDICTED OUTCOME:")
        print(f"  {result['predicted_outcome']}\n")

    if result.get('safety_warnings'):
        print(f"SAFETY WARNINGS ({len(result['safety_warnings'])}):")
        for i, warning in enumerate(result['safety_warnings'], 1):
            severity = warning['severity'].upper()
            print(f"\n  {i}. [{severity}] {warning['message']}")
            print(f"     → {warning['recommendation']}")

    if result.get('guidance'):
        print(f"\nSTEP-BY-STEP GUIDANCE:")
        for step in result['guidance']:
            print(f"  {step['step']}. {step['instruction']}")

    print("\n" + "="*60 + "\n")

    return result

def test_mock_mode():
    """
    Test the analyzer in mock mode (without API key)
    """
    print("\n" + "="*60)
    print("Testing MOCK MODE (No API Key Required)")
    print("="*60 + "\n")

    os.environ.pop('GEMINI_API_KEY', None)

    analyzer = ExperimentAnalyzer()

    for exp_type in ['circuits', 'chemistry', 'physics']:
        print(f"\nTesting {exp_type.upper()} mock analysis...")
        result = analyzer.analyze_image("mock_image_data", exp_type)
        print(f"  ✓ Got {len(result.get('components', []))} components")
        print(f"  ✓ Got {len(result.get('safety_warnings', []))} warnings")
        print(f"  ✓ Got {len(result.get('guidance', []))} guidance steps")
        print(f"  ✓ Confidence: {result['confidence_score']*100:.0f}%")

    print("\n✓ All mock tests passed!\n")

def save_result_to_file(result: dict, output_file: str = 'analysis_result.json'):
    """
    Save analysis result to JSON file
    """
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"\n✓ Results saved to {output_file}")

def main():
    """
    Main test function
    """
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║           Newton's Lens - AI Analyzer Test Suite            ║
    ║                                                              ║
    ║  This script demonstrates the AI analysis capabilities      ║
    ║  of Newton's Lens for science experiment safety.            ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    if os.getenv('GEMINI_API_KEY'):
        print("✓ Gemini API Key detected - will use real AI analysis")
        print("\nTo test with your own image:")
        print("  python test_analyzer.py path/to/image.jpg circuits")
        print("\nSupported experiment types:")
        print("  - circuits")
        print("  - chemistry")
        print("  - physics")
        print("  - general")
    else:
        print("! No Gemini API Key found - will use mock data")
        print("\nTo use real AI analysis:")
        print("  1. Get API key from https://makersuite.google.com/app/apikey")
        print("  2. Set environment variable: export GEMINI_API_KEY=your_key")
        print("  3. Or add to .env file")

    test_mock_mode()

    print("\n" + "="*60)
    print("Test Complete!")
    print("="*60 + "\n")

if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        experiment_type = sys.argv[2] if len(sys.argv) > 2 else 'circuits'
        result = test_with_image_file(image_path, experiment_type)
        if result:
            save_result_to_file(result)
    else:
        main()
