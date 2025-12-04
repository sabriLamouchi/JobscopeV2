from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import time
from datetime import datetime
import logging

app = Flask(__name__)

# --- CONFIGURATION ---
# DATE_POSTED codes:            # EXPERIENCE_LEVELS codes:          # WORKPLACE_TYPES codes:    
# "any" = Any time              # [] = All levels                   # [] = All types       
# "24h" = Past 24 hours         # ["1"] = Internship                # ["1"] = On-site  
# "week" = Past week            # ["2"] = Entry level               # ["2"] = Remote   
# "month" = Past month          # ["3"] = Associate                 # ["3"] = Hybrid   
                                # ["4"] = Mid-Senior level          
                                # ["5"] = Director                  
                                # ["6"] = Executive

DEFAULT_CONFIG = {
    "job_keyword": "junior developer",
    "countries": ["Belgium", "Netherlands"],
    "date_posted": "24h",
    "experience_levels": [],
    "workplace_types": ["2", "3"]
}

# --- SCROLL ---
MAX_SCROLL_ATTEMPTS = 200
SCROLL_PAUSE = 5
DETAIL_PAUSE = 2

logging.basicConfig(level=logging.INFO)

# --- HELPER FUNCTIONS ---
def setup_driver():
    """Initialize Chrome WebDriver with options"""
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--incognito")
    return webdriver.Chrome(options=options)

def build_linkedin_url(keyword, location, exp_levels, workplace_types, date_posted):
    """Build LinkedIn search URL with filters"""
    exp_param = ",".join(exp_levels) if exp_levels else ""
    workplace_param = ",".join(workplace_types) if workplace_types else ""
    date_param = ""
    if date_posted == "24h": date_param = "r86400"
    elif date_posted == "week": date_param = "r604800"
    elif date_posted == "month": date_param = "r2592000"

    url = f"https://www.linkedin.com/jobs/search/?keywords={quote_plus(keyword)}&location={quote_plus(location)}"
    if exp_param: url += f"&f_E={exp_param}"
    if workplace_param: url += f"&f_WT={workplace_param}"
    if date_param: url += f"&f_TPR={date_param}"
    url += "&position=1&pageNum=0"
    return url

def scroll_page(driver):
    """Scroll through job listings to load all jobs"""
    attempt = 0
    last_height = driver.execute_script("return document.body.scrollHeight")
    while attempt < MAX_SCROLL_ATTEMPTS:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE)
        try:
            show_more_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "infinite-scroller__show-more-button"))
            )
            show_more_btn.click()
            time.sleep(SCROLL_PAUSE)
        except:
            pass
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
        attempt += 1

def fetch_job_details(driver, job_url):
    """Fetch full job and company descriptions"""
    job_desc = ""
    company_desc = ""
    if not job_url: 
        return job_desc, company_desc
    try:
        driver.get(job_url)
        time.sleep(DETAIL_PAUSE)
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "description__text"))
        )
        job_soup = BeautifulSoup(driver.page_source, "html.parser")
        job_div = job_soup.find("div", class_="description__text")
        job_desc = job_div.get_text(separator="\n", strip=True) if job_div else ""
        company_div = job_soup.find("div", class_="show-more-less-html__markup")
        company_desc = company_div.get_text(separator="\n", strip=True) if company_div else ""
    except Exception as e:
        logging.error(f"Failed to fetch job detail: {e}")
    return job_desc, company_desc

def scrape_linkedin_jobs(job_keyword, countries, experience_levels, workplace_types, date_posted):
    """Main scraping function"""
    driver = setup_driver()
    all_jobs = []
    
    try:
        for country in countries:
            logging.info(f"Scraping LinkedIn Jobs for {country}")
            url = build_linkedin_url(job_keyword, country, experience_levels, workplace_types, date_posted)
            logging.info(f"URL: {url}")
            driver.get(url)
            scroll_page(driver)

            html = driver.page_source
            soup = BeautifulSoup(html, "html.parser")
            job_cards = soup.find_all("div", class_="base-card") 
            
            for idx, card in enumerate(job_cards):
                try:
                    a_tag = card.find("a", class_="base-card__full-link")
                    job_url = a_tag["href"].strip() if a_tag else ""
                    job_title = a_tag.find("span", class_="sr-only").text.strip() if a_tag and a_tag.find("span", class_="sr-only") else ""
                    company_tag = card.find("h4", class_="base-search-card__subtitle")
                    company_a = company_tag.find("a") if company_tag else None
                    company_name = company_a.text.strip() if company_a else ""
                    company_url = company_a["href"].strip() if company_a else ""
                    location = card.find("span", class_="job-search-card__location")
                    location = location.text.strip() if location else ""
                    benefit = card.find("span", class_="job-posting-benefits__text")
                    benefit = benefit.text.strip() if benefit else ""
                    posted = card.find("time", class_="job-search-card__listdate")
                    posted = posted.text.strip() if posted else ""

                    logging.info(f"Fetching job: {job_title}")
                    job_description, company_description = fetch_job_details(driver, job_url)

                    all_jobs.append({
                        "country": country,
                        "job_title": job_title,
                        "company_name": company_name,
                        "company_url": company_url,
                        "location": location,
                        "benefit": benefit,
                        "posted": posted,
                        "company_description": company_description,
                        "job_url": job_url,
                        "job_description": job_description
                    })
                except Exception as e:
                    logging.error(f"Error processing job card: {e}")
                    continue
    finally:
        driver.quit()
    
    return all_jobs


# --- FLASK API ROUTES ---
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "LinkedIn Job Scraper API"
    }), 200


@app.route('/scrape', methods=['POST'])
def scrape():
    """
    POST endpoint to scrape LinkedIn jobs
    
    Request Body:
    {
        "job_keyword": "junior developer",
        "countries": ["Belgium", "Netherlands"],
        "date_posted": "24h",
        "experience_levels": [],
        "workplace_types": ["2", "3"]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No JSON body provided",
                "code": "INVALID_REQUEST"
            }), 400
        
        # Get parameters with defaults
        job_keyword = data.get('job_keyword', DEFAULT_CONFIG['job_keyword'])
        countries = data.get('countries', DEFAULT_CONFIG['countries'])
        date_posted = data.get('date_posted', DEFAULT_CONFIG['date_posted'])
        experience_levels = data.get('experience_levels', DEFAULT_CONFIG['experience_levels'])
        workplace_types = data.get('workplace_types', DEFAULT_CONFIG['workplace_types'])
        
        # Validate parameters
        if not isinstance(countries, list) or len(countries) == 0:
            return jsonify({
                "error": "countries must be a non-empty list",
                "code": "INVALID_COUNTRIES"
            }), 400
        
        if date_posted not in ["any", "24h", "week", "month"]:
            return jsonify({
                "error": f"date_posted must be one of: any, 24h, week, month",
                "code": "INVALID_DATE_POSTED"
            }), 400
        
        logging.info(f"Starting scrape with keyword: {job_keyword}, countries: {countries}")
        
        # Execute scraping
        jobs = scrape_linkedin_jobs(job_keyword, countries, experience_levels, workplace_types, date_posted)
        
        return jsonify({
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "total_jobs": len(jobs),
            "parameters": {
                "job_keyword": job_keyword,
                "countries": countries,
                "date_posted": date_posted,
                "experience_levels": experience_levels,
                "workplace_types": workplace_types
            },
            "jobs": jobs
        }), 200
    
    except Exception as e:
        logging.error(f"Scraping error: {str(e)}")
        return jsonify({
            "error": str(e),
            "code": "SCRAPING_ERROR",
            "timestamp": datetime.now().isoformat()
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
