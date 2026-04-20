#!/usr/bin/env python3
"""
Simple test for Kimi Coding API.
Tests basic connectivity and model availability.
"""

import os
import requests


def test_kimi_coding():
    """Test Kimi Coding API connection using Anthropic format."""

    # Configuration for Kimi Coding (from user's existing script)
    api_key = os.environ.get("KIMI_API_KEY") or "sk-kimi-FoFm43vXrSMoxx9rL64dHcnUiL2GOgqIXeJdVUKhS8zNnwqoMlJLMSdpCTIB0jwp"
    api_url = "https://api.kimi.com/coding/v1/messages"
    model = "kimi-k2.5"

    print("🧪 Testing Kimi Coding API...")
    print(f"   API URL: {api_url}")
    print(f"   Model: {model}")
    print(f"   API Key: {api_key[:20]}...")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Test 1: Simple chat completion
    print("\n1️⃣ Testing chat completion...")
    try:
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Say 'Kimi API is working!' and nothing else."}
            ],
            "max_tokens": 50,
            "temperature": 0.3
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()

        # Anthropic format response
        if "content" in result and len(result["content"]) > 0:
            content = result["content"][0]["text"]
        elif "choices" in result:
            content = result["choices"][0]["message"]["content"]
        else:
            content = str(result)

        print(f"   ✅ Chat OK: {content}")
    except Exception as e:
        print(f"   ❌ Chat failed: {e}")

    # Test 2: JSON format response
    print("\n2️⃣ Testing JSON format response...")
    try:
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": 'Return a JSON object with {"status": "ok", "count": 5}. Only return JSON, no other text.'}
            ],
            "max_tokens": 100,
            "temperature": 0
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()

        if "content" in result and len(result["content"]) > 0:
            content = result["content"][0]["text"]
        elif "choices" in result:
            content = result["choices"][0]["message"]["content"]
        else:
            content = str(result)

        print(f"   ✅ JSON response OK: {content[:100]}")
    except Exception as e:
        print(f"   ❌ JSON response failed: {e}")

    # Test 3: News summary simulation
    print("\n3️⃣ Testing news summary...")
    try:
        prompt = """请用中文为以下新闻写一段摘要，100字以内：

标题：Nike reports strong Q4 earnings driven by digital sales growth

正文：Nike's Q4 revenue grew 12% year-over-year, exceeding analyst expectations. Digital sales increased 25%, becoming a key growth driver.

摘要："""

        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.3
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()

        if "content" in result and len(result["content"]) > 0:
            content = result["content"][0]["text"]
        elif "choices" in result:
            content = result["choices"][0]["message"]["content"]
        else:
            content = str(result)

        print(f"   ✅ Summary OK: {content[:80]}...")
    except Exception as e:
        print(f"   ❌ Summary failed: {e}")

    print("\n" + "="*50)
    print("Test complete!")


if __name__ == "__main__":
    # Allow overriding API key via environment
    if not os.environ.get("KIMI_API_KEY"):
        print("Using provided API key")
        os.environ["KIMI_API_KEY"] = "sk-kimi-FoFm43vXrSMoxx9rL64dHcnUiL2GOgqIXeJdVUKhS8zNnwqoMlJLMSdpCTIB0jwp"

    test_kimi_coding()
