from models.llm import OpenRouterLLM
import os

llm = OpenRouterLLM(os.getenv("OPENROUTER_GEMMA_API_KEY"))
print("Calling LLM...")
res = llm("Say hi in one sentence.")
print("Result:\n", res)
