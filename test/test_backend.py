import requests
import json

url = "http://localhost:3001/roadmap"
payload = {
    "profile": {
        "age": "25",
        "education": "B.Tech",
        "interests": "AI, Coding"
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
