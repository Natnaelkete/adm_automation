import json

class ADMCalculator:
    def __init__(self, client_data):
        self.data = client_data
        self.annual_spend = client_data['annual_adm_spend']
        self.years = 5
        self.hours_per_year = 2000
        
    def calculate_all(self):
        results = {}
        
        # 1. Total Program Investment (TCV)
        # Assuming investment is 60% of annual spend spread over 5 years + initial setup
        results['total_program_investment'] = self.annual_spend * 2.5 # Example: 2.5x annual spend over 5 years
        results['investment_by_year'] = [
            results['total_program_investment'] * 0.3, # Yr 1: High setup
            results['total_program_investment'] * 0.25,
            results['total_program_investment'] * 0.2,
            results['total_program_investment'] * 0.15,
            results['total_program_investment'] * 0.1
        ]
        
        # 2. Workforce Savings (Offshore Arbitrage)
        onshore_count = self.data['total_fte_count'] * self.data['onshore_fte_percentage']
        target_offshore_shift = 0.4 # Shift 40% of onshore to offshore
        annual_savings = onshore_count * target_offshore_shift * (self.data['onshore_rate'] - self.data['offshore_rate']) * self.hours_per_year
        results['annual_workforce_savings'] = annual_savings
        results['cumulative_workforce_savings'] = annual_savings * 4.5 # Ramp up over 5 years
        
        # 3. Legacy Cost Reduction
        # Reduction in O&M costs due to modernization
        legacy_spend = sum(app['annual_run_cost'] for app in self.data['applications'] if app['age_years'] > 10)
        results['legacy_cost_reduction_percentage'] = 0.4 # 40% target
        results['annual_legacy_savings'] = legacy_spend * results['legacy_cost_reduction_percentage']
        results['cumulative_legacy_savings'] = results['annual_legacy_savings'] * 3.5 # Ramp up
        
        # 4. Cumulative Business Value
        # Sum of savings + value unlocked (estimated as 2x of savings)
        results['cumulative_business_value'] = (results['cumulative_workforce_savings'] + results['cumulative_legacy_savings']) * 2.5
        
        # 5. Target ROI
        results['target_roi_actual'] = (results['cumulative_business_value'] / results['total_program_investment']) * 100
        
        # 6. Modernization Matrix Summary
        results['modernization_counts'] = {
            "Retire": 0, "Retain": 0, "Rehost": 0, "Replatform": 0, "Refactor": 0, "Modernize": 0
        }
        for app in self.data['applications']:
            disp = app.get('disposition', 'Retain')
            results['modernization_counts'][disp] = results['modernization_counts'].get(disp, 0) + 1
            
        return results

if __name__ == "__main__":
    import os
    script_dir = os.path.dirname(__file__)
    data_path = os.path.join(script_dir, '..', 'data', 'client_input.json')
    with open(data_path, 'r') as f:
        data = json.load(f)
    calc = ADMCalculator(data)
    res = calc.calculate_all()
    print(json.dumps(res, indent=2))
