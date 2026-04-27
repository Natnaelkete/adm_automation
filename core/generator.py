import os
import json
import time
from typing import Dict, List

# Try to import google-genai, but allow for mock usage if not installed
try:
    from google import genai
    HAS_GOOGLE = True
except ImportError:
    HAS_GOOGLE = False

try:
    from azure.ai.inference import ChatCompletionsClient
    from azure.ai.inference.models import SystemMessage, UserMessage
    from azure.core.credentials import AzureKeyCredential
    HAS_GITHUB = True
except ImportError:
    HAS_GITHUB = False

class ADMGenerator:
    def __init__(self, api_key: str = None, mock: bool = False, provider: str = "github"):
        self.mock = mock
        self.provider = os.getenv("AI_PROVIDER", provider).lower()
        
        if not self.mock:
            if self.provider == "github":
                if not HAS_GITHUB:
                    raise ImportError("CRITICAL: 'azure-ai-inference' not found. Run 'pip install azure-ai-inference'.")
                token = os.getenv("GITHUB_TOKEN")
                if not token:
                    raise ValueError("CRITICAL: GITHUB_TOKEN not found in .env")
                self.client = ChatCompletionsClient(
                    endpoint="https://models.github.ai/inference",
                    credential=AzureKeyCredential(token)
                )
                self.model_name = os.getenv("GITHUB_MODEL", "gpt-4o")
            else:
                if not HAS_GOOGLE:
                    raise ImportError("CRITICAL: 'google-genai' library not found. Run 'pip install google-genai'.")
                if not api_key:
                    api_key = os.getenv("GOOGLE_AI_API_KEY")
                if not api_key:
                    raise ValueError("CRITICAL: No Google API Key provided.")
                self.google_client = genai.Client(api_key=api_key)

    def generate_section(self, section_name: str, client_data: Dict, financials: Dict) -> str:
        if self.mock:
            return f"Mock content for {section_name} of {client_data['company_name']}. Strategic value of ${financials['cumulative_business_value']:,}."

        prompt = self._build_prompt(section_name, client_data, financials)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if self.provider == "github":
                    response = self.client.complete(
                        messages=[
                            SystemMessage(content="You are an expert ADM Transformation Architect."),
                            UserMessage(content=prompt),
                        ],
                        model=self.model_name,
                        temperature=0.7,
                    )
                    return response.choices[0].message.content
                else:
                    response = self.google_client.models.generate_content(
                        model='gemini-1.5-flash',
                        contents=prompt
                    )
                    return response.text
            except Exception as e:
                print(f"Error generating {section_name} via {self.provider} (Attempt {attempt+1}): {e}")
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
        2. Deliver high-impact, strategy-consultant level narrative using rich markdown (bolding, lists, etc.).
        3. Do NOT add generic filler. Every sentence must be substantive to {client_data['company_name']}.
        4. Focus on the transformation from 'Legacy Technical Debt' to 'Innovation Engine'.
        5. Return ONLY the markdown text. 
        6. IMPORTANT: Do NOT wrap the content in markdown code blocks like ```markdown or ```. Just the raw text.
        7. Use **Bold** text frequently for key strategic insights and numbers.
        """
        return prompt

    def generate_all(self, client_data: Dict, financials: Dict, progress_callback=None) -> Dict[str, str]:
        sections = [
            "Executive Summary", "Portfolio Analysis", "App Inventory", 
            "Benchmarking", "AI Transformation", "Modernization Factory", 
            "Cloud & Data Strategy", "Financials & Value", "Roadmap", 
            "Delivery Center Architecture", "Benchmarking Summary", "Partnership Overview"
        ]
        results = {}
        for i, section in enumerate(sections):
            print(f"Generating section: {section} ({i+1}/{len(sections)})...")
            results[section] = self.generate_section(section, client_data, financials)
            
            if progress_callback:
                progress_callback(i + 1, len(sections), section)

            # Add a small delay between sections to avoid hitting Rate Limits (429)
            if i < len(sections) - 1:
                time.sleep(5) 
        return results

if __name__ == "__main__":
    # Test with mock
    gen = ADMGenerator(mock=True)
    test_data = {"company_name": "TestCorp", "industry": "Tech", "annual_adm_spend": 1000000, "applications": [], "competitors": []}
    test_fin = {"cumulative_business_value": 5000000, "total_program_investment": 1000000, "target_roi_actual": 400, "annual_workforce_savings": 200000}
    print(gen.generate_section("Executive Summary", test_data, test_fin))
