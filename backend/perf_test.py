import requests
import time

URL = "http://127.0.0.1:8000/chat"
DATA = {
    "query": "What is the punishment for theft in PPC?",
    "session_id": "test_session_123"
}

# We need a token if it's protected, but let's check if we can bypass or use a test one
# Actually, I'll just check the login first or use a mock request if I can.
# Better: I'll add timing directly in the backend code since I have access.

def test_performance():
    start_time = time.time()
    try:
        # Note: This might fail if auth is required, but I'm checking timing
        print("Sending request to /chat...")
        # Since I don't have a valid token easily, I'll just add logs to main.py
        pass
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Instead of external test, I will add profiling to the code.
    pass
