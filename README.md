# ADM Document Automation System

This system automates the generation of Account Development Master (ADM) documents, transforming structured client data into publication-ready strategy documents.

## Core Principle
**AI generates language. Code generates numbers.**
Every financial figure in the document (ROI, TCV, investment by year) is computed by the logic layer, ensuring numerical consistency and rigor that AI models cannot guarantee on their own.

## Project Structure
- `main.py`: Entry point for the orchestration pipeline.
- `core/`:
    - `calculator.py`: Financial logic and KPI derivation.
    - `generator.py`: AI generation pipeline with retry logic.
    - `renderer.py`: HTML assembly using Jinja2 templates.
- `data/`:
    - `client_input.json`: Structured source of truth for client data.
    - `schema.json`: JSON schema for data validation.
- `templates/`:
    - `base.html`: High-end CSS and layout template based on the Cisco benchmark.
- `outputs/`: Generated HTML documents.

## Setup & Installation
1. Ensure Python 3.10+ is installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Setup API Key:
   - Copy `.env.example` to `.env`
   - Open `.env` and paste your Google AI API key.

## Usage
### 1. Prepare Client Data
Update `data/client_input.json` with the target client's profile, application inventory, and competitive landscape.

### 2. Generate Real Document (Requires API Key)
Use these scripts for full AI generation. If no key is found, the program will **exit with an error**:
- Windows: `generate_adm.bat`
- Bash: `bash generate_adm.sh`

### 3. Generate Mock Document (No Key Required)
Use these scripts to test the structure and visual layout without calling the AI:
- Windows: `generate_mock.bat`
- Bash: `bash generate_mock.sh`

## Features
- **Data-Driven Narratives**: Injects real financials into AI prompts for hyper-specific output.
- **Fail-Safe Pipeline**: 12-section sequential generation with automatic retries for individual sections.
- **Self-Contained HTML**: Produces a single, portable HTML file with advanced CSS, sidebar navigation, and dynamic components.
- **Modern UI**: Matches the visual quality of the provided benchmark with responsive grids and high-impact typography.
