import os
import json
import time
from typing import Dict, List

# Try to import google-generativeai, but allow for mock usage if not installed
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class ADMGenerator:
    def __init__(self, api_key: str = None, mock: bool = False):
        self.mock = mock
        
        if not self.mock:
            if not HAS_GENAI:
                raise ImportError("CRITICAL: 'google-generativeai' library not found. Run 'pip install google-generativeai' or use --mock.")
            
            if not api_key:
                raise ValueError("CRITICAL: No API Key provided. Set GOOGLE_AI_API_KEY in .env or use --api-key.")
            
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
            except Exception as e:
                raise RuntimeError(f"CRITICAL: Failed to configure AI model: {e}")

    def generate_section(self, section_name: str, client_data: Dict, financials: Dict) -> str:
        if self.mock:
            return f"Mock content for {section_name} of {client_data['company_name']}. Strategic value of ${financials['cumulative_business_value']:,}."

        prompt = self._build_prompt(section_name, client_data, financials)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Error generating {section_name} (Attempt {attempt+1}): {e}")
                time.sleep(2 ** attempt)
        return f"ERROR: Failed to generate {section_name}"

    def _build_prompt(self, section_name: str, client_data: Dict, financials: Dict) -> str:
        # Extract relevant apps and competitors
        apps_summary = ", ".join([app['name'] for app in client_data['applications'][:3]])
        comp_summary = ", ".join([c['name'] for c in client_data['competitors']])
        
        prompt = f"""
        ADM DOCUMENT GENERATION - SECTION: {section_name}
        
        CLIENT: {client_data['company_name']}
        INDUSTRY: {client_data['industry']}
        
        NUMERICAL RIGOR (MUST USE THESE FIGURES):
        - Annual ADM Spend: ${client_data['annual_adm_spend']:,}
        - Total 5-Year Investment: ${financials['total_program_investment']:,}
        - Cumulative Business Value: ${financials['cumulative_business_value']:,}
        - Target ROI: {financials['target_roi_actual']:.1f}%
        - Annual Workforce Savings: ${financials['annual_workforce_savings']:,}
        
        CONTEXT:
        - Key Applications: {apps_summary}
        - Top Competitors: {comp_summary}
        
        INSTRUCTIONS:
        1. Mirror the structure, depth, and analytical rigor of the Cisco ADM reference.
        2. Deliver high-impact, strategy-consultant level narrative.
        3. Do NOT add generic filler. Every sentence must be substantive to {client_data['company_name']}.
        4. Focus on the transformation from 'Legacy Technical Debt' to 'Innovation Engine'.
        5. Return ONLY the markdown/HTML content for this section. No conversational preamble.
        """
        return prompt

    def generate_all(self, client_data: Dict, financials: Dict) -> Dict[str, str]:
        sections = [
            "Executive Summary", "Portfolio Analysis", "App Inventory", 
            "Benchmarking", "AI Transformation", "Modernization Factory", 
            "Cloud & Data Strategy", "Financials & Value", "Roadmap", 
            "Delivery Center Architecture", "Benchmarking Summary", "Partnership Overview"
        ]
        results = {}
        for section in sections:
            print(f"Generating section: {section}...")
            results[section] = self.generate_section(section, client_data, financials)
        return results

if __name__ == "__main__":
    # Test with mock
    gen = ADMGenerator(mock=True)
    test_data = {"company_name": "TestCorp", "industry": "Tech", "annual_adm_spend": 1000000, "applications": [], "competitors": []}
    test_fin = {"cumulative_business_value": 5000000, "total_program_investment": 1000000, "target_roi_actual": 400, "annual_workforce_savings": 200000}
    print(gen.generate_section("Executive Summary", test_data, test_fin))
