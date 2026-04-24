import requests

def test_login():
    url = "http://localhost:8000/login"
    data = {
        "username": "ali@example.com",
        "password": "wrongpassword"
    }
    try:
        response = requests.post(url, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
