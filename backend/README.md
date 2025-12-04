# LinkedIn Job Scraper API | Flask

A Python Flask API to scrape LinkedIn job postings using Selenium and BeautifulSoup. 
This API accepts job search parameters via POST requests and returns job listings as JSON.

## Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python linkedin.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T10:30:00.123456",
  "service": "LinkedIn Job Scraper API"
}
```

### Scrape Jobs

**POST** `/scrape`

Scrapes LinkedIn jobs based on provided parameters.

**Request Body:**
```json
{
  "job_keyword": "junior developer",
  "countries": ["Belgium", "Netherlands"],
  "date_posted": "24h",
  "experience_levels": [],
  "workplace_types": ["2", "3"]
}
```

**Parameters:**
- `job_keyword` (string, optional): Job search keyword (default: "junior developer")
- `countries` (array, required): List of countries to search in
- `date_posted` (string, optional): Time filter - "any", "24h", "week", "month" (default: "24h")
- `experience_levels` (array, optional): Filter by experience - [] = All, ["1"] = Internship, ["2"] = Entry level, ["3"] = Associate, ["4"] = Mid-Senior, ["5"] = Director, ["6"] = Executive
- `workplace_types` (array, optional): Filter by type - ["1"] = On-site, ["2"] = Remote, ["3"] = Hybrid

**Response (Success):**
```json
{
  "status": "success",
  "timestamp": "2025-12-04T10:30:00.123456",
  "total_jobs": 42,
  "parameters": {
    "job_keyword": "junior developer",
    "countries": ["Belgium", "Netherlands"],
    "date_posted": "24h",
    "experience_levels": [],
    "workplace_types": ["2", "3"]
  },
  "jobs": [
    {
      "country": "Belgium",
      "job_title": "Junior Developer",
      "company_name": "Tech Company",
      "company_url": "https://...",
      "location": "Brussels, Belgium",
      "benefit": "Dental insurance",
      "posted": "1 day ago",
      "company_description": "...",
      "job_url": "https://...",
      "job_description": "..."
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "countries must be a non-empty list",
  "code": "INVALID_COUNTRIES",
  "timestamp": "2025-12-04T10:30:00.123456"
}
```

## Example Usage

Using curl:
```bash
curl -X POST http://localhost:5000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "job_keyword": "python developer",
    "countries": ["Belgium"],
    "date_posted": "week",
    "experience_levels": ["2"],
    "workplace_types": ["2", "3"]
  }'
```

Using Python:
```python
import requests
import json

url = "http://localhost:5000/scrape"
payload = {
    "job_keyword": "python developer",
    "countries": ["Belgium"],
    "date_posted": "week",
    "experience_levels": ["2"],
    "workplace_types": ["2", "3"]
}

response = requests.post(url, json=payload)
jobs = response.json()
print(json.dumps(jobs, indent=2))
```

## Features

- ✅ Scrapes LinkedIn job listings with Selenium
- ✅ Filters by keyword, location, date, experience level, and workplace type
- ✅ Extracts full job descriptions and company information
- ✅ Returns structured JSON data
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Logging for debugging

## Requirements

- Python 3.7+
- Chrome/Chromium browser
- Dependencies listed in `requirements.txt`

