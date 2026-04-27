import os
import markdown2
import re
from jinja2 import Environment, FileSystemLoader

class ADMRenderer:
    def __init__(self, template_dir: str):
        self.env = Environment(loader=FileSystemLoader(template_dir))
        self.template = self.env.get_template('base.html')

    def render(self, client_data: dict, financials: dict, generated_content: dict, output_path: str):
        sections = list(generated_content.keys())
        
        # Convert markdown to HTML
        html_content = {}
        for section, content in generated_content.items():
            # Robustly strip markdown code block markers (case-insensitive, handles whitespace)
            clean_content = re.sub(r'^```(?:markdown)?\s*', '', content, flags=re.MULTILINE | re.IGNORECASE)
            clean_content = re.sub(r'\s*```$', '', clean_content, flags=re.MULTILINE | re.IGNORECASE)
            clean_content = clean_content.strip()
            
            # Convert markdown to HTML
            html = markdown2.markdown(clean_content)
            
            # Strip the first H1 or H2 if it's just the section title (prevent duplication)
            html = re.sub(r'<(h1|h2)>.*?' + re.escape(section) + r'.*?</\1>', '', html, count=1, flags=re.IGNORECASE | re.DOTALL)
            
            html_content[section] = html.strip()
        
        html_output = self.template.render(
            client_data=client_data,
            financials=financials,
            generated_content=html_content,
            sections=sections
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"Document successfully rendered to: {output_path}")

if __name__ == "__main__":
    # Test render
    renderer = ADMRenderer('templates')
    renderer.render(
        {"company_name": "TestCorp", "applications": []},
        {"total_program_investment": 100000000, "cumulative_business_value": 500000000, "target_roi_actual": 400},
        {"Executive Summary": "## Executive Summary\nTest content"},
        "test_output.html"
    )
