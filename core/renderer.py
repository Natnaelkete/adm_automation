import os
from jinja2 import Environment, FileSystemLoader

class ADMRenderer:
    def __init__(self, template_dir: str):
        self.env = Environment(loader=FileSystemLoader(template_dir))
        self.template = self.env.get_template('base.html')

    def render(self, client_data: dict, financials: dict, generated_content: dict, output_path: str):
        sections = list(generated_content.keys())
        
        html_output = self.template.render(
            client_data=client_data,
            financials=financials,
            generated_content=generated_content,
            sections=sections
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"Document successfully rendered to: {output_path}")

if __name__ == "__main__":
    # Test render
    renderer = ADMRenderer('../templates')
    renderer.render(
        {"company_name": "TestCorp", "applications": []},
        {"total_program_investment": 100000000, "cumulative_business_value": 500000000, "target_roi_actual": 400},
        {"Executive Summary": "Test content"},
        "test_output.html"
    )
