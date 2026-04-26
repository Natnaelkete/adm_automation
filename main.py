import os
import json
import argparse
from dotenv import load_dotenv
from core.calculator import ADMCalculator
from core.generator import ADMGenerator
from core.renderer import ADMRenderer

# Load environment variables from .env file
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description="ADM Document Automation")
    parser.add_argument("--input", default="data/client_input.json", help="Path to client input JSON")
    parser.add_argument("--output", default="outputs/Global_Finance_ADM.html", help="Path for output HTML")
    parser.add_argument("--api-key", default=os.getenv("GOOGLE_AI_API_KEY"), help="Google AI API Key (can also be set in .env)")
    parser.add_argument("--mock", action="store_true", help="Run in mock mode without AI calls")
    
    args = parser.parse_args()

    # 1. Load Data
    print(f"Loading client data from {args.input}...")
    with open(args.input, 'r') as f:
        client_data = json.load(f)

    # 2. Run Financial Calculations
    print("Calculating financials...")
    calc = ADMCalculator(client_data)
    financials = calc.calculate_all()

    # 3. Generate AI Content
    print("Starting AI generation pipeline (12 sections)...")
    try:
        gen = ADMGenerator(api_key=args.api_key, mock=args.mock)
    except (ImportError, ValueError, RuntimeError) as e:
        print(f"\nERROR: {e}")
        return

    generated_content = gen.generate_all(client_data, financials)

    # 4. Render HTML
    print("Rendering final HTML document...")
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    renderer = ADMRenderer(template_dir)
    renderer.render(client_data, financials, generated_content, args.output)

    print("\n" + "="*50)
    print(f"DONE! Generated: {args.output}")
    print("="*50)

if __name__ == "__main__":
    main()
