try:
    from google import genai
    print("SUCCESS: google-genai imported correctly")
    # client = genai.Client(api_key="MOCK")
    # print("SUCCESS: client initialized")
except ImportError as e:
    print(f"FAILURE: {e}")
except Exception as e:
    print(f"ERROR: {e}")
