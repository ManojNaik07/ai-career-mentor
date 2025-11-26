import requests
import json

# Test the Frontend Proxy (Port 3003)
url = "http://127.0.0.1:3003/api/roadmap"
payload = {
    "profile": {
        "age": "25",
        "education": "B.Tech",
        "interests": "AI, Coding"
    }
}

try:
    print(f"Testing Frontend Proxy at: {url}")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body Preview:")
    print(response.text[:200]) # Print first 200 chars
except Exception as e:
    print(f"Error: {e}")
