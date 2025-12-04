"""
Test script for LinkedIn Job Scraper API
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_scrape_invalid():
    """Test scrape with invalid parameters"""
    print("\n\nTesting /scrape with invalid parameters...")
    payload = {
        "job_keyword": "developer",
        "countries": [],  # Invalid: empty list
        "date_posted": "invalid"  # Invalid: not a valid option
    }
    try:
        response = requests.post(f"{BASE_URL}/scrape", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_scrape_valid():
    """Test scrape with valid parameters (minimal)"""
    print("\n\nTesting /scrape with valid parameters...")
    payload = {
        "countries": ["Belgium"]
    }
    try:
        response = requests.post(f"{BASE_URL}/scrape", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        if response.status_code == 200:
            print(f"Total jobs found: {data['total_jobs']}")
            print(f"Response keys: {list(data.keys())}")
            if data['jobs']:
                print(f"\nFirst job sample:")
                print(json.dumps(data['jobs'][0], indent=2)[:500] + "...")
        else:
            print(f"Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("LinkedIn Job Scraper API - Test Suite")
    print("=" * 60)
    
    # Test 1: Health check
    health_ok = test_health()
    
    # Test 2: Invalid parameters
    invalid_ok = test_scrape_invalid()
    
    # Test 3: Valid parameters (comment out to skip actual scraping)
    # valid_ok = test_scrape_valid()
    
    print("\n" + "=" * 60)
    print("Test Results:")
    print(f"Health Check: {'✅ PASSED' if health_ok else '❌ FAILED'}")
    print(f"Invalid Parameters: {'✅ PASSED' if invalid_ok else '❌ FAILED'}")
    # print(f"Valid Scraping: {'✅ PASSED' if valid_ok else '❌ FAILED'}")
    print("=" * 60)
