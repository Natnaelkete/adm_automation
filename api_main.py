import os
import uuid
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from core.models import ClientInput
from core.calculator import ADMCalculator
from core.generator import ADMGenerator
from core.renderer import ADMRenderer
from dotenv import load_dotenv

from fastapi.staticfiles import StaticFiles

load_dotenv()

app = FastAPI(title="ADM Document Automation API")

# Mount outputs directory to serve generated files
if not os.path.exists("outputs"):
    os.makedirs("outputs")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store (Use Redis/Database for production)
jobs: Dict[str, Dict] = {}

def run_generation_task(job_id: str, client_data: Dict):
    try:
        # 1. Financials
        calc = ADMCalculator(client_data)
        financials = calc.calculate_all()
        jobs[job_id]["financials"] = financials
        jobs[job_id]["status"] = "generating"

        # 2. AI Content
        api_key = os.getenv("GOOGLE_AI_API_KEY")
        gen = ADMGenerator(api_key=api_key, mock=False)
        
        def progress_callback(current, total, section):
            jobs[job_id]["progress"] = int((current / total) * 100)
            jobs[job_id]["current_section"] = section

        generated_content = gen.generate_all(client_data, financials, progress_callback=progress_callback)
        jobs[job_id]["generated_content"] = generated_content

        # 3. Render HTML
        output_filename = f"outputs/{job_id}.html"
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        renderer = ADMRenderer(template_dir)
        renderer.render(client_data, financials, generated_content, output_filename)
        
        jobs[job_id]["output_file"] = output_filename
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        print(f"Job {job_id} failed: {e}")

@app.post("/api/generate")
async def generate_report(input_data: ClientInput, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    client_data_dict = input_data.model_dump()
    
    jobs[job_id] = {
        "status": "pending",
        "progress": 0,
        "current_section": "Initializing",
        "client_name": input_data.company_name
    }
    
    background_tasks.add_task(run_generation_task, job_id, client_data_dict)
    
    return {"job_id": job_id}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/api/jobs")
async def list_jobs():
    return [{"job_id": id, **data} for id, data in jobs.items()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
