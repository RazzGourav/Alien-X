import os
from dotenv import load_dotenv
import requests
import time


# Load environment variables
load_dotenv()

# Configuration
OPENROUTER_GEMMA_API_KEY = os.getenv("OPENROUTER_GEMMA_API_KEY")
BASE_URL="https://openrouter.ai/api/v1"

class OpenRouterLLM:
    def __init__(self, api_key, temperature=0.1):
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "LangChain Integration",
            "Content-Type": "application/json"
        }
        self.temperature = temperature

    def __call__(self, prompt, image_url=None):
        # Convert PromptValue to string if needed
        if hasattr(prompt, 'to_string'):
            prompt = prompt.to_string()

        # Prepare payload (same as before)
        message_content = [{"type": "text", "text": str(prompt)}]
        if image_url:
            message_content.append({"type": "image_url", "image_url": {"url": image_url}})

        max_attempts = 3
        backoff_base = 1.5

        for attempt in range(1, max_attempts + 1):
            try:
                print(f"Sending request to OpenRouter API (attempt {attempt})...")
                response = requests.post(
                    f"{BASE_URL}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "mistralai/mistral-small-3.2-24b-instruct:free",
                        "messages": [{"role": "user", "content": message_content}],
                        "temperature": self.temperature,
                        "max_tokens": 1000,
                        "stream": False
                    },
                    timeout=30
                )

                print(f"OpenRouter API Response Status: {response.status_code}")

                if response.status_code == 200:
                    response_json = response.json()
                    if not response_json.get("choices"):
                        print(f"Unexpected API response format: {response_json}")
                        return "Sorry, received an unexpected response format."
                    content = response_json["choices"][0]["message"]["content"]
                    return content

                # On 5xx treat as transient and retry
                if 500 <= response.status_code < 600:
                    print(f"OpenRouter transient error {response.status_code}: {response.text}")
                    if attempt < max_attempts:
                        sleep_for = backoff_base ** attempt
                        print(f"Retrying after {sleep_for:.1f}s...")
                        time.sleep(sleep_for)
                        continue
                    else:
                        print("Max retries reached for OpenRouter.")
                        # break out to allow fallback handling below
                        break

                # Handle specific 4xx responses: 429 (rate limit) -> try fallback
                if response.status_code == 429:
                    print(f"OpenRouter rate-limited (429): {response.text} - falling back to secondary provider")
                    break
                # Other non-retryable 4xx errors: log & return friendly message
                print(f"OpenRouter API Error: {response.status_code} - {response.text}")
                return "Sorry, there was an error with the API request."

            except requests.exceptions.RequestException as e:
                print(f"Network or timeout error calling OpenRouter: {e}")
                if attempt < max_attempts:
                    sleep_for = backoff_base ** attempt
                    time.sleep(sleep_for)
                    continue
                else:
                    print("Max retries reached due to network errors.")
                    break

        # Fallback behavior after retries exhausted:
        # Try OpenAI as a secondary provider if an API key is present
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                # Use the new OpenAI client if available (openai>=1.0.0)
                try:
                    from openai import OpenAI
                    client = OpenAI(api_key=openai_key)
                    print("Calling OpenAI (new SDK) as fallback provider...")
                    resp = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": str(prompt)}],
                        temperature=self.temperature,
                        max_tokens=800
                    )
                    # response shape: resp.choices[0].message.content
                    content = None
                    try:
                        content = resp.choices[0].message.content
                    except Exception:
                        try:
                            content = resp.choices[0]['message']['content']
                        except Exception:
                            content = str(resp)
                    return content
                except Exception:
                    # Fall back to older openai import style for older packages
                    import openai
                    openai.api_key = openai_key
                    print("Calling OpenAI (legacy SDK) as fallback provider...")
                    resp = openai.ChatCompletion.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": str(prompt)}],
                        temperature=self.temperature,
                        max_tokens=800
                    )
                    try:
                        content = resp.choices[0].message.content
                    except Exception:
                        content = resp.choices[0].text if hasattr(resp.choices[0], 'text') else str(resp)
                    return content
            except Exception as e:
                print(f"OpenAI fallback failed: {e}")

        # Final graceful fallback
        return "Sorry, the language model is temporarily unavailable — please try again in a few minutes."


